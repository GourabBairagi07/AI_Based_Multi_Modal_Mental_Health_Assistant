from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from .models import User, MentalHealthAssessment, MentalHealthSupporter, VideoSession
from .serializers import (
    UserSerializer, LoginSerializer, RegisterSerializer, 
    MentalHealthAssessmentSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, MentalHealthSupporterSerializer,
    VideoSessionSerializer, VideoSessionCreateSerializer, VideoSessionUpdateSerializer,
    TherapySessionSerializer, MeditationSessionSerializer, MoodJournalEntrySerializer
)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = authenticate(username=email, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def assessment(request):
    if request.method == 'GET':
        assessments = MentalHealthAssessment.objects.filter(user=request.user)
        serializer = MentalHealthAssessmentSerializer(assessments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = MentalHealthAssessmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def therapy_sessions(request):
    if request.method == 'GET':
        sessions = TherapySession.objects.filter(user=request.user)
        serializer = TherapySessionSerializer(sessions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TherapySessionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def therapy_session_detail(request, pk):
    try:
        session = TherapySession.objects.get(pk=pk, user=request.user)
    except TherapySession.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = TherapySessionSerializer(session)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = TherapySessionSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def meditation_sessions(request):
    if request.method == 'GET':
        sessions = MeditationSession.objects.filter(user=request.user)
        serializer = MeditationSessionSerializer(sessions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = MeditationSessionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def meditation_session_detail(request, pk):
    try:
        session = MeditationSession.objects.get(pk=pk, user=request.user)
    except MeditationSession.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = MeditationSessionSerializer(session)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = MeditationSessionSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def mood_journal(request):
    if request.method == 'GET':
        entries = MoodJournalEntry.objects.filter(user=request.user)
        serializer = MoodJournalEntrySerializer(entries, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = MoodJournalEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def mood_journal_detail(request, pk):
    try:
        entry = MoodJournalEntry.objects.get(pk=pk, user=request.user)
    except MoodJournalEntry.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = MoodJournalEntrySerializer(entry)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = MoodJournalEntrySerializer(entry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crisis_alert(request):
    """Send crisis alert email to guardian"""
    try:
        user = request.user
        if not user.guardian_email:
            return Response({'error': 'No guardian email configured'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get location if provided
        location_data = request.data.get('location', {})
        location_text = ""
        if location_data:
            lat = location_data.get('latitude')
            lon = location_data.get('longitude')
            if lat and lon:
                location_text = f"\n\nLocation: https://maps.google.com/?q={lat},{lon}"
        
        # Send email
        subject = f"CRISIS ALERT - {user.full_name or user.email} needs immediate assistance"
        message = f"""
        CRISIS ALERT
        
        {user.full_name or user.email} has triggered a crisis alert and may need immediate assistance.
        
        User Details:
        - Email: {user.email}
        - Phone: {user.phone_number or 'Not provided'}
        
        Please contact them immediately and ensure their safety.
        
        If this is an emergency, please contact local emergency services.
        
        {location_text}
        
        This is an automated alert from the Mental Health Platform.
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.CRISIS_ALERT_FROM_EMAIL,
            recipient_list=[user.guardian_email],
            fail_silently=False,
        )
        
        return Response({'message': 'Crisis alert sent successfully'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Video Call Views
class MentalHealthSupporterListView(generics.ListAPIView):
    """List all available mental health supporters"""
    serializer_class = MentalHealthSupporterSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = MentalHealthSupporter.objects.filter(status='available')
        
        # Filter by specialization if provided
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(specialization=specialization)
        
        # Filter by language if provided
        language = self.request.query_params.get('language', None)
        if language:
            queryset = queryset.filter(languages__contains=[language])
        
        # Filter by crisis specialist if needed
        crisis_related = self.request.query_params.get('crisis_related', None)
        if crisis_related == 'true':
            queryset = queryset.filter(specialization='crisis_specialist')
        
        return queryset.order_by('-average_rating', '-total_sessions')

class MentalHealthSupporterDetailView(generics.RetrieveAPIView):
    """Get details of a specific mental health supporter"""
    queryset = MentalHealthSupporter.objects.all()
    serializer_class = MentalHealthSupporterSerializer
    permission_classes = [IsAuthenticated]

class VideoSessionCreateView(generics.CreateAPIView):
    """Create a new video session"""
    serializer_class = VideoSessionCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save()

class VideoSessionDetailView(generics.RetrieveUpdateAPIView):
    """Get and update video session details"""
    serializer_class = VideoSessionUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return VideoSession.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return VideoSessionUpdateSerializer
        return VideoSessionSerializer

class VideoSessionListView(generics.ListAPIView):
    """List user's video sessions"""
    serializer_class = VideoSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return VideoSession.objects.filter(user=self.request.user).order_by('-requested_at')

class UserDetailView(generics.RetrieveAPIView):
    """Retrieve user details"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        # Only allow users to view their own profile or admin to view any profile
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, id=self.kwargs['id'])
        # Check if the user has permission to view this profile
        self.check_object_permissions(self.request, obj)
        return obj

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_video_session(request, session_id):
    """Start a video session"""
    try:
        session = VideoSession.objects.get(id=session_id, user=request.user)
        if session.status == 'waiting':
            session.start_session()
            return Response({
                'message': 'Session started successfully',
                'room_url': session.room_url,
                'session': VideoSessionSerializer(session).data
            })
        else:
            return Response({'error': 'Session cannot be started'}, status=status.HTTP_400_BAD_REQUEST)
    except VideoSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_video_session(request, session_id):
    """End a video session"""
    try:
        session = VideoSession.objects.get(id=session_id, user=request.user)
        if session.status == 'active':
            session.end_session()
            return Response({
                'message': 'Session ended successfully',
                'session': VideoSessionSerializer(session).data
            })
        else:
            return Response({'error': 'Session cannot be ended'}, status=status.HTTP_400_BAD_REQUEST)
    except VideoSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
