from django.contrib import admin
from .models import List
# Register your models here.
@admin.register(List)
class ListAdmin(admin.ModelAdmin):
    list_display = ('title', 'board__name', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'description', 'board__name')
    ordering = ('-created_at',)