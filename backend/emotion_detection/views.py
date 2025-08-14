from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
import os
import json
import random
import time
import base64
import requests
from django.conf import settings

from .models import EmotionAnalysis, UserJournal, Recommendation, ChatSession, ChatMessage
from .serializers import (
    EmotionAnalysisSerializer, 
    UserJournalSerializer, 
    RecommendationSerializer,
    TextAnalysisSerializer,
    AudioAnalysisSerializer,
    FacialAnalysisSerializer,
    MultimodalAnalysisSerializer,
    ChatMessageSerializer,
    ChatSessionSerializer,
    ChatMessageCreateSerializer,
    ChatResponseSerializer
)
from .chatbot_service import chatbot

from .utils import analyze_text_sentiment

# Mock audio analysis function
def analyze_audio_sentiment(audio_file):
    """Analyze audio for emotions (mock implementation)."""
    if settings.USE_MOCK_ANALYSIS or not settings.HUGGINGFACE_API_TOKEN:
        start_time = time.time()
        time.sleep(0.4)
        emotions = ['happiness','sadness','anger','fear','surprise','disgust','neutral']
        scores = {e: random.uniform(0, 100) for e in emotions}
        total = sum(scores.values())
        for k in scores:
            scores[k] = (scores[k]/total)*100
        sentiment_score = scores['happiness'] - (scores['sadness'] + scores['anger'] + scores['fear'] + scores['disgust']) / 4
        return {
            **scores,
            'sentiment_score': max(-100,min(100,sentiment_score)),
            'processing_time_ms': int((time.time() - start_time) * 1000),
            'confidence_score': max(scores.values())/100.0
        }

    # Real call to HF audio emotion model (embedding-based classifier)
    start_time = time.time()
    try:
        headers = {
            'Authorization': f'Bearer {settings.HUGGINGFACE_API_TOKEN}'
        }
        model = settings.HF_AUDIO_EMOTION_MODEL
        # Read bytes
        audio_bytes = audio_file.read()
        audio_file.seek(0)
        files = { 'file': ('audio.wav', audio_bytes, 'audio/wav') }
        resp = requests.post(
            f'https://api-inference.huggingface.co/models/{model}',
            headers=headers,
            files=files,
            timeout=30
        )
        resp.raise_for_status()
        data = resp.json()
        scores = {k: 0.0 for k in ['happiness','sadness','anger','fear','surprise','disgust','neutral']}
        for item in data if isinstance(data, list) else []:
            label = str(item.get('label','')).lower()
            score = float(item.get('score',0))
            # Map common labels to our set
            if 'happy' in label:
                scores['happiness'] = max(scores['happiness'], score)
            elif 'sad' in label:
                scores['sadness'] = max(scores['sadness'], score)
            elif 'ang' in label or 'anger' in label:
                scores['anger'] = max(scores['anger'], score)
            elif 'fear' in label:
                scores['fear'] = max(scores['fear'], score)
            elif 'surprise' in label:
                scores['surprise'] = max(scores['surprise'], score)
            elif 'disgust' in label:
                scores['disgust'] = max(scores['disgust'], score)
            elif 'neutral' in label:
                scores['neutral'] = max(scores['neutral'], score)
        total = sum(scores.values()) or 1.0
        for k in scores:
            scores[k] = (scores[k]/total)*100
        sentiment_score = scores['happiness'] - (scores['sadness'] + scores['anger'] + scores['fear'] + scores['disgust']) / 4
        return {
            **scores,
            'sentiment_score': max(-100,min(100,sentiment_score)),
            'processing_time_ms': int((time.time() - start_time) * 1000),
            'confidence_score': max(scores.values())/100.0
        }
    except Exception:
        settings.USE_MOCK_ANALYSIS = True
        return analyze_audio_sentiment(audio_file)

# Mock facial analysis function
def analyze_facial_sentiment(image_file):
    """Analyze facial expressions for emotions (mock implementation)."""
    if settings.USE_MOCK_ANALYSIS or not settings.HUGGINGFACE_API_TOKEN:
        # Mock fallback
        start_time = time.time()
        time.sleep(0.4)
        dominant = random.choice(['happiness','sadness','anger','fear','surprise','disgust','neutral'])
        base = {k: random.uniform(5,20) for k in ['happiness','sadness','anger','fear','surprise','disgust','neutral']}
        base[dominant] = random.uniform(60,90)
        total = sum(base.values())
        for k in base:
            base[k] = (base[k]/total)*100
        sentiment_score = base['happiness'] - (base['sadness'] + base['anger'] + base['fear'] + base['disgust']) / 4
        return {
            **base,
            'sentiment_score': max(-100,min(100,sentiment_score)),
            'processing_time_ms': int((time.time() - start_time) * 1000),
            'confidence_score': max(base.values())/100.0
        }

    # Real call to HF image emotion model
    start_time = time.time()
    try:
        headers = {
            'Authorization': f'Bearer {settings.HUGGINGFACE_API_TOKEN}',
            'Content-Type': 'application/octet-stream'
        }
        model = settings.HF_FACE_EMOTION_MODEL
        # Read bytes
        image_bytes = image_file.read()
        image_file.seek(0)
        resp = requests.post(
            f'https://api-inference.huggingface.co/models/{model}',
            headers=headers,
            data=image_bytes,
            timeout=20
        )
        resp.raise_for_status()
        data = resp.json()
        # Expect list of {label, score}
        scores = {k: 0.0 for k in ['happiness','sadness','anger','fear','surprise','disgust','neutral']}
        for item in data if isinstance(data, list) else []:
            label = str(item.get('label','')).lower()
            score = float(item.get('score',0))
            if label in scores:
                scores[label] = max(scores[label], score)
        total = sum(scores.values()) or 1.0
        for k in scores:
            scores[k] = (scores[k]/total)*100
        sentiment_score = scores['happiness'] - (scores['sadness'] + scores['anger'] + scores['fear'] + scores['disgust']) / 4
        return {
            **scores,
            'sentiment_score': max(-100,min(100,sentiment_score)),
            'processing_time_ms': int((time.time() - start_time) * 1000),
            'confidence_score': max(scores.values())/100.0
        }
    except Exception:
        settings.USE_MOCK_ANALYSIS = True
        return analyze_facial_sentiment(image_file)

# Mock multimodal analysis function
def analyze_multimodal(text=None, audio_file=None, image_file=None):
    """Analyze emotions from multiple sources and combine results (mock implementation)."""
    results = {}
    weights = {}
    
    # Analyze each available modality
    if text:
        results['text'] = analyze_text_sentiment(text)
        weights['text'] = 0.4  # Text has high weight in multimodal analysis
    
    if audio_file:
        results['audio'] = analyze_audio_sentiment(audio_file)
        weights['audio'] = 0.3  # Audio has medium weight
    
    if image_file:
        results['facial'] = analyze_facial_sentiment(image_file)
        weights['facial'] = 0.3  # Facial has medium weight
    
    # If no modalities provided, return error
    if not results:
        return None
    
    # Normalize weights based on available modalities
    total_weight = sum(weights.values())
    for key in weights:
        weights[key] /= total_weight
    
    # Combine results with weighted average
    combined = {
        'happiness': 0,
        'sadness': 0,
        'anger': 0,
        'fear': 0,
        'surprise': 0,
        'disgust': 0,
        'neutral': 0,
        'sentiment_score': 0,
        'confidence_score': 0
    }
    
    for modality, result in results.items():
        weight = weights[modality]
        combined['happiness'] += result['happiness'] * weight
        combined['sadness'] += result['sadness'] * weight
        combined['anger'] += result['anger'] * weight
        combined['fear'] += result['fear'] * weight
        combined['surprise'] += result['surprise'] * weight
        combined['disgust'] += result['disgust'] * weight
        combined['neutral'] += result['neutral'] * weight
        combined['sentiment_score'] += result['sentiment_score'] * weight
        combined['confidence_score'] += result['confidence_score'] * weight
    
    # Add processing metadata
    combined['processing_time_ms'] = sum(result.get('processing_time_ms', 0) for result in results.values())
    combined['modalities_used'] = list(results.keys())
    
    return combined

