from rest_framework import serializers
from account.models import User

class UserRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type':'password'},write_only=True)
    class Meta:
        model = User
        fields = ['first_name','last_name','email','password','password2']
        extra_kwargs = {
            'first_name':{'required':True},
            'last_name':{'required':True},
            'password':{'write_only':True}}

    def validate(self,data):
        password = data.get('password')
        password2 = data.get('password2')
        if password.lower() != password2.lower():
            raise serializers.ValidationError("Password field doesn't match")
        return data

    def create(self,validate_data):
        return User.objects.create_user(**validate_data)


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=100)
    password = serializers.CharField()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name','last_name']


class DashboardStatisticsSerializer(serializers.Serializer):
    total_boards = serializers.IntegerField()
    total_lists = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    in_progress_tasks = serializers.IntegerField()
    todo_tasks = serializers.IntegerField()

class DashboardSerializer(serializers.Serializer):
    user = UserProfileSerializer(read_only=True)
    statistics = DashboardStatisticsSerializer(read_only=True)
    boards = serializers.ListField(read_only=True)
    recent_tasks = serializers.ListField(read_only=True)
    upcoming_tasks = serializers.ListField(read_only=True)

