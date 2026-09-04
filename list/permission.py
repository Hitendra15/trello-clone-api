from rest_framework import permissions

class ListPermission(permissions.IsAuthenticated):
    def has_object_permission(self,request,view,obj):
        return obj.board.owner == request.user