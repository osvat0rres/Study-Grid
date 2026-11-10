
from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import QuizViewSet, save_quiz_attempt

router = DefaultRouter()
router.register("", QuizViewSet, basename="quiz")

urlpatterns = [
    path("attempts/", save_quiz_attempt, name="save_quiz_attempt"),
]

urlpatterns += router.urls