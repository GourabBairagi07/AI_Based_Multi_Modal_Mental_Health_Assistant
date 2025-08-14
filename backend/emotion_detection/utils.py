import os
import json
import requests
from django.conf import settings


def analyze_text_sentiment(text):
    """Analyze text sentiment using Hugging Face API or fallback to mock data."""
    if not text or not text.strip():
        return {
            'sentiment_score': 0,
            'happiness': 0,
            'sadness': 0,
            'anger': 0,
            'fear': 0,
            'surprise': 0,
            'disgust': 0,
            'neutral': 1.0
        }
    
    # Check if we should use real API or mock data
    use_mock = getattr(settings, 'USE_MOCK_ANALYSIS', True)
    api_token = getattr(settings, 'HUGGINGFACE_API_TOKEN', None)
    
    if not use_mock and api_token:
        try:
            return _call_huggingface_text_api(text)
        except Exception as e:
            print(f"Hugging Face API error: {e}")
            # Fallback to mock data
            pass
    
    # Mock sentiment analysis for demo
    return _mock_text_sentiment_analysis(text)


def _call_huggingface_text_api(text):
    """Call Hugging Face API for text emotion analysis."""
    api_token = settings.HUGGINGFACE_API_TOKEN
    model = getattr(settings, 'HF_TEXT_EMOTION_MODEL', 'j-hartmann/emotion-english-distilroberta-base')
    
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    url = f"https://api-inference.huggingface.co/models/{model}"
    
    response = requests.post(url, headers=headers, json={"inputs": text}, timeout=30)
    response.raise_for_status()
    
    result = response.json()
    
    # Process the response
    if isinstance(result, list) and len(result) > 0:
        emotions = result[0]
        if isinstance(emotions, list) and len(emotions) > 0:
            emotion_data = emotions[0]
            
            # Extract emotion scores
            emotion_scores = {}
            for item in emotion_data:
                if isinstance(item, dict) and 'label' in item and 'score' in item:
                    emotion_scores[item['label'].lower()] = item['score']
            
            # Map to our expected format
            return {
                'sentiment_score': _calculate_sentiment_score(emotion_scores),
                'happiness': emotion_scores.get('joy', 0),
                'sadness': emotion_scores.get('sadness', 0),
                'anger': emotion_scores.get('anger', 0),
                'fear': emotion_scores.get('fear', 0),
                'surprise': emotion_scores.get('surprise', 0),
                'disgust': emotion_scores.get('disgust', 0),
                'neutral': emotion_scores.get('neutral', 0)
            }
    
    # Fallback if response format is unexpected
    raise Exception("Unexpected API response format")


def _calculate_sentiment_score(emotion_scores):
    """Calculate overall sentiment score from emotion scores."""
    positive = emotion_scores.get('joy', 0) + emotion_scores.get('surprise', 0)
    negative = emotion_scores.get('sadness', 0) + emotion_scores.get('anger', 0) + emotion_scores.get('fear', 0) + emotion_scores.get('disgust', 0)
    
    # Normalize to -1 to 1 range
    total = positive + negative
    if total == 0:
        return 0
    
    return (positive - negative) / total


def _mock_text_sentiment_analysis(text):
    """Mock sentiment analysis for demo purposes."""
    import random
    
    # Simple keyword-based sentiment analysis
    text_lower = text.lower()
    
    # Positive keywords
    positive_words = ['happy', 'good', 'great', 'wonderful', 'excellent', 'amazing', 'love', 'like', 'enjoy', 'pleased', 'satisfied', 'content', 'grateful', 'blessed', 'excited', 'thrilled', 'joy', 'peace', 'calm', 'relaxed']
    
    # Negative keywords
    negative_words = ['sad', 'bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'frustrated', 'anxious', 'worried', 'scared', 'afraid', 'depressed', 'lonely', 'tired', 'exhausted', 'stressed', 'overwhelmed', 'hopeless', 'desperate']
    
    # Count positive and negative words
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    # Calculate sentiment score
    total_words = positive_count + negative_count
    if total_words == 0:
        sentiment_score = random.uniform(-0.2, 0.2)  # Slight random variation
    else:
        sentiment_score = (positive_count - negative_count) / total_words
    
    # Generate emotion scores based on sentiment
    base_emotions = {
        'happiness': max(0, sentiment_score * 0.8 + random.uniform(0, 0.2)),
        'sadness': max(0, -sentiment_score * 0.8 + random.uniform(0, 0.2)),
        'anger': max(0, -sentiment_score * 0.6 + random.uniform(0, 0.15)),
        'fear': max(0, -sentiment_score * 0.5 + random.uniform(0, 0.1)),
        'surprise': random.uniform(0, 0.3),
        'disgust': max(0, -sentiment_score * 0.4 + random.uniform(0, 0.1)),
        'neutral': max(0, 1 - abs(sentiment_score) * 0.7 + random.uniform(0, 0.2))
    }
    
    # Normalize to sum to 1
    total = sum(base_emotions.values())
    normalized_emotions = {k: v / total for k, v in base_emotions.items()}
    
    return {
        'sentiment_score': sentiment_score,
        'happiness': normalized_emotions['happiness'],
        'sadness': normalized_emotions['sadness'],
        'anger': normalized_emotions['anger'],
        'fear': normalized_emotions['fear'],
        'surprise': normalized_emotions['surprise'],
        'disgust': normalized_emotions['disgust'],
        'neutral': normalized_emotions['neutral']
    }
