from rest_framework import serializers
from .models import Task, Category, Project, ActivityLog
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ProjectSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=User.objects.all(), source='members'
    )
    created_by_username = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Project
        fields = ['id', 'name', 'members', 'member_ids', 'created_by', 'created_by_username', 'created_at']
        read_only_fields = ['created_by']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'user']
        read_only_fields = ['user']

class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    project_name = serializers.ReadOnlyField(source='project.name')
    assigned_to_username = serializers.ReadOnlyField(source='assigned_to.username')

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'completed',
            'category',
            'category_name',
            'project',
            'project_name',
            'assigned_to',
            'assigned_to_username',
            'priority',
            'due_date',
            'created_at'
        ]

class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ActivityLog
        fields = ['id', 'username', 'task_title', 'action', 'details', 'timestamp']