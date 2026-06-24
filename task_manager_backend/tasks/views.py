
from rest_framework import generics
# Create your views here.
from .models import Task, Category
from .serializers import TaskSerializer, CategorySerializer
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
        })


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        project_id = self.request.query_params.get('project_id')
        if project_id:
            return Task.objects.filter(project_id=project_id, project__members=user).order_by('-created_at')
        return Task.objects.filter(
            Q(user=user) | Q(assigned_to=user) | Q(project__members=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        task = serializer.save(user=self.request.user)
        ActivityLog.objects.create(
            user=self.request.user,
            task_title=task.title,
            action='created',
            details=f"Created task '{task.title}'"
        )

class TaskRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            Q(user=user) | Q(assigned_to=user) | Q(project__members=user)
        ).distinct()

    def perform_update(self, serializer):
        old_task = self.get_object()
        old_completed = old_task.completed
        old_priority = old_task.priority
        old_assigned_to = old_task.assigned_to
        
        task = serializer.save()
        
        details = []
        if old_completed != task.completed:
            details.append(f"marked task '{task.title}' as {'completed' if task.completed else 'incomplete'}")
        if old_priority != task.priority:
            details.append(f"changed priority of '{task.title}' from {old_priority} to {task.priority}")
        if old_assigned_to != task.assigned_to:
            assigned_name = task.assigned_to.username if task.assigned_to else "None"
            details.append(f"assigned task '{task.title}' to {assigned_name}")
            
        if not details:
            details.append(f"updated task '{task.title}'")
            
        ActivityLog.objects.create(
            user=self.request.user,
            task_title=task.title,
            action='updated',
            details="; ".join(details)
        )

    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            user=self.request.user,
            task_title=instance.title,
            action='deleted',
            details=f"Deleted task '{instance.title}'"
        )
        instance.delete()

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(Q(user=self.request.user) | Q(user__isnull=True))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email    = request.data.get('email')

        if not username or not password or not email:
            return Response(
                {'error': 'Username, password and email required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already taken'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            is_active=False
        )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verify_url = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"

        send_mail(
            'Verify your Anantha Task Manager account',
            f'Hi {user.username},\n\nPlease click the link below to verify your email address:\n{verify_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        return Response(
            {'message': 'Registration successful. Please check your email to verify your account.'},
            status=status.HTTP_201_CREATED
        )

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')

        if not uidb64 or not token:
            return Response({'error': 'Missing verification parameters'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'message': 'Email verified successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid verification link.'}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework import viewsets
from rest_framework.decorators import action
from .models import Project, ActivityLog
from .serializers import ProjectSerializer, ActivityLogSerializer
from datetime import timedelta
from django.db.models import Count
import urllib.request
import json
import os

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(members=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        project.members.add(self.request.user)
        ActivityLog.objects.create(
            user=self.request.user,
            action='project_created',
            details=f"Created project '{project.name}'"
        )

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        project = self.get_object()
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user_to_invite = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': f'User {username} does not exist'}, status=status.HTTP_404_NOT_FOUND)
        if user_to_invite in project.members.all():
            return Response({'error': f'User {username} is already a member of this project'}, status=status.HTTP_400_BAD_REQUEST)
        project.members.add(user_to_invite)
        ActivityLog.objects.create(
            user=request.user,
            action='project_invite',
            details=f"Invited {username} to project '{project.name}'"
        )
        return Response({'message': f'Successfully invited {username} to project.'}, status=status.HTTP_200_OK)


class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ActivityLog.objects.filter(
            Q(user=user) | Q(task_title__in=Task.objects.filter(project__members=user).values_list('title', flat=True))
        ).distinct().order_by('-timestamp')[:50]


class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        week_completed = Task.objects.filter(
            completed=True,
            due_date__gte=start_of_week,
            due_date__lte=today,
            user=user
        )
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        completed_by_day = {day: 0 for day in days}
        for task in week_completed:
            if task.due_date:
                day_name = task.due_date.strftime('%a')
                if day_name in completed_by_day:
                    completed_by_day[day_name] += 1

        priority_stats = Task.objects.filter(user=user).values('priority').annotate(count=Count('priority'))
        priority_data = {'low': 0, 'medium': 0, 'high': 0}
        for stat in priority_stats:
            priority_data[stat['priority']] = stat['count']

        category_stats = Task.objects.filter(user=user, category__isnull=False).values('category__name').annotate(count=Count('id'))
        category_data = {stat['category__name']: stat['count'] for stat in category_stats}

        total_tasks = Task.objects.filter(user=user).count()
        completed_tasks = Task.objects.filter(user=user, completed=True).count()
        productivity_score = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

        return Response({
            'completed_this_week': completed_by_day,
            'by_priority': priority_data,
            'by_category': category_data,
            'productivity_score': productivity_score,
            'total_completed': completed_tasks,
            'total_pending': total_tasks - completed_tasks,
        })


def call_gemini_api(prompt):
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    data = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            text = result['candidates'][0]['content']['parts'][0]['text']
            return text
    except Exception as e:
        print("Gemini API call failed:", e)
        return None


class AITaskGeneratorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt')
        if not prompt:
            return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        ai_prompt = (
            f"Generate a list of 5 subtasks for the goal: '{prompt}'. "
            "Respond ONLY with a JSON array of strings, like this: "
            '["Subtask 1", "Subtask 2", "Subtask 3", "Subtask 4", "Subtask 5"]'
        )
        subtasks = None
        gemini_response = call_gemini_api(ai_prompt)
        if gemini_response:
            try:
                cleaned_response = gemini_response.strip()
                if cleaned_response.startswith('```'):
                    cleaned_response = cleaned_response.split('\n', 1)[1].rsplit('\n', 1)[0]
                    if cleaned_response.startswith('json'):
                        cleaned_response = cleaned_response[4:].strip()
                subtasks = json.loads(cleaned_response)
            except Exception:
                subtasks = None
        
        if not subtasks:
            prompt_lower = prompt.lower()
            if "interview" in prompt_lower or "job" in prompt_lower:
                subtasks = [
                    "Resume and portfolio review",
                    "Practice core interview questions",
                    "Review standard algorithms and data structures",
                    "Conduct mock interview simulation",
                    "Prepare follow-up questions for the interviewer"
                ]
            elif "project" in prompt_lower or "app" in prompt_lower or "build" in prompt_lower:
                subtasks = [
                    "Define project requirements and design database schema",
                    "Setup project structure and install dependencies",
                    "Implement backend API and core logic",
                    "Create frontend UI components",
                    "Perform testing and deploy the first version"
                ]
            elif "learn" in prompt_lower or "study" in prompt_lower or "exam" in prompt_lower:
                subtasks = [
                    "Gather study materials and define topics checklist",
                    "Study core concepts and take detailed notes",
                    "Work through practice problems or exercises",
                    "Review and summarize difficult sections",
                    "Take a mock exam or complete a test project"
                ]
            else:
                subtasks = [
                    f"Plan and outline requirements for '{prompt}'",
                    f"Setup initial environment and resources for '{prompt}'",
                    f"Execute core tasks for '{prompt}' phase 1",
                    f"Review progress and refine details for '{prompt}'",
                    f"Finalize and verify outcomes of '{prompt}'"
                ]

        category, _ = Category.objects.get_or_create(name=f"AI: {prompt[:30]}", user=request.user)
        created_tasks = []
        for title in subtasks:
            task = Task.objects.create(
                title=title,
                category=category,
                user=request.user,
                priority='medium'
            )
            created_tasks.append({
                'id': task.id,
                'title': task.title,
                'category_name': category.name,
                'priority': task.priority
            })
            
        ActivityLog.objects.create(
            user=request.user,
            action='ai_task_generate',
            details=f"Generated {len(subtasks)} subtasks for '{prompt}'"
        )
        return Response({
            'message': f"Successfully generated {len(subtasks)} tasks.",
            'tasks': created_tasks
        }, status=status.HTTP_201_CREATED)


class AITaskSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        total = Task.objects.filter(user=user).count()
        completed = Task.objects.filter(user=user, completed=True).count()
        high_priority = Task.objects.filter(user=user, completed=False, priority='high').count()
        
        cat_stats = Task.objects.filter(user=user, category__isnull=False).values('category__name').annotate(count=Count('id')).order_by('-count')
        top_category = cat_stats[0]['category__name'] if cat_stats.exists() else "None"
        
        prompt = (
            f"Summarize user's week on Anantha Task Manager. "
            f"Stats: {completed} tasks completed out of {total} total. "
            f"Top Category: '{top_category}'. "
            f"Pending High Priority Tasks: {high_priority}. "
            "Write a short, encouraging summary (max 3 sentences) in the second person ('You completed...')."
        )
        summary = call_gemini_api(prompt)
        if not summary:
            summary = f"You completed {completed} tasks this week. Your top category is '{top_category}', and you have {high_priority} pending high priority tasks. Keep up the great work!"
            
        return Response({'summary': summary.strip()})


class AllUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = User.objects.all().values('id', 'username', 'email')
        return Response(users)
        