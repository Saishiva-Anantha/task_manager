from django.urls import path
from . import views 

urlpatterns = [
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', views.TaskRetrieveUpdateDestroyView.as_view(), name='task-retrieve-update-destroy'),
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryRetrieveUpdateDestroyView.as_view(), name='category-retrieve-update-destroy'),
    path('register/', views.RegisterView.as_view()),
    path('verify-email/', views.VerifyEmailView.as_view()),
    path('me/', views.UserProfileView.as_view(), name='user-profile'),
]