# Function to generate recommendations based on emotion analysis
def generate_recommendations(emotion_data):
    """Generate personalized recommendations based on emotion analysis."""
    recommendations = []
    
    # Extract emotion scores
    happiness = emotion_data.get('happiness', 0)
    sadness = emotion_data.get('sadness', 0)
    anger = emotion_data.get('anger', 0)
    fear = emotion_data.get('fear', 0)
    disgust = emotion_data.get('disgust', 0)
    surprise = emotion_data.get('surprise', 0)
    neutral = emotion_data.get('neutral', 0)
    sentiment_score = emotion_data.get('sentiment_score', 0)
    
    # Recommendations for high negative emotions
    if sadness > 60 or fear > 60:
        recommendations.append({
            'type': 'activity',
            'content': 'Try a 5-minute mindfulness meditation to center yourself.'
        })
        recommendations.append({
            'type': 'resource',
            'content': 'Consider scheduling a session with a therapist to discuss these feelings.'
        })
    
    if anger > 60 or disgust > 60:
        recommendations.append({
            'type': 'activity',
            'content': 'Practice deep breathing exercises: inhale for 4 counts, hold for 4, exhale for 6.'
        })
        recommendations.append({
            'type': 'resource',
            'content': 'Check out the anger management techniques in our resource library.'
        })
    
    # Recommendations for moderate negative emotions
    if 40 <= sadness <= 60 or 40 <= fear <= 60:
        recommendations.append({
            'type': 'activity',
            'content': 'Go for a 15-minute walk outside to clear your mind.'
        })
        recommendations.append({
            'type': 'resource',
            'content': 'Listen to our guided relaxation audio.'
        })
    
    if 40 <= anger <= 60 or 40 <= disgust <= 60:
        recommendations.append({
            'type': 'activity',
            'content': "Write down what's bothering you, then physically crumple up the paper."
        })
    
    # Recommendations for positive emotions
    if happiness > 60:
        recommendations.append({
            'type': 'activity',
            'content': 'Share your positive feelings with someone you care about.'
        })
        recommendations.append({
            'type': 'journal_prompt',
            'content': 'What made you feel this way? How can you create more moments like this?'
        })
    
    # Recommendations for neutral or mixed emotions
    if neutral > 60 or (happiness > 40 and (sadness > 30 or fear > 30)):
        recommendations.append({
            'type': 'reflection',
            'content': "Take a moment to reflect on your emotional state. What's on your mind right now?"
        })
        recommendations.append({
            'type': 'activity',
            'content': 'Try a creative activity like drawing or listening to music.'
        })
    
    # General recommendations based on sentiment score
    if sentiment_score < -50:
        recommendations.append({
            'type': 'resource',
            'content': "Remember that it's okay to ask for help. Our support resources are available 24/7."
        })
    elif sentiment_score < 0:
        recommendations.append({
            'type': 'activity',
            'content': "List three things you're grateful for right now."
        })
    
    # If no specific recommendations were generated, add general ones
    if not recommendations:
        recommendations.append({
            'type': 'activity',
            'content': 'Take a moment to check in with yourself. How are you feeling right now?'
        })
        recommendations.append({
            'type': 'resource',
            'content': 'Explore our wellness resources for daily mental health tips.'
        })
    
    # Add a journal prompt if none exists yet
    if not any(rec['type'] == 'journal_prompt' for rec in recommendations):
        recommendations.append({
            'type': 'journal_prompt',
            'content': 'How have your emotions been affecting your daily life recently?'
        })
    
    return recommendations

# API Views
class TextAnalysisView(APIView):
    """API endpoint for text-based emotion analysis."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = TextAnalysisSerializer(data=request.data)
        if serializer.is_valid():
            text = serializer.validated_data['text']
            
            # Analyze text sentiment
            analysis_result = analyze_text_sentiment(text)
            
            # Generate recommendations
            recommendations = generate_recommendations(analysis_result)
            
            # Save analysis to database
            emotion_analysis = EmotionAnalysis.objects.create(
                user=request.user,
                source='text',
                happiness=analysis_result['happiness'],
                sadness=analysis_result['sadness'],
                anger=analysis_result['anger'],
                fear=analysis_result['fear'],
                surprise=analysis_result['surprise'],
                disgust=analysis_result['disgust'],
                neutral=analysis_result['neutral'],
                sentiment_score=analysis_result['sentiment_score'],
                raw_data=json.dumps(analysis_result)
            )
            
            # Save recommendations
            for rec in recommendations:
                Recommendation.objects.create(
                    emotion_analysis=emotion_analysis,
                    type=rec['type'],
                    content=rec['content']
                )
            
            # Prepare response
            response_data = {
                'analysis': analysis_result,
                'recommendations': recommendations,
                'analysis_id': emotion_analysis.id
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FacialAnalysisView(APIView):
    """API endpoint for facial expression-based emotion analysis."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = FacialAnalysisSerializer(data=request.data)
        if serializer.is_valid():
            image_file = serializer.validated_data['image_file']
            
            # Analyze facial expressions
            analysis_result = analyze_facial_sentiment(image_file)
            
            # Generate recommendations
            recommendations = generate_recommendations(analysis_result)
            
            # Save analysis to database
            emotion_analysis = EmotionAnalysis.objects.create(
                user=request.user,
                source='facial',
                happiness=analysis_result['happiness'],
                sadness=analysis_result['sadness'],
                anger=analysis_result['anger'],
                fear=analysis_result['fear'],
                surprise=analysis_result['surprise'],
                disgust=analysis_result['disgust'],
                neutral=analysis_result['neutral'],
                sentiment_score=analysis_result['sentiment_score'],
                raw_data=json.dumps(analysis_result)
            )
            
            # Save recommendations
            for rec in recommendations:
                Recommendation.objects.create(
                    emotion_analysis=emotion_analysis,
                    type=rec['type'],
                    content=rec['content']
                )
            
            # Prepare response
            response_data = {
                'analysis': analysis_result,
                'recommendations': recommendations,
                'analysis_id': emotion_analysis.id
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MultimodalAnalysisView(APIView):
    """API endpoint for multimodal emotion analysis (combining text, audio, and facial)."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = MultimodalAnalysisSerializer(data=request.data)
        if serializer.is_valid():
            text = serializer.validated_data.get('text')
            audio_file = serializer.validated_data.get('audio_file')
            image_file = serializer.validated_data.get('image_file')
            
            # Ensure at least one modality is provided
            if not any([text, audio_file, image_file]):
                return Response(
                    {'error': 'At least one of text, audio_file, or image_file must be provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Perform multimodal analysis
            analysis_result = analyze_multimodal(text, audio_file, image_file)
            
            # Generate recommendations
            recommendations = generate_recommendations(analysis_result)
            
            # Save analysis to database
            emotion_analysis = EmotionAnalysis.objects.create(
                user=request.user,
                source='multimodal',
                happiness=analysis_result['happiness'],
                sadness=analysis_result['sadness'],
                anger=analysis_result['anger'],
                fear=analysis_result['fear'],
                surprise=analysis_result['surprise'],
                disgust=analysis_result['disgust'],
                neutral=analysis_result['neutral'],
                sentiment_score=analysis_result['sentiment_score'],
                raw_data=json.dumps(analysis_result)
            )
            
            # Save recommendations
            for rec in recommendations:
                Recommendation.objects.create(
                    emotion_analysis=emotion_analysis,
                    type=rec['type'],
                    content=rec['content']
                )
            
            # Prepare response
            response_data = {
                'analysis': analysis_result,
                'recommendations': recommendations,
                'analysis_id': emotion_analysis.id
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserJournalView(APIView):
    """API endpoint for managing user journal entries."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Add emotion_analysis_id to the request data if provided
        data = request.data.copy()
        data['user'] = request.user.id
        
        serializer = UserJournalSerializer(data=data)
        if serializer.is_valid():
            journal_entry = serializer.save()
            
            # If text is provided, analyze sentiment and update the journal entry
            if 'content' in serializer.validated_data and serializer.validated_data['content']:
                text = serializer.validated_data['content']
                analysis_result = analyze_text_sentiment(text)
                
                # Create emotion analysis entry if not linked to an existing one
                if not journal_entry.emotion_analysis:
                    emotion_analysis = EmotionAnalysis.objects.create(
                        user=request.user,
                        source='journal',
                        happiness=analysis_result['happiness'],
                        sadness=analysis_result['sadness'],
                        anger=analysis_result['anger'],
                        fear=analysis_result['fear'],
                        surprise=analysis_result['surprise'],
                        disgust=analysis_result['disgust'],
                        neutral=analysis_result['neutral'],
                        sentiment_score=analysis_result['sentiment_score'],
                        raw_data=json.dumps(analysis_result)
                    )
                    
                    # Link journal entry to emotion analysis
                    journal_entry.emotion_analysis = emotion_analysis
                    journal_entry.save()
                    
                    # Generate and save recommendations
                    recommendations = generate_recommendations(analysis_result)
                    for rec in recommendations:
                        Recommendation.objects.create(
                            emotion_analysis=emotion_analysis,
                            type=rec['type'],
                            content=rec['content']
                        )
                    
                    # Include analysis and recommendations in response
                    return Response({
                        'journal_entry': serializer.data,
                        'analysis': analysis_result,
                        'recommendations': recommendations
                    }, status=status.HTTP_201_CREATED)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        # Get user's journal entries, ordered by date (newest first)
        journal_entries = UserJournal.objects.filter(user=request.user).order_by('-created_at')
        serializer = UserJournalSerializer(journal_entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RecommendationView(APIView):
    """API endpoint for retrieving recommendations."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, emotion_analysis_id=None):
        if emotion_analysis_id:
            # Get recommendations for a specific emotion analysis
            try:
                emotion_analysis = EmotionAnalysis.objects.get(id=emotion_analysis_id, user=request.user)
                recommendations = Recommendation.objects.filter(emotion_analysis=emotion_analysis)
                serializer = RecommendationSerializer(recommendations, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except EmotionAnalysis.DoesNotExist:
                return Response(
                    {'error': 'Emotion analysis not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Get latest recommendations for the user
            latest_analysis = EmotionAnalysis.objects.filter(user=request.user).order_by('-created_at').first()
            if latest_analysis:
                recommendations = Recommendation.objects.filter(emotion_analysis=latest_analysis)
                serializer = RecommendationSerializer(recommendations, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response([], status=status.HTTP_200_OK)

class EmotionAnalysisHistoryView(APIView):
    """API endpoint for retrieving user's emotion analysis history."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get parameters for filtering
        source = request.query_params.get('source', None)
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)
        limit = request.query_params.get('limit', 10)  # Default to 10 entries
        
        # Base query: user's emotion analyses ordered by date (newest first)
        analyses = EmotionAnalysis.objects.filter(user=request.user).order_by('-created_at')
        
        # Apply filters if provided
        if source:
            analyses = analyses.filter(source=source)
        if start_date:
            analyses = analyses.filter(created_at__gte=start_date)
        if end_date:
            analyses = analyses.filter(created_at__lte=end_date)
        
        # Apply limit
        try:
            limit = int(limit)
            analyses = analyses[:limit]
        except ValueError:
            pass  # If limit is not a valid integer, ignore it
        
        serializer = EmotionAnalysisSerializer(analyses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AudioAnalysisView(APIView):
    """API endpoint for audio-based emotion analysis."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = AudioAnalysisSerializer(data=request.data)
        if serializer.is_valid():
            audio_file = serializer.validated_data['audio_file']
            
            # Analyze audio sentiment
            analysis_result = analyze_audio_sentiment(audio_file)
            
            # Generate recommendations
            recommendations = generate_recommendations(analysis_result)
            
            # Save analysis to database
            emotion_analysis = EmotionAnalysis.objects.create(
                user=request.user,
                source='audio',
                happiness=analysis_result['happiness'],
                sadness=analysis_result['sadness'],
                anger=analysis_result['anger'],
                fear=analysis_result['fear'],
                surprise=analysis_result['surprise'],
                disgust=analysis_result['disgust'],
                neutral=analysis_result['neutral'],
                sentiment_score=analysis_result['sentiment_score'],
                raw_data=json.dumps(analysis_result)
            )
            
            # Save recommendations
            for rec in recommendations:
                Recommendation.objects.create(
                    emotion_analysis=emotion_analysis,
                    type=rec['type'],
                    content=rec['content']
                )
            
            # Prepare response
            response_data = {
                'analysis': analysis_result,
                'recommendations': recommendations,
                'analysis_id': emotion_analysis.id
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChatMessageView(APIView):
    """API endpoint for sending messages to the AI chatbot."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Send a message to the AI chatbot and get a response."""
        serializer = ChatMessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            user_message = serializer.validated_data['content']
            session_id = serializer.validated_data.get('session_id')
            
            try:
                # Process message through AI chatbot
                response_data = chatbot.process_message(
                    user_message=user_message,
                    user=request.user,
                    session_id=session_id
                )
                
                return Response(response_data, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response(
                    {'error': f'Failed to process message: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatSessionView(APIView):
    """API endpoint for managing chat sessions."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's chat sessions."""
        sessions = ChatSession.objects.filter(user=request.user, is_active=True)
        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new chat session."""
        session = ChatSession.objects.create(
            user=request.user,
            session_title=request.data.get('title', f'Chat Session {ChatSession.objects.filter(user=request.user).count() + 1}')
        )
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChatSessionDetailView(APIView):
    """API endpoint for managing individual chat sessions."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, session_id):
        """Get a specific chat session with all messages."""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            serializer = ChatSessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ChatSession.DoesNotExist:
            return Response(
                {'error': 'Chat session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, session_id):
        """Update a chat session (e.g., mark as inactive)."""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            
            if 'is_active' in request.data:
                session.is_active = request.data['is_active']
            
            if 'session_title' in request.data:
                session.session_title = request.data['session_title']
            
            session.save()
            serializer = ChatSessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except ChatSession.DoesNotExist:
            return Response(
                {'error': 'Chat session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, session_id):
        """Delete a chat session."""
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
            session.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ChatSession.DoesNotExist:
            return Response(
                {'error': 'Chat session not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ChatMessageFeedbackView(APIView):
    """API endpoint for providing feedback on chat messages."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, message_id):
        """Provide feedback on a chat message."""
        try:
            message = ChatMessage.objects.get(
                id=message_id,
                session__user=request.user,
                message_type='ai'
            )
            
            if 'is_helpful' in request.data:
                message.is_helpful = request.data['is_helpful']
            
            if 'user_rating' in request.data:
                rating = request.data['user_rating']
                if 1 <= rating <= 5:
                    message.user_rating = rating
            
            message.save()
            serializer = ChatMessageSerializer(message)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except ChatMessage.DoesNotExist:
            return Response(
                {'error': 'Message not found'},
                status=status.HTTP_404_NOT_FOUND
            )
