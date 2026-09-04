from django.shortcuts import render

from task.models import Task
from .models import List
from .serializers import ListSerializer
from rest_framework import viewsets
from rest_framework.generics import ListCreateAPIView
from task.serializers import TaskSerializer
from rest_framework.exceptions import PermissionDenied
from .permission import ListPermission
# Create your views here.
class ListViewSet(viewsets.ModelViewSet):
    serializer_class = ListSerializer
    permission_classes = [ListPermission]

    def get_queryset(self):
        return List.objects.filter(board__owner=self.request.user)


# get all task list by list id
class ListTaskAPIView(ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        list_id = self.kwargs['list_id']
        task_list = List.objects.filter(id=list_id).first()
        if not task_list:
            raise PermissionDenied("You do not have permission to access this list.")
        return Task.objects.filter(list=task_list)

    def perform_create(self,serializer):
        list_id = self.kwargs['list_id']
        task_list = List.objects.filter(id=list_id).first()
        if not task_list:
            raise PermissionDenied("You do not have permission to access this list.")
        serializer.save(list=task_list)