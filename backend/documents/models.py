from django.db import models
from django.conf import settings 
# Create your models here.

class Document(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="study_notes/")
    extracted_text = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title