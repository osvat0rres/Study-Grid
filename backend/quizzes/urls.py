
from rest_framework.routers import DefaultRouter
from django.urls import path

from . import views

router = DefaultRouter()
router.register("", views.QuizViewSet, basename="quiz")

urlpatterns = [
    path("attempts/", views.save_quiz_attempt, name="save_quiz_attempt"),
    path("history/", views.quiz_history, name="quiz_history"),
    path( "attempts/<int:attempt_id>/review/", views.quiz_attempt_review, name="quiz-attempt-review")
]

urlpatterns += router.urls