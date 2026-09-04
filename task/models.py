from django.db import models
from list.models import List
# Create your models here.
class Task(models.Model):
    title = models.CharField(max_length=100, blank=False)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name='tasks')
    status_choices = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]
    status = models.CharField(max_length=20, choices=status_choices, default='todo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title