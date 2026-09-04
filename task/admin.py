from django.contrib import admin
from .models import Task
# Register your models here.
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'list__title', 'due_date', 'created_at', 'updated_at')
    list_filter = ('due_date', 'created_at', 'updated_at')
    search_fields = ('title', 'description', 'list__title')
    ordering = ('-created_at',)