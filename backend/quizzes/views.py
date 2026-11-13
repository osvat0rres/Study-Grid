
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from documents.models import Document
from .models import Quiz, Question, Choice, QuizAttempt, QuizAttemptAnswer
from .serializers import QuizSerializer, QuizAttemptSerializer
from .ai_services import generate_quiz_questions

from django.db import transaction


class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(
            user=self.request.user
        ).prefetch_related("questions__choices")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"], url_path="generate")
    def generate(self, request):
        document_id = request.data.get("document_id")
        num_questions = request.data.get("num_questions", 5)
        title = request.data.get("title")

        # Validate the document ID.
        if document_id is None:
            return Response(
                {"error": "document_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            document_id = int(document_id)
        except (ValueError, TypeError):
            return Response(
                {"error": "document_id must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate the number of questions.
        try:
            num_questions = int(num_questions)
        except (ValueError, TypeError):
            return Response(
                {"error": "num_questions must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not 1 <= num_questions <= 20:
            return Response(
                {"error": "num_questions must be between 1 and 20."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Users may only generate quizzes from their own documents.
        document = get_object_or_404(
            Document,
            id=document_id,
            user=request.user,
        )

        source_text = document.extracted_text.strip()

        if not source_text:
            return Response(
                {"error": "This document contains no extractable text."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ask Ollama to generate the questions.
        try:
            questions_data = generate_quiz_questions(
                source_text,
                num_questions=num_questions,
            )
        except (ValueError, RuntimeError) as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        quiz_title = title or f"Quiz - {document.title}"

        # Save the quiz and its questions and choices together.
        with transaction.atomic():
            quiz = Quiz.objects.create(
                user=request.user,
                title=quiz_title,
                source_text=source_text,
            )

            for question_data in questions_data:
                question = Question.objects.create(
                    quiz=quiz,
                    question_text=question_data["question_text"],
                    explanation=question_data["explanation"],
                )

                for choice_text in question_data["choices"]:
                    Choice.objects.create(
                        question=question,
                        choice_text=choice_text,
                        is_correct=(
                            choice_text == question_data["correct_answer"]
                        ),
                    )

        return Response(
            QuizSerializer(quiz, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
 
#This only allows HTTP POST request
@api_view(["POST"])
#Only authenticated users can submit quiz attempts
@permission_classes([IsAuthenticated])
def save_quiz_attempt(request):
    
    # Reciving the data "request.data" contains the information sent by react 
    quiz_id = request.data.get("quiz_id")
    answers = request.data.get("answers")

    # Validate required information
    if quiz_id is None or answers is None:
        return Response(
            {"error": "quiz_id and answers are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate answers format
    if not isinstance(answers, list):
        return Response(
            {"error": "Answers must be a list."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find the quiz
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response(
            {"error": "Quiz not found."},
            status=status.HTTP_404_NOT_FOUND
        )
        
    # Gettings the questions
    questions = quiz.questions.all()
    # Gets the number of questions
    total_questions = questions.count()

    if total_questions == 0:
        return Response(
            {"error": "This quiz has no questions."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Make sure the student answered every question
    if len(answers) != total_questions:
        return Response(
            {"error": "Please submit an answer for every question."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate and calculate the score on the backend
    answer_records = []
    score = 0
    answered_question_ids = set()
    
    """
        This loops goes through every answer submitted by React, one at a time.
        " if question_id is None or selected_answer is None" Prevents duplicated answers 
    """
    for answer in answers:

        question_id = answer.get("question_id")
        selected_answer = answer.get("selected_answer")

        if question_id is None or selected_answer is None:
            return Response(
                {"error": "Each answer requires question_id and selected_answer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent duplicate answers
        if question_id in answered_question_ids:
            return Response(
                {"error": "Duplicate question answers detected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        answered_question_ids.add(question_id)

        # Make sure the question belongs to this quiz
        question = questions.filter(id=question_id).first()

        if question is None:
            return Response(
                {"error": "Invalid question for this quiz."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find the selected choice
        choice = question.choices.filter(
            choice_text=selected_answer
        ).first()

        if choice is None:
            return Response(
                {"error": "Invalid answer choice."},
                status=status.HTTP_400_BAD_REQUEST
            )

        is_correct = choice.is_correct

        if is_correct:
            score += 1
            
        '''
            Temporarily storing the answer
            This adds teh answer to out temporary list. We are not saving it to 
            PostgresSQl yet, we are collecting all validated answers first.
            This is useful becouse we can validate the entire quiz before creating
            the attempt and its answer records. 
        '''
        
        answer_records.append({
            "question": question,
            "selected_answer": selected_answer,
            "is_correct": is_correct
        })

    # Make sure every question was answered
    if answered_question_ids != set(questions.values_list("id", flat=True)):
        return Response(
            {"error": "Some quiz questions are missing."},
            status=status.HTTP_400_BAD_REQUEST
        )

    percentage = round((score / total_questions) * 100, 2)
    
    '''
        Saving the attempt and answers. This introduces a database trasnaction.
        A trasnaction allowsa multiple database operations to be treated as one unit
        I something fails while saving the anser, Django can roll back the transaction
        of leaving a partially saved attempt
    '''
    with transaction.atomic():

        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            total_questions=total_questions,
            percentage=percentage
        )

        for record in answer_records:
            QuizAttemptAnswer.objects.create(
                attempt=attempt,
                question=record["question"],
                selected_answer=record["selected_answer"],
                is_correct=record["is_correct"]
            )

    serializer = QuizAttemptSerializer(attempt)

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED
    )
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def quiz_history(request):
    # Get only the attempt belonging to the logged-in user
    attempt = QuizAttempt.objects.filter(
        user=request.user
        # The minus sign means quiz sttempts first
    ).order_by("-completed_at")
    
    # Convert the attempst into JSON
    serilaizer = QuizAttemptSerializer(attempt, many=True)
    
    return Response(serilaizer.data)