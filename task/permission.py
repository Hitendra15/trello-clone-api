from rest_framework import permissions

class TaskPermission(permissions.IsAuthenticated):
    def has_object_permission(self,request,view,obj):
        return obj.list.board.owner == request.user