from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Q
from .models import Patient, Session, AnalysisResult, Report
from .serializers import (
    PatientSerializer, SessionSerializer, AnalysisResultSerializer,
    ReportSerializer, DashboardStatsSerializer, AnalysisDataSerializer,
    RecentActivitySerializer
)

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        # Calculate dashboard statistics
        total_patients = Patient.objects.count()
        total_sessions = Session.objects.count()
        
        # Get high risk cases (stress level > 0.7)
        high_risk_cases = AnalysisResult.objects.filter(stress_level__gt=0.7).count()
        
        # Calculate average sentiment and stress level
        avg_sentiment = AnalysisResult.objects.aggregate(
            avg=Avg('sentiment_score')
        )['avg'] or 0
        
        avg_stress_level = AnalysisResult.objects.aggregate(
            avg=Avg('stress_level')
        )['avg'] or 0

        data = {
            'total_patients': total_patients,
            'total_sessions': total_sessions,
            'high_risk_cases': high_risk_cases,
            'avg_sentiment': round(avg_sentiment, 2),
            'avg_stress_level': round(avg_stress_level, 2)
        }
        
        serializer = DashboardStatsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def analysis_data(self, request):
        # Get analysis data for charts
        # Voice analysis data
        voice_data = list(AnalysisResult.objects.filter(
            session__session_type='voice'
        ).values('emotion').annotate(
            count=Count('emotion')
        ))
        
        # Text sentiment data
        sentiment_data = list(AnalysisResult.objects.filter(
            session__session_type='text'
        ).values('sentiment_score').annotate(
            count=Count('id')
        ))
        
        # Facial emotion data
        facial_data = list(AnalysisResult.objects.filter(
            session__session_type='facial'
        ).values('emotion').annotate(
            count=Count('emotion')
        ))

        data = {
            'voice_analysis': voice_data,
            'text_sentiment': sentiment_data,
            'facial_emotion': facial_data
        }
        
        serializer = AnalysisDataSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        # Get recent sessions and reports
        recent_sessions = Session.objects.select_related('patient__user').order_by('-start_time')[:5]
        recent_reports = Report.objects.select_related('patient__user').order_by('-created_at')[:5]
        
        activities = []
        
        for session in recent_sessions:
            activities.append({
                'id': f'session_{session.id}',
                'type': 'session',
                'title': f"{session.get_session_type_display()} Session",
                'timestamp': session.start_time,
                'patient_name': f"{session.patient.user.first_name} {session.patient.user.last_name}"
            })
            
        for report in recent_reports:
            activities.append({
                'id': f'report_{report.id}',
                'type': 'report',
                'title': report.title,
                'timestamp': report.created_at,
                'patient_name': f"{report.patient.user.first_name} {report.patient.user.last_name}"
            })
        
        # Sort by timestamp and get top 5
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        activities = activities[:5]
        
        serializer = RecentActivitySerializer(activities, many=True)
        return Response(serializer.data)

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

class AnalysisResultViewSet(viewsets.ModelViewSet):
    queryset = AnalysisResult.objects.all()
    serializer_class = AnalysisResultSerializer
    permission_classes = [IsAuthenticated]

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
