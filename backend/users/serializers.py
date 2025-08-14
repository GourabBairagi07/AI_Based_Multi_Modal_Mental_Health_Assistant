from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import MentalHealthAssessment, MentalHealthSupporter, VideoSession, TherapySession, MeditationSession, MoodJournalEntry

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'full_name', 'guardian_email', 'phone_number',
            'date_of_birth', 'emergency_contact', 'emergency_phone', 'stress_level',
            'anxiety_level', 'depression_level', 'preferred_language',
            'notification_preferences', 'date_joined', 'last_login', 'is_active',
            'is_staff', 'is_superuser'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_active', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'email': {'read_only': True},
            'username': {'read_only': True}
        }

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'confirm_password', 'guardian_email']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class MentalHealthAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentalHealthAssessment
        fields = ['id', 'date_taken', 'stress_level', 'anxiety_level', 
                 'depression_level', 'sleep_quality', 'energy_level', 'notes']
        read_only_fields = ['id', 'date_taken']


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class TherapySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapySession
        fields = ['id', 'date', 'therapist_name', 'session_notes', 'goals', 'progress', 'duration', 'completed']
        read_only_fields = ['id', 'date']


class MeditationSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeditationSession
        fields = ['id', 'date', 'duration', 'meditation_type', 'completed', 'notes', 'mood_before', 'mood_after']
        read_only_fields = ['id', 'date']


class MoodJournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodJournalEntry
        fields = ['id', 'date', 'mood', 'mood_intensity', 'triggers', 'thoughts', 'activities', 'gratitude']
        read_only_fields = ['id', 'date']


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField()


class MentalHealthSupporterSerializer(serializers.ModelSerializer):
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_available = serializers.ReadOnlyField()
    
    class Meta:
        model = MentalHealthSupporter
        fields = [
            'id', 'name', 'email', 'phone', 'profile_picture', 'specialization', 
            'specialization_display', 'languages', 'years_experience', 'license_number',
            'certifications', 'status', 'status_display', 'is_available', 'last_active',
            'working_hours_start', 'working_hours_end', 'timezone', 'bio', 
            'areas_of_expertise', 'approach', 'average_rating', 'total_sessions',
            'total_reviews', 'hourly_rate', 'session_duration', 'created_at'
        ]


class VideoSessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    supporter = MentalHealthSupporterSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = VideoSession
        fields = [
            'id', 'session_id', 'user', 'supporter', 'status', 'status_display',
            'requested_at', 'started_at', 'ended_at', 'duration', 'topic', 'notes',
            'crisis_related', 'room_url', 'recording_url', 'user_rating', 
            'user_feedback', 'supporter_notes', 'created_at'
        ]
        read_only_fields = ['session_id', 'user', 'requested_at', 'created_at']


class VideoSessionCreateSerializer(serializers.ModelSerializer):
    supporter_id = serializers.IntegerField(write_only=True)
    topic = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = VideoSession
        fields = ['supporter_id', 'topic', 'crisis_related']
    
    def create(self, validated_data):
        supporter_id = validated_data.pop('supporter_id')
        user = self.context['request'].user
        
        try:
            supporter = MentalHealthSupporter.objects.get(id=supporter_id, status='available')
        except MentalHealthSupporter.DoesNotExist:
            raise serializers.ValidationError("Supporter not available")
        
        # Generate unique session ID
        import uuid
        session_id = f"session_{uuid.uuid4().hex[:8]}"
        
        # Create room URL (simulated)
        room_url = f"https://meet.jit.si/{session_id}"
        
        session = VideoSession.objects.create(
            user=user,
            supporter=supporter,
            session_id=session_id,
            room_url=room_url,
            **validated_data
        )
        
        return session


class VideoSessionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoSession
        fields = ['status', 'user_rating', 'user_feedback']
    
    def update(self, instance, validated_data):
        # If status is being set to 'active', start the session
        if validated_data.get('status') == 'active' and instance.status == 'waiting':
            instance.start_session()
        # If status is being set to 'completed', end the session
        elif validated_data.get('status') == 'completed' and instance.status == 'active':
            instance.end_session()
        
        return super().update(instance, validated_data)