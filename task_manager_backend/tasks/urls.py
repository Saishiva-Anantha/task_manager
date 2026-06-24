from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views 

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', views.TaskRetrieveUpdateDestroyView.as_view(), name='task-retrieve-update-destroy'),
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryRetrieveUpdateDestroyView.as_view(), name='category-retrieve-update-destroy'),
    path('register/', views.RegisterView.as_view()),
    path('verify-email/', views.VerifyEmailView.as_view()),
    path('me/', views.UserProfileView.as_view(), name='user-profile'),
    path('activities/', views.ActivityLogListView.as_view(), name='activity-log-list'),
    path('analytics/', views.AnalyticsView.as_view(), name='analytics-dashboard'),
    path('ai-generate/', views.AITaskGeneratorView.as_view(), name='ai-task-generate'),
    path('ai-summary/', views.AITaskSummaryView.as_view(), name='ai-task-summary'),
    path('users/', views.AllUsersView.as_view(), name='all-users-list'),
]

