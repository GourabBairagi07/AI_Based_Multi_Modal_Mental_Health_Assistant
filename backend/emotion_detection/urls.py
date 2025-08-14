from django.urls import path
from .views import (
    TextAnalysisView,
    AudioAnalysisView,
    FacialAnalysisView,
    MultimodalAnalysisView,
    UserJournalView,
    RecommendationView,
    EmotionAnalysisHistoryView,
    ChatMessageView,
    ChatSessionView,
    ChatSessionDetailView,
    ChatMessageFeedbackView
)

urlpatterns = [
    # Emotion analysis endpoints
    path('text-analysis/', TextAnalysisView.as_view(), name='analyze_text'),
    path('audio-analysis/', AudioAnalysisView.as_view(), name='analyze_audio'),
    path('facial-analysis/', FacialAnalysisView.as_view(), name='analyze_facial'),
    path('multimodal-analysis/', MultimodalAnalysisView.as_view(), name='analyze_multimodal'),
    
    # Journal endpoints
    path('journal/', UserJournalView.as_view(), name='user_journal'),
    
    # Recommendation endpoints
    path('recommendations/', RecommendationView.as_view(), name='recommendations'),
    path('recommendations/<int:emotion_analysis_id>/', RecommendationView.as_view(), name='recommendations_by_analysis'),
    
    # History endpoints
    path('history/', EmotionAnalysisHistoryView.as_view(), name='emotion_history'),
    
    # Chatbot endpoints
    path('chat/message/', ChatMessageView.as_view(), name='chat_message'),
    path('chat/sessions/', ChatSessionView.as_view(), name='chat_sessions'),
    path('chat/sessions/<int:session_id>/', ChatSessionDetailView.as_view(), name='chat_session_detail'),
    path('chat/messages/<int:message_id>/feedback/', ChatMessageFeedbackView.as_view(), name='chat_message_feedback'),
]