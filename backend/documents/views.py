
from pathlib import Path

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import Document
from .serializers import DocumentSerializer
from .utils import extract_text


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        document = serializer.save(user=self.request.user)

        extension = Path(document.file.name).suffix.lower()

        if extension not in [".pdf", ".txt"]:
            document.delete()
            raise ValidationError("Only PDF and TXT files are allowed.")

        document.extracted_text = extract_text(document.file.path)
        document.save()