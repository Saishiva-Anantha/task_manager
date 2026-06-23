from rest_framework import serializers
from .models import Task, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'user']
        read_only_fields = ['user']

class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'completed',
            'category',
            'category_name',
            'priority',
            'due_date',
            'created_at'
        ]