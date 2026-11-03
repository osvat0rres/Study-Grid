from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from .serializer import UserSerializer

# Create your views here.

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class CurrentUserView(APIView):

    # Only authenticated users can access this endpoint
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # request.user represents the user authenticated by JWT
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })