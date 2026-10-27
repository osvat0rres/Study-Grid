from django.contrib import admin
from .models import Quiz, Questions, Choice

# Register your models here.

admin.site.register(Quiz)
admin.site.register(Questions)
admin.site.register(Choice)