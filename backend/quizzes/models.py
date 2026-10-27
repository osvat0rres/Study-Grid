from django.db import models
from django.conf import settings

# Create your models here.
class Quiz(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, 
                             on_delete=models.CASCADE, related_name="quizzes",)
    title = models.CharField(max_length=255)
    source_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"

class Questions(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    questions_text = models.TextField()
    
    def __str__(self):
        return self.question_text[:80]
    
class Choice(models.Model):
    question = models.ForeignKey(Questions, on_delete=models.CASCADE, related_name="questions")
    choice_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return self.choice_text
 