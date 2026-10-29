
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from documents.models import Document
from .models import Quiz, Question, Choice
from .serializers import QuizSerializer
from .ai_services import generate_quiz_questions


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