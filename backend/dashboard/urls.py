from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'patients', views.PatientViewSet)
router.register(r'sessions', views.SessionViewSet)
router.register(r'analysis-results', views.AnalysisResultViewSet)
router.register(r'reports', views.ReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', views.DashboardViewSet.as_view({'get': 'stats'}), name='dashboard-stats'),
    path('dashboard/analysis-data/', views.DashboardViewSet.as_view({'get': 'analysis_data'}), name='dashboard-analysis-data'),
    path('dashboard/recent-activity/', views.DashboardViewSet.as_view({'get': 'recent_activity'}), name='dashboard-recent-activity'),
]
