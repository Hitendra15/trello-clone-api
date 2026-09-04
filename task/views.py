from django.shortcuts import render
from .models import Task
from .serializers import TaskSerializer
from rest_framework import viewsets
from rest_framework.filters import SearchFilter,OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .permission import TaskPermission
# Create your views here.
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [TaskPermission]
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['title','description']
    ordering_fields = ['due_date','created_at']

    def get_queryset(self):
        return Task.objects.filter(list__board__owner=self.request.user)


