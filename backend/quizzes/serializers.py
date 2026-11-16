
from rest_framework import serializers
from .models import Quiz, Question, Choice, QuizAttempt, QuizAttemptAnswer


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "choice_text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "question_text",
            "explanation",
            "choices",
        ]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "source_text",
            "created_at",
            "questions",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "questions",
        ]
        
        
class QuizAttemptSerializer(serializers.ModelSerializer):
     # Return the quiz title instead of displaying only its ID
    quiz_title = serializers.CharField(
        source="quiz.title",
        read_only=True
    )
    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "user",
            "quiz",
            "quiz_title",
            "score",
            "total_questions",
            "percentage",
            "completed_at",
        ]
        
        read_only_fields = [
            "id",
            "user",
            "completed_at",
        ]
        
class QuizAttemptAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttemptAnswer
        fields = [
            "id",
            "attempt",
            "question",
            "selected_answer",
            "is_correct",
        ]
        
        read_only_fields = ["id", 'is_correct']
        
        
class QuizAttemptAnswerReviewSerializer(serializers.ModelSerializer):
    
    question_text = serializers.CharField(
        source = "question.question_text",
        read_only =True
    )
    
    correct_answer = serializers.SerializerMethodField()
    
    explanation = serializers.CharField(
        source="question.explanation",
        read_only=True
    )
    
    class Meta:
        model = QuizAttemptAnswer
        fields = [
             "id",
            "question_text",
            "selected_answer",
            "correct_answer",
            "is_correct",
            "explanation",
        ]
        
        def get_correct_answer(self, obj):
            correct_choice = obj.question.choices.filter(
                is_correct=True
            ).first()
            
            if correct_choice:
                return correct_choice.choice_text
            return None
        
class QuizAttemptReviewSerializer(serializers.ModelSerializer):
    
    quiz_title = serializers.CharField(
        source = "quiz.title",
        read_only=True
    )
    
    
    answers = QuizAttemptAnswerReviewSerializer(
        many=True,
        read_only = True
    )
    
    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "quiz_title",
            "score",
            "total_questions",
            "percentage",
            "completed_at",
            "answers",
        ]
    
    