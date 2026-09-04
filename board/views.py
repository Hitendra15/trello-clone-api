from django.shortcuts import render
from .models import Board
from .serializers import BoardSerializer
from rest_framework import viewsets
from rest_framework.generics import ListCreateAPIView
from list.serializers import ListSerializer
from list.models import List
from rest_framework.exceptions import PermissionDenied
# Create your views here.
class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

    def get_queryset(self):
        return Board.objects.filter(owner=self.request.user)

    def perform_create(self,serializer):
        serializer.save(owner=self.request.user)

# get all boards list by user
class BoardListAPIView(ListCreateAPIView):
    serializer_class = ListSerializer

    def get_queryset(self):
        board_id = self.kwargs['board_id']
        board = Board.objects.filter(id=board_id,owner=self.request.user).first()
        if not board:
            raise PermissionDenied("You do not have permission to access this board.")
        return List.objects.filter(board=board)

    def perform_create(self,serializer):
        board_id = self.kwargs['board_id']
        board = Board.objects.filter(id=board_id,owner=self.request.user).first()
        if not board:
            raise PermissionDenied("You do not have permission to access this board.")
        serializer.save(board=board)
