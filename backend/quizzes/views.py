from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Quiz
from .serializers import QuizSerializer
# Create your views here.

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Quiz.objects.filter(
            user=self.request.user
        ).prefetch_related("questions__choices")
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    