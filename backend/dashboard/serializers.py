from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Patient, Session, AnalysisResult, Report

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Patient
        fields = '__all__'

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'
        read_only_fields = ['created_at']

class AnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisResult
        fields = '__all__'
        read_only_fields = ['created_at']

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class DashboardStatsSerializer(serializers.Serializer):
    total_patients = serializers.IntegerField()
    total_sessions = serializers.IntegerField()
    high_risk_cases = serializers.IntegerField()
    avg_sentiment = serializers.FloatField()
    avg_stress_level = serializers.FloatField()

class AnalysisDataSerializer(serializers.Serializer):
    voice_analysis = serializers.DictField()
    text_sentiment = serializers.DictField()
    facial_emotion = serializers.DictField()

class RecentActivitySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()
    title = serializers.CharField()
    timestamp = serializers.DateTimeField()
    patient_name = serializers.CharField()
