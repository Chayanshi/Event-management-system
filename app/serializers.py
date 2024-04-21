from rest_framework import serializers
from .models import *
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_model
        fields = '__all__'
        
class GetUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_model
        fields = ['id', 'email', 'firstname', 'lastname','phone', 'role', 'is_block','avatar']


class GetTeamSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField() 
    coach=GetUserSerializer()
    player=GetUserSerializer(many=True)
    class Meta:
        model = Team_Model
        fields = ['team_name','coach','player']

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team_Model
        fields = '__all__'
        

class EventSerializer(serializers.ModelSerializer):
    organizer =serializers.StringRelatedField()
    teams = serializers.StringRelatedField(many=True)
    
    class Meta:
        model = Event_Model
        fields = '__all__'

      
class GetMatchSerializer(serializers.ModelSerializer):
    team1 =serializers.StringRelatedField(read_only=True)
    team2 = serializers.StringRelatedField(read_only=True)
    refree = serializers.StringRelatedField(read_only=True)
    event = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Match_Model
        fields = '__all__'