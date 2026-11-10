
from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import QuizViewSet, save_quiz_attempt, quiz_history

router = DefaultRouter()
router.register("", QuizViewSet, basename="quiz")

urlpatterns = [
    path("attempts/", save_quiz_attempt, name="save_quiz_attempt"),
    path("history/", quiz_history, name="quiz_history"),
]

urlpatterns += router.urls