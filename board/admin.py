from django.contrib import admin
from .models import Board
# Register your models here.
@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('name', 'description', 'owner__username')
    ordering = ('-created_at',)