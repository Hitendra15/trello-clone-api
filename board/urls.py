from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BoardViewSet, BoardListAPIView

router = DefaultRouter()
router.register(r'boards', BoardViewSet, basename='board')

urlpatterns = [
    path('', include(router.urls)),
    path('boards/<int:board_id>/lists/',BoardListAPIView.as_view(), name='board-lists'),
    ]