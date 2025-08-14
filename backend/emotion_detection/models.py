from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class EmotionAnalysis(models.Model):
    """Model to store emotion analysis results from text, audio, and facial inputs."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emotion_analyses')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Source of the analysis
    SOURCE_CHOICES = [
        ('text', 'Text Analysis'),
        ('audio', 'Voice Analysis'),
        ('facial', 'Facial Analysis'),
        ('multimodal', 'Multimodal Analysis'),
    ]
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    
    # Emotion scores (0-100)
    happiness = models.FloatField(default=0)
    sadness = models.FloatField(default=0)
    anger = models.FloatField(default=0)
    fear = models.FloatField(default=0)
    surprise = models.FloatField(default=0)
    disgust = models.FloatField(default=0)
    neutral = models.FloatField(default=0)
    
    # Overall sentiment (-100 to 100, negative to positive)
    sentiment_score = models.FloatField(default=0)
    
    # Raw data for reference
    text_input = models.TextField(blank=True, null=True)
    audio_file_path = models.CharField(max_length=255, blank=True, null=True)
    image_file_path = models.CharField(max_length=255, blank=True, null=True)
    
    # Analysis metadata
    processing_time_ms = models.IntegerField(default=0)  # Time taken to process in milliseconds
    confidence_score = models.FloatField(default=0)  # Overall confidence in the analysis
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Emotion analyses'
    
    def __str__(self):
        return f"{self.get_source_display()} for {self.user.email} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
    
    def dominant_emotion(self):
        """Returns the dominant emotion based on scores."""
        emotions = {
            'happiness': self.happiness,
            'sadness': self.sadness,
            'anger': self.anger,
            'fear': self.fear,
            'surprise': self.surprise,
            'disgust': self.disgust,
            'neutral': self.neutral
        }
        return max(emotions, key=emotions.get)


class UserJournal(models.Model):
    """Model to store user journal entries with emotion analysis."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journal_entries')
    timestamp = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    
    # Associated emotion analysis
    emotion_analysis = models.OneToOneField(
        EmotionAnalysis, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='journal_entry'
    )
    
    # Tags for categorization
    tags = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.title} - {self.user.email} at {self.timestamp.strftime('%Y-%m-%d')}"


class Recommendation(models.Model):
    """Model to store recommendations based on emotion analysis."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Associated emotion analysis that triggered this recommendation
    emotion_analysis = models.ForeignKey(
        EmotionAnalysis,
        on_delete=models.CASCADE,
        related_name='recommendations'
    )
    
    CATEGORY_CHOICES = [
        ('exercise', 'Physical Exercise'),
        ('meditation', 'Meditation'),
        ('breathing', 'Breathing Techniques'),
        ('journaling', 'Journaling'),
        ('social', 'Social Connection'),
        ('professional', 'Professional Help'),
        ('resources', 'Mental Health Resources'),
        ('activities', 'Mood-Improving Activities'),
        ('other', 'Other')
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    resource_url = models.URLField(blank=True, null=True)
    
    # Has the user viewed this recommendation?
    is_viewed = models.BooleanField(default=False)
    
    # Has the user marked this as helpful?
    is_helpful = models.BooleanField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.title} for {self.user.email}"


class ChatSession(models.Model):
    """Model to store chat sessions between users and AI assistant."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Session metadata
    session_title = models.CharField(max_length=200, blank=True, null=True)
    total_messages = models.IntegerField(default=0)
    
    # User's emotional state during this session
    initial_mood = models.CharField(max_length=50, blank=True, null=True)
    final_mood = models.CharField(max_length=50, blank=True, null=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Chat session {self.id} - {self.user.email} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


class ChatMessage(models.Model):
    """Model to store individual chat messages."""
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Message content
    content = models.TextField()
    
    # Message type
    MESSAGE_TYPES = [
        ('user', 'User Message'),
        ('ai', 'AI Assistant'),
        ('system', 'System Message'),
    ]
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    
    # AI-specific fields
    ai_model_used = models.CharField(max_length=100, blank=True, null=True)
    processing_time_ms = models.IntegerField(default=0)
    tokens_used = models.IntegerField(default=0)
    
    # Sentiment analysis of the message
    sentiment_score = models.FloatField(null=True, blank=True)
    detected_emotions = models.JSONField(default=dict, blank=True)
    
    # User feedback
    is_helpful = models.BooleanField(null=True, blank=True)
    user_rating = models.IntegerField(null=True, blank=True)  # 1-5 scale
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.get_message_type_display()} at {self.timestamp.strftime('%H:%M')}"
