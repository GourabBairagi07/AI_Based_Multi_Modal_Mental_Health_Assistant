from django.db import models
from django.contrib.auth.models import User

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.user.email})"

class Session(models.Model):
    SESSION_TYPES = [
        ('voice', 'Voice Analysis'),
        ('text', 'Text Analysis'),
        ('facial', 'Facial Analysis'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='sessions')
    session_type = models.CharField(max_length=10, choices=SESSION_TYPES)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_session_type_display()} - {self.patient.user.get_full_name()}"

class AnalysisResult(models.Model):
    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name='analysis_result')
    sentiment_score = models.FloatField(help_text="Sentiment score from -1 (negative) to 1 (positive)")
    emotion = models.CharField(max_length=50, help_text="Dominant emotion detected")
    stress_level = models.FloatField(help_text="Stress level from 0 (low) to 1 (high)")
    keywords = models.JSONField(help_text="List of important keywords", default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis for {self.session}"

class Report(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.patient.user.get_full_name()}"
