from rest_framework.permissions import AllowAny
from rest_framework import generics
from .serializer import UserSerializer

# Create your views here.

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
