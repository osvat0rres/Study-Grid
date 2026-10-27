from rest_framework import serializers
from .models import Questions, Quiz, Choice

class ChoiceSerializers(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id","question", "choice_text", "is_correct"]
        

class QuestionSerializers(serializers.ModelSerializer):
    choices = ChoiceSerializers(many=True, read_only=True)
    
    class Meta:
        model = Questions
        fields = ["id", "questions_text", "choice"]
        
class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializers(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = ["id", "title", "source_text","created_at", "questions"]
        read_only_fields = ["id", "created_at", "questions"]