from django.core.management.base import BaseCommand
from users.models import MentalHealthSupporter

class Command(BaseCommand):
    help = 'Populate the database with 30 mental health supporters'

    def handle(self, *args, **options):
        supporters_data = [
            {
                'name': 'Dr. Sarah Johnson', 'email': 'sarah.johnson@mentalhealth.com',
                'specialization': 'psychologist', 'languages': ['en'], 'years_experience': 12,
                'bio': 'Licensed clinical psychologist specializing in anxiety, depression, and trauma therapy.',
                'areas_of_expertise': ['Anxiety Disorders', 'Depression', 'PTSD'], 'average_rating': 4.8,
                'total_sessions': 1247, 'hourly_rate': 150.00, 'status': 'available'
            },
            {
                'name': 'Dr. Michael Chen', 'email': 'michael.chen@mentalhealth.com',
                'specialization': 'psychiatrist', 'languages': ['en', 'zh'], 'years_experience': 15,
                'bio': 'Board-certified psychiatrist with expertise in medication management.',
                'areas_of_expertise': ['Bipolar Disorder', 'Major Depression'], 'average_rating': 4.9,
                'total_sessions': 1893, 'hourly_rate': 200.00, 'status': 'available'
            },
            {
                'name': 'Priya Patel', 'email': 'priya.patel@mentalhealth.com',
                'specialization': 'counselor', 'languages': ['en', 'hi'], 'years_experience': 8,
                'bio': 'Licensed professional counselor specializing in relationship issues.',
                'areas_of_expertise': ['Relationship Counseling', 'Family Therapy'], 'average_rating': 4.7,
                'total_sessions': 892, 'hourly_rate': 120.00, 'status': 'available'
            },
            {
                'name': 'Dr. James Wilson', 'email': 'james.wilson@mentalhealth.com',
                'specialization': 'crisis_specialist', 'languages': ['en'], 'years_experience': 10,
                'bio': 'Crisis intervention specialist with experience in emergency mental health services.',
                'areas_of_expertise': ['Crisis Intervention', 'Suicide Prevention'], 'average_rating': 4.9,
                'total_sessions': 567, 'hourly_rate': 180.00, 'status': 'available'
            },
            {
                'name': 'Maria Rodriguez', 'email': 'maria.rodriguez@mentalhealth.com',
                'specialization': 'social_worker', 'languages': ['en', 'es'], 'years_experience': 9,
                'bio': 'Clinical social worker specializing in trauma-informed care.',
                'areas_of_expertise': ['Trauma Therapy', 'Social Justice'], 'average_rating': 4.6,
                'total_sessions': 734, 'hourly_rate': 110.00, 'status': 'available'
            }
        ]

        # Add more supporters with varied data
        specializations = ['counselor', 'psychologist', 'therapist', 'social_worker', 'psychiatrist', 'life_coach', 'crisis_specialist']
        languages = [['en'], ['en', 'es'], ['en', 'hi'], ['en', 'zh'], ['en', 'fr']]
        
        for i in range(6, 31):
            supporter_data = {
                'name': f'Dr. Supporter {i}',
                'email': f'supporter{i}@mentalhealth.com',
                'specialization': specializations[i % len(specializations)],
                'languages': languages[i % len(languages)],
                'years_experience': 5 + (i % 15),
                'bio': f'Experienced mental health professional with expertise in various areas.',
                'areas_of_expertise': ['General Counseling', 'Mental Health Support'],
                'average_rating': 4.5 + (i % 5) * 0.1,
                'total_sessions': 200 + (i * 50),
                'hourly_rate': 100.00 + (i * 5),
                'status': 'available'
            }
            supporters_data.append(supporter_data)

        created_count = 0
        for data in supporters_data:
            supporter, created = MentalHealthSupporter.objects.get_or_create(
                email=data['email'],
                defaults=data
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} mental health supporters')
        )
