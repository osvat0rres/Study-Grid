
from rest_framework import serializers
from .models import Quiz, Question, Choice, QuizAttempt


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
    class Meta:
        model = QuizAttempt
        fileds = [
            "id",
            "user",
            "quiz",
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