from rest_framework import serializers
from .models import EmotionAnalysis, UserJournal, Recommendation, ChatSession, ChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class EmotionAnalysisSerializer(serializers.ModelSerializer):
    dominant_emotion = serializers.SerializerMethodField()
    
    class Meta:
        model = EmotionAnalysis
        fields = ['id', 'user', 'timestamp', 'source', 'happiness', 'sadness', 'anger', 
                 'fear', 'surprise', 'disgust', 'neutral', 'sentiment_score', 
                 'text_input', 'audio_file_path', 'image_file_path', 
                 'processing_time_ms', 'confidence_score', 'dominant_emotion']
        read_only_fields = ['id', 'timestamp', 'user']
    
    def get_dominant_emotion(self, obj):
        return obj.dominant_emotion()


class UserJournalSerializer(serializers.ModelSerializer):
    emotion_analysis = EmotionAnalysisSerializer(read_only=True)
    
    class Meta:
        model = UserJournal
        fields = ['id', 'user', 'timestamp', 'title', 'content', 'emotion_analysis', 'tags']
        read_only_fields = ['id', 'timestamp', 'user', 'emotion_analysis']


class RecommendationSerializer(serializers.ModelSerializer):
    emotion_analysis = EmotionAnalysisSerializer(read_only=True)
    
    class Meta:
        model = Recommendation
        fields = ['id', 'user', 'timestamp', 'emotion_analysis', 'category', 
                 'title', 'description', 'resource_url', 'is_viewed', 'is_helpful']
        read_only_fields = ['id', 'timestamp', 'user', 'emotion_analysis']


class TextAnalysisSerializer(serializers.Serializer):
    """Serializer for text-based emotion analysis requests."""
    text = serializers.CharField(required=True)
    save_analysis = serializers.BooleanField(default=True)
    generate_recommendations = serializers.BooleanField(default=True)


class AudioAnalysisSerializer(serializers.Serializer):
    """Serializer for audio-based emotion analysis requests."""
    audio_file = serializers.FileField(required=True)
    save_analysis = serializers.BooleanField(default=True)
    generate_recommendations = serializers.BooleanField(default=True)


class FacialAnalysisSerializer(serializers.Serializer):
    """Serializer for facial-based emotion analysis requests."""
    image_file = serializers.ImageField(required=True)
    save_analysis = serializers.BooleanField(default=True)
    generate_recommendations = serializers.BooleanField(default=True)


class MultimodalAnalysisSerializer(serializers.Serializer):
    """Serializer for multimodal emotion analysis requests."""
    text = serializers.CharField(required=False, allow_blank=True)
    audio_file = serializers.FileField(required=False, allow_null=True)
    image_file = serializers.ImageField(required=False, allow_null=True)
    save_analysis = serializers.BooleanField(default=True)
    generate_recommendations = serializers.BooleanField(default=True)
    
    def validate(self, data):
        """Ensure at least one modality is provided."""
        if not data.get('text') and not data.get('audio_file') and not data.get('image_file'):
            raise serializers.ValidationError("At least one of text, audio_file, or image_file must be provided.")
        return data


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages."""
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'content', 'message_type', 'timestamp', 
            'ai_model_used', 'processing_time_ms', 'tokens_used',
            'sentiment_score', 'detected_emotions', 'is_helpful', 'user_rating'
        ]
        read_only_fields = [
            'id', 'timestamp', 'ai_model_used', 'processing_time_ms', 
            'tokens_used', 'sentiment_score', 'detected_emotions'
        ]


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for chat sessions."""
    messages = ChatMessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'created_at', 'updated_at', 'is_active', 'session_title',
            'total_messages', 'initial_mood', 'final_mood', 'messages', 'last_message'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_messages']
    
    def get_last_message(self, obj):
        """Get the last message in the session."""
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'message_type': last_msg.message_type,
                'timestamp': last_msg.timestamp
            }
        return None


class ChatMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new chat messages."""
    session_id = serializers.IntegerField(required=False)
    
    class Meta:
        model = ChatMessage
        fields = ['content', 'session_id']
    
    def validate(self, data):
        """Validate the chat message data."""
        content = data.get('content', '').strip()
        if not content:
            raise serializers.ValidationError("Message content cannot be empty.")
        
        if len(content) > 2000:
            raise serializers.ValidationError("Message content is too long (max 2000 characters).")
        
        return data


class ChatResponseSerializer(serializers.Serializer):
    """Serializer for AI chat responses."""
    message = ChatMessageSerializer()
    session = ChatSessionSerializer()
    suggestions = serializers.ListField(child=serializers.CharField(), required=False)
    crisis_detected = serializers.BooleanField(default=False)
    crisis_message = serializers.CharField(required=False)