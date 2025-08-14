from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('username', email)  # Set username to email for superuser
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    guardian_email = models.EmailField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)
    emergency_phone = models.CharField(max_length=15, blank=True)
    
    # Mental health profile
    stress_level = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    anxiety_level = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    depression_level = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    
    # Preferences
    preferred_language = models.CharField(max_length=10, default='en')
    notification_preferences = models.JSONField(default=dict)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    def __str__(self):
        return self.email

class MentalHealthAssessment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessments')

class TherapySession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='therapy_sessions')
    date = models.DateTimeField(auto_now_add=True)
    therapist_name = models.CharField(max_length=255, blank=True)
    session_notes = models.TextField(blank=True)
    goals = models.TextField(blank=True)
    progress = models.TextField(blank=True)
    duration = models.IntegerField(default=60)  # in minutes
    completed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-date']
        
    def __str__(self):
        return f"Therapy Session for {self.user.email} on {self.date}"

class MeditationSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meditation_sessions')
    date = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(default=10)  # in minutes
    meditation_type = models.CharField(max_length=100, default='Mindfulness')
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    mood_before = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)], null=True, blank=True)
    mood_after = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)], null=True, blank=True)
    
    class Meta:
        ordering = ['-date']
        
    def __str__(self):
        return f"{self.meditation_type} meditation by {self.user.email} on {self.date}"

class MoodJournalEntry(models.Model):
    MOOD_CHOICES = [
        ('happy', 'Happy'),
        ('calm', 'Calm'),
        ('sad', 'Sad'),
        ('angry', 'Angry'),
        ('anxious', 'Anxious'),
        ('stressed', 'Stressed'),
        ('neutral', 'Neutral'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mood_journal')
    date = models.DateTimeField(auto_now_add=True)
    mood = models.CharField(max_length=50, choices=MOOD_CHOICES, default='neutral')
    mood_intensity = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    triggers = models.TextField(blank=True)
    thoughts = models.TextField(blank=True)
    activities = models.TextField(blank=True)
    gratitude = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name_plural = 'Mood journal entries'
        
    def __str__(self):
        return f"Mood entry for {self.user.email}: {self.mood} on {self.date}"
    date_taken = models.DateTimeField(auto_now_add=True)
    stress_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)], default=0)
    anxiety_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)], default=0)
    depression_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)], default=0)
    overall_mood = models.CharField(max_length=50, default='Neutral')
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-date_taken']

class MentalHealthSupporter(models.Model):
    """Model for mental health professionals who can provide video calls"""
    
    SPECIALIZATION_CHOICES = [
        ('counselor', 'Licensed Counselor'),
        ('psychologist', 'Clinical Psychologist'),
        ('therapist', 'Psychotherapist'),
        ('social_worker', 'Clinical Social Worker'),
        ('psychiatrist', 'Psychiatrist'),
        ('life_coach', 'Life Coach'),
        ('crisis_specialist', 'Crisis Intervention Specialist'),
    ]
    
    LANGUAGES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('es', 'Spanish'),
        ('fr', 'French'),
        ('de', 'German'),
        ('zh', 'Chinese'),
        ('ja', 'Japanese'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('busy', 'In Session'),
        ('offline', 'Offline'),
        ('break', 'On Break'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.URLField(blank=True, null=True)
    
    # Professional Details
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    languages = models.JSONField(default=list)  # List of language codes
    years_experience = models.IntegerField(default=0)
    license_number = models.CharField(max_length=100, blank=True)
    certifications = models.JSONField(default=list)
    
    # Availability & Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    current_session = models.ForeignKey('VideoSession', on_delete=models.SET_NULL, null=True, blank=True, related_name='active_supporter')
    last_active = models.DateTimeField(auto_now=True)
    
    # Working Hours (24-hour format)
    working_hours_start = models.TimeField(default='09:00')
    working_hours_end = models.TimeField(default='17:00')
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Professional Bio
    bio = models.TextField()
    areas_of_expertise = models.JSONField(default=list)
    approach = models.TextField(blank=True)
    
    # Ratings & Reviews
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_sessions = models.IntegerField(default=0)
    total_reviews = models.IntegerField(default=0)
    
    # Session Management
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    session_duration = models.IntegerField(default=50)  # minutes
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-average_rating', '-status']
    
    def __str__(self):
        return f"{self.name} - {self.get_specialization_display()}"
    
    @property
    def is_available(self):
        """Check if supporter is currently available for sessions"""
        from django.utils import timezone
        now = timezone.now()
        
        # Check if within working hours
        current_time = now.time()
        if not (self.working_hours_start <= current_time <= self.working_hours_end):
            return False
        
        # Check status
        return self.status == 'available'
    
    def start_session(self, session):
        """Start a video session with a user"""
        self.status = 'busy'
        self.current_session = session
        self.save()
    
    def end_session(self):
        """End the current video session"""
        self.status = 'available'
        self.current_session = None
        self.save()

class VideoSession(models.Model):
    """Model to track video call sessions"""
    
    STATUS_CHOICES = [
        ('waiting', 'Waiting for Supporter'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='video_sessions')
    supporter = models.ForeignKey(MentalHealthSupporter, on_delete=models.CASCADE, related_name='video_sessions')
    
    # Session Details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    session_id = models.CharField(max_length=100, unique=True)
    
    # Timing
    requested_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(default=0)  # minutes
    
    # Session Info
    topic = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    crisis_related = models.BooleanField(default=False)
    
    # Technical Details
    room_url = models.URLField(blank=True)
    recording_url = models.URLField(blank=True)
    
    # Feedback
    user_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    user_feedback = models.TextField(blank=True)
    supporter_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Session {self.session_id} - {self.user.full_name} with {self.supporter.name}"
    
    def start_session(self):
        """Start the video session"""
        from django.utils import timezone
        self.status = 'active'
        self.started_at = timezone.now()
        self.supporter.start_session(self)
        self.save()
    
    def end_session(self):
        """End the video session"""
        from django.utils import timezone
        self.status = 'completed'
        self.ended_at = timezone.now()
        
        # Calculate duration
        if self.started_at:
            duration = self.ended_at - self.started_at
            self.duration = int(duration.total_seconds() / 60)
        
        self.supporter.end_session()
        self.save()
