
from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "subject",
            "file",
            "uploaded_at",
            "extracted_text",
        ]
        read_only_fields = [
            "id",
            "uploaded_at",
            "extracted_text",
        ]