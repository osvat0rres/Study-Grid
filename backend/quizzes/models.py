
from django.db import models
from django.conf import settings


class Quiz(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="quizzes",
    )
    title = models.CharField(max_length=255)
    source_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"


class Question(models.Model):
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    question_text = models.TextField()
    explanation = models.TextField(blank=True)

    def __str__(self):
        return self.question_text[:80]


class Choice(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="choices",
    )
    choice_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.choice_text
    

class QuizAttempt(models.Model):
    user = models.ForeignKey (settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name="quiz_attemps")
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE,
                             related_name="attemps")
    score = models.PositiveIntegerField()
    total_questions = models.PositiveIntegerField()
    percentage = models.FloatField()
    completed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} - {self.percentage}"



class QuizAttemptAnswer(models.Model):
    
    # Connects the answer to a specific quiz attempt
    attempt = models.ForeignKey(
        QuizAttempt, 
        on_delete=models.CASCADE,
        related_name="answer"
    )
    
    # Identifies the questions being answered 
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE   
    )
    
    # Saves the student's selected answer
    selected_answer = models.CharField(max_length=255)
    
    #Saves wheather the answer was correct
    is_correct = models.BooleanField()
    def __str__(self):
        return f"{self.attempt} - {self.question}"