from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .models import User
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserProfileSerializer,DashboardSerializer
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from board.models import Board
from list.models import List
from task.models import Task
# Create your views here.

# get access token and refresh token for user
def get_tokens_for_user(user):
    if not user.is_active:
        raise AuthenticationFailed("User is not active")
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class UserRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self,request,format=None):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = get_tokens_for_user(user)
            return Response({'token':token,'message':'User registered successfully'},status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self,request,format=None):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(email=email,password=password)
            if user is not None:
                token = get_tokens_for_user(user)
                return Response({'token':token,'message':'User login successfully'},status=status.HTTP_200_OK)
            else:
                return Response({'errors':{'non_field_errors':['Email and Password is not valid']}},status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    def get(self,request,format=None):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data,status=status.HTTP_200_OK)

class DashboardStatisticsView(APIView):
    def get(self,request,format=None):
        user = request.user.id
        boards = Board.objects.filter(owner=user)
        lists = List.objects.filter(board__owner=user)
        tasks = Task.objects.filter(list__board__owner=user)
        data = {
                'user':{
                    'first_name':request.user.first_name,
                    'last_name': request.user.last_name
                },
                "statistics": {
                    "total_boards": boards.count(),
                    "total_lists": lists.count(),
                    "total_tasks": tasks.count(),
                    "completed_tasks": tasks.filter(status='done').count(),
                    "in_progress_tasks": tasks.filter(status='in_progress').count(),
                    "todo_tasks": tasks.filter(status='todo').count()
                },
                'boards': [
                    {
                        'id':board.id,
                        'name': board.name,
                        'description': board.description
                    }
                    for board in boards
                ],
                'recent_tasks': [],
                'upcoming_tasks': [],
            }
        serializer = DashboardSerializer(data)
        return Response(serializer.data,status=status.HTTP_200_OK)
