from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)


urlpatterns = [
    path("register/", views.RegisterView.as_view(),name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("me/", views.CurrentUserView.as_view(), name="current_user"),
]
