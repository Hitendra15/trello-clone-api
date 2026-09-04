from django.db import models
from board.models import Board

# Create your models here.
class List(models.Model):
    title = models.CharField(max_length=100, blank=False)
    description = models.TextField(blank=True)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='lists')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title