import os
import json
import time
import requests
from typing import Dict, List, Optional, Tuple
from django.conf import settings
from .models import ChatSession, ChatMessage, EmotionAnalysis
from .utils import analyze_text_sentiment
from .serializers import ChatMessageSerializer, ChatSessionSerializer


class MentalHealthChatbot:
    """AI-powered mental health chatbot using Hugging Face API."""
    
    def __init__(self):
        self.api_token = settings.HUGGINGFACE_API_TOKEN
        self.base_url = "https://api-inference.huggingface.co/models"
        
        # Mental health specific models
        self.chat_model = os.environ.get('HF_CHAT_MODEL', 'microsoft/DialoGPT-medium')
        self.sentiment_model = os.environ.get('HF_SENTIMENT_MODEL', 'j-hartmann/emotion-english-distilroberta-base')
        
        # Crisis detection keywords
        self.crisis_keywords = [
            'suicide', 'kill myself', 'want to die', 'end it all', 'no reason to live',
            'better off dead', 'hurt myself', 'self harm', 'cut myself', 'overdose',
            'jump off', 'hang myself', 'shoot myself', 'take pills', 'end my life'
        ]
        
        # Mental health context for better responses
        self.system_prompt = """You are a compassionate, professional mental health AI assistant. Your role is to:
1. Provide empathetic, supportive responses
2. Offer evidence-based mental health guidance
3. Recognize crisis situations and respond appropriately
4. Suggest helpful resources and coping strategies
5. Maintain professional boundaries while being warm and understanding
6. Encourage professional help when needed
7. Focus on mental wellness and positive coping mechanisms

Always prioritize user safety and well-being. If you detect crisis indicators, provide immediate support and crisis resources."""

    def _call_huggingface_api(self, model: str, inputs: Dict, task: str = "text-generation") -> Dict:
        """Make a call to Hugging Face Inference API."""
        if not self.api_token:
            raise Exception("Hugging Face API token not configured")
        
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        
        url = f"{self.base_url}/{model}"
        
        try:
            response = requests.post(url, headers=headers, json=inputs, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Hugging Face API error: {e}")
            return None

    def detect_crisis(self, message: str) -> Tuple[bool, str]:
        """Detect if the message indicates a crisis situation."""
        message_lower = message.lower()
        
        for keyword in self.crisis_keywords:
            if keyword in message_lower:
                crisis_message = (
                    "I'm very concerned about what you're sharing. Your safety is the most important thing. "
                    "If you're having thoughts of harming yourself, please: "
                    "1. Call your local emergency number immediately "
                    "2. Contact a suicide prevention hotline "
                    "3. Reach out to a trusted friend, family member, or mental health professional "
                    "4. Go to the nearest emergency room "
                    "You're not alone, and help is available. Would you like me to help you find crisis resources?"
                )
                return True, crisis_message
        
        return False, ""

    def analyze_user_sentiment(self, message: str) -> Dict:
        """Analyze the sentiment and emotions in the user's message."""
        try:
            # Use the existing sentiment analysis function
            sentiment_result = analyze_text_sentiment(message)
            return sentiment_result
        except Exception as e:
            print(f"Sentiment analysis error: {e}")
            return {
                'sentiment_score': 0,
                'happiness': 0,
                'sadness': 0,
                'anger': 0,
                'fear': 0,
                'surprise': 0,
                'disgust': 0,
                'neutral': 0
            }

    def generate_contextual_prompt(self, user_message: str, conversation_history: List[Dict], user_sentiment: Dict) -> str:
        """Generate a contextual prompt for the AI model."""
        # Build conversation context
        context = self.system_prompt + "\n\n"
        
        # Add recent conversation history (last 5 messages)
        recent_messages = conversation_history[-5:] if len(conversation_history) > 5 else conversation_history
        for msg in recent_messages:
            if msg['message_type'] == 'user':
                context += f"User: {msg['content']}\n"
            else:
                context += f"Assistant: {msg['content']}\n"
        
        # Add current user message and sentiment context
        context += f"\nUser: {user_message}\n"
        
        # Add sentiment context for more personalized responses
        if user_sentiment.get('sentiment_score', 0) < -0.5:
            context += "\nNote: User appears to be experiencing negative emotions. Provide extra support and empathy.\n"
        elif user_sentiment.get('sadness', 0) > 0.7:
            context += "\nNote: User shows signs of sadness. Offer comfort and coping strategies.\n"
        elif user_sentiment.get('anger', 0) > 0.7:
            context += "\nNote: User shows signs of anger. Help them process emotions constructively.\n"
        elif user_sentiment.get('fear', 0) > 0.7:
            context += "\nNote: User shows signs of anxiety/fear. Provide reassurance and grounding techniques.\n"
        
        context += "\nAssistant:"
        return context

    def generate_ai_response(self, user_message: str, conversation_history: List[Dict], user_sentiment: Dict) -> str:
        """Generate an AI response using Hugging Face API."""
        start_time = time.time()
        
        try:
            # Generate contextual prompt
            prompt = self.generate_contextual_prompt(user_message, conversation_history, user_sentiment)
            
            # Call Hugging Face API
            inputs = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 150,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "do_sample": True,
                    "return_full_text": False
                }
            }
            
            response = self._call_huggingface_api(self.chat_model, inputs)
            
            if response and isinstance(response, list) and len(response) > 0:
                # Extract the generated text
                generated_text = response[0].get('generated_text', '')
                
                # Clean up the response (remove the prompt part)
                if 'Assistant:' in generated_text:
                    ai_response = generated_text.split('Assistant:')[-1].strip()
                else:
                    ai_response = generated_text.strip()
                
                # Ensure response is not too long
                if len(ai_response) > 500:
                    ai_response = ai_response[:500] + "..."
                
                # Fallback if response is empty or too short
                if len(ai_response) < 10:
                    ai_response = self._generate_fallback_response(user_sentiment, user_message)
                
                processing_time = int((time.time() - start_time) * 1000)
                
                return ai_response, processing_time, len(prompt.split())
            
            else:
                # Fallback response if API fails
                return self._generate_fallback_response(user_sentiment, user_message), 0, 0
                
        except Exception as e:
            print(f"AI response generation error: {e}")
            return self._generate_fallback_response(user_sentiment, user_message), 0, 0

    def _generate_fallback_response(self, user_sentiment: Dict, user_message: str = "") -> str:
        """Generate a fallback response when AI model fails."""
        import random
        
        sentiment_score = user_sentiment.get('sentiment_score', 0)
        sadness = user_sentiment.get('sadness', 0)
        fear = user_sentiment.get('fear', 0)
        anger = user_sentiment.get('anger', 0)
        
        # More diverse and contextual responses
        if sentiment_score < -0.5:
            responses = [
                "I can sense that you're going through a really tough time right now. It's completely okay to feel this way, and I want you to know that your feelings are valid. Would you like to tell me more about what's been happening?",
                "I hear the pain in your words, and I want you to know that you don't have to go through this alone. Sometimes just talking about what's bothering us can help lighten the load. What's been on your mind lately?",
                "It sounds like you're carrying a heavy emotional burden. Remember that it's okay to not be okay sometimes. I'm here to listen without judgment. Would you like to share what's been weighing on you?",
                "I can feel that you're struggling, and I want you to know that reaching out like this is a brave step. You're showing strength by seeking support. What would be most helpful for you right now?"
            ]
        elif sadness > 0.6:
            responses = [
                "I can see that sadness is really present for you right now. It's a natural emotion, but it can feel overwhelming. Sometimes talking about what's causing the sadness can help us process it better. Would you like to explore that?",
                "Sadness can feel like a heavy cloud, can't it? It's okay to feel this way, and you don't have to rush through it. What do you think might help you feel a little better right now?",
                "I hear the sadness in your voice, and I want you to know that it's okay to feel this way. Sometimes we need to acknowledge our sadness before we can begin to heal. What's been making you feel sad?"
            ]
        elif fear > 0.6:
            responses = [
                "I can sense that anxiety or fear is really affecting you right now. These feelings can be so overwhelming. Let's take a moment to breathe together. What's been causing you to feel anxious?",
                "Fear and anxiety can make everything feel uncertain and scary. You're not alone in feeling this way. Sometimes talking about our fears can help them feel less overwhelming. Would you like to share what's been worrying you?",
                "I can feel the anxiety in your words. It's a really challenging emotion to deal with. Remember that anxiety is often about things that haven't happened yet. What's been on your mind that's causing this fear?"
            ]
        elif anger > 0.6:
            responses = [
                "I can feel the anger in your words, and I want you to know that it's okay to feel angry. Anger is a natural emotion that tells us something isn't right. What's been happening that's made you feel this way?",
                "Anger can be really powerful and overwhelming. It's important to acknowledge it and find healthy ways to express it. What do you think triggered these feelings of anger?",
                "I hear the frustration and anger in your voice. These feelings are valid, and it's okay to feel them. Sometimes understanding what's behind our anger can help us process it better. What's been going on?"
            ]
        elif sentiment_score > 0.5:
            responses = [
                "I'm so glad to hear that you're feeling positive! It's wonderful to celebrate these good moments. What's been bringing you joy lately?",
                "It's great to hear that you're in a good place right now! Positive emotions are worth savoring. Is there anything specific you'd like to work on or discuss?",
                "I can feel the positivity in your words, and that's wonderful! Good moments are precious. What would you like to focus on or explore together?"
            ]
        else:
            snippet = user_message.strip()
            if len(snippet) > 120:
                snippet = snippet[:120] + "..."
            if snippet:
                responses = [
                    f"Thank you for sharing that: \"{snippet}\". I'm here to support you. What would you like to talk about or work on today?",
                    f"I appreciate you opening up about \"{snippet}\". Everyone's journey is different; how can I best support you right now?",
                    f"Thanks for trusting me with this: \"{snippet}\". I'm here to listen and support you. What would you like to explore together?"
                ]
            else:
                responses = [
                    "Thank you for sharing that with me. I'm here to support you in whatever way feels helpful. What would you like to talk about or work on today?",
                    "I appreciate you opening up to me. Everyone's journey is different, and I'm here to walk alongside you. How can I best support you right now?",
                    "Thank you for trusting me with your thoughts. I'm here to listen and support you. What's on your mind that you'd like to explore together?"
                ]
        
        return random.choice(responses)

    def get_suggestions(self, user_message: str, user_sentiment: Dict) -> List[str]:
        """Generate helpful suggestions based on the conversation."""
        suggestions = []
        
        # Base suggestions
        suggestions.append("Would you like to try a quick breathing exercise?")
        suggestions.append("How about we explore some coping strategies?")
        
        # Sentiment-based suggestions
        if user_sentiment.get('sadness', 0) > 0.6:
            suggestions.append("Would you like to talk about what's been weighing on you?")
            suggestions.append("Sometimes writing down our thoughts can help - want to try journaling?")
        
        if user_sentiment.get('fear', 0) > 0.6:
            suggestions.append("Let's try a grounding exercise to help you feel more present.")
            suggestions.append("Would you like to learn about anxiety management techniques?")
        
        if user_sentiment.get('anger', 0) > 0.6:
            suggestions.append("It's okay to feel angry. Let's explore healthy ways to process this emotion.")
            suggestions.append("Would you like to try some anger management strategies?")
        
        return suggestions[:3]  # Return top 3 suggestions

    def process_message(self, user_message: str, user: 'User', session_id: Optional[int] = None) -> Dict:
        """Process a user message and generate an AI response."""
        start_time = time.time()
        
        # Detect crisis first
        crisis_detected, crisis_message = self.detect_crisis(user_message)
        
        # Get or create chat session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=user, is_active=True)
            except ChatSession.DoesNotExist:
                session = ChatSession.objects.create(user=user)
        else:
            session = ChatSession.objects.create(user=user)
        
        # Analyze user sentiment
        user_sentiment = self.analyze_user_sentiment(user_message)
        
        # Save user message
        user_msg = ChatMessage.objects.create(
            session=session,
            content=user_message,
            message_type='user',
            sentiment_score=user_sentiment.get('sentiment_score', 0),
            detected_emotions=user_sentiment
        )
        
        # Get conversation history
        conversation_history = list(session.messages.values('content', 'message_type').order_by('timestamp'))
        
        # Generate AI response
        if crisis_detected:
            ai_response = crisis_message
            processing_time = 0
            tokens_used = 0
        else:
            ai_response, processing_time, tokens_used = self.generate_ai_response(
                user_message, conversation_history, user_sentiment
            )
        
        # Save AI response
        ai_msg = ChatMessage.objects.create(
            session=session,
            content=ai_response,
            message_type='ai',
            ai_model_used=self.chat_model,
            processing_time_ms=processing_time,
            tokens_used=tokens_used
        )
        
        # Update session
        session.total_messages = session.messages.count()
        session.save()
        
        # Generate suggestions
        suggestions = self.get_suggestions(user_message, user_sentiment)
        
        return {
            'message': ChatMessageSerializer(ai_msg).data,
            'session': ChatSessionSerializer(session).data,
            'suggestions': suggestions,
            'crisis_detected': crisis_detected,
            'crisis_message': crisis_message if crisis_detected else None
        }


# Global chatbot instance
chatbot = MentalHealthChatbot()
