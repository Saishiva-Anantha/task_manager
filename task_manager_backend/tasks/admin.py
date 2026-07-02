from django.contrib import admin
from .models import Task, Category, Project, ActivityLog

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'id', 'user', 'completed', 'priority', 'due_date')
    list_filter = ('completed', 'priority', 'category')
    search_fields = ('title', 'description')

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user')
    search_fields = ('name',)

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at')
    filter_horizontal = ('members',)
    search_fields = ('name',)

class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'task_title', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('task_title', 'details')

# Register your models here.
admin.site.register(Task, TaskAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(ActivityLog, ActivityLogAdmin)