from django.contrib import admin
from .models import Task, Category
class TaskAdmin(admin.ModelAdmin):
    # This makes the admin list look nice
    list_display = ('title', 'id')

# Register your models here.
admin.site.register(Task)
admin.site.register(Category)