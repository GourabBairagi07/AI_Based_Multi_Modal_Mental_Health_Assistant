from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    
    # User Profile
    path('profile/', views.profile, name='profile'),
    path('users/<int:id>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Mental Health Assessment
    path('assessment/', views.assessment, name='assessment'),
    
    # Crisis Alert
    path('crisis-alert/', views.crisis_alert, name='crisis-alert'),
    
    # Video Call - Mental Health Supporters
    path('supporters/', views.MentalHealthSupporterListView.as_view(), name='supporters-list'),
    path('supporters/<int:pk>/', views.MentalHealthSupporterDetailView.as_view(), name='supporter-detail'),
    
    # Video Call - Sessions
    path('video-sessions/', views.VideoSessionListView.as_view(), name='video-sessions-list'),
    path('video-sessions/create/', views.VideoSessionCreateView.as_view(), name='video-session-create'),
    path('video-sessions/<int:pk>/', views.VideoSessionDetailView.as_view(), name='video-session-detail'),
    path('video-sessions/<int:session_id>/start/', views.start_video_session, name='start-video-session'),
    path('video-sessions/<int:session_id>/end/', views.end_video_session, name='end-video-session'),
    
    # Therapy Sessions
    path('therapy-sessions/', views.therapy_sessions, name='therapy-sessions'),
    path('therapy-sessions/<int:pk>/', views.therapy_session_detail, name='therapy-session-detail'),
    
    # Meditation Sessions
    path('meditation-sessions/', views.meditation_sessions, name='meditation-sessions'),
    path('meditation-sessions/<int:pk>/', views.meditation_session_detail, name='meditation-session-detail'),
    
    # Mood Journal
    path('mood-journal/', views.mood_journal, name='mood-journal'),
    path('mood-journal/<int:pk>/', views.mood_journal_detail, name='mood-journal-detail'),
]