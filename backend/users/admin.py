from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import MentalHealthAssessment, MentalHealthSupporter, VideoSession, TherapySession, MeditationSession, MoodJournalEntry

User = get_user_model()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'is_staff', 'is_active')
    search_fields = ('email', 'full_name')
    list_filter = ('is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'phone_number', 'date_of_birth', 'emergency_contact', 'emergency_phone')}),
        ('Mental Health', {
            'fields': ('stress_level', 'anxiety_level', 'depression_level'),
        }),
        ('Preferences', {
            'fields': ('preferred_language', 'notification_preferences'),
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

@admin.register(MentalHealthAssessment)
class MentalHealthAssessmentAdmin(admin.ModelAdmin):
    list_display = ('user',)
    search_fields = ('user__email', 'user__full_name')

@admin.register(MentalHealthSupporter)
class MentalHealthSupporterAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialization', 'status', 'average_rating', 'total_sessions')
    list_filter = ('specialization', 'status', 'years_experience')
    search_fields = ('name', 'email', 'bio')
    readonly_fields = ('total_sessions', 'total_reviews', 'average_rating')

@admin.register(VideoSession)
class VideoSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'user', 'supporter', 'status', 'requested_at', 'duration')
    list_filter = ('status', 'crisis_related', 'requested_at')
    search_fields = ('session_id', 'user__email', 'supporter__name')
    readonly_fields = ('session_id', 'requested_at', 'started_at', 'ended_at')
