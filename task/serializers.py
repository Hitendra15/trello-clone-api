from rest_framework import serializers
from .models import Task
from django.utils import timezone

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

    # validations
    def validate_title(self,value):
        if len(value.strip()) <= 2:
            raise serializers.ValidationError("Title must be at least 2 characters long.")
        return value

    def validate_description(self,value):
        if len(value.strip()) <= 5:
            raise serializers.ValidationError("Description must be at least 5 characters long.")
        return value

    def validate_due_date(self,value):
        if value is not None and value < timezone.now():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value