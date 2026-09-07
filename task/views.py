from django.shortcuts import render
from .models import Task
from .serializers import TaskSerializer
from rest_framework import viewsets
from rest_framework.filters import SearchFilter,OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .permission import TaskPermission
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
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

    # mark the task status done
    @action(detail=True,methods=['post'])
    def mark_done(self,request,pk=None):
        task = self.get_object()
        task.status = 'done'
        task.save()
        return Response({'message':'Task marked as done.'},status=status.HTTP_200_OK)

    # get all completed tasks of logged in user
    @action(detail=False,methods=['get'])
    def completed_task(self,request):
        tasks = Task.objects.filter(status='done',list__board__owner=self.request.user)
        serializer = self.get_serializer(tasks,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
