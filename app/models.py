from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin,BaseUserManager
# Create your models here.


class CustomUserManager(BaseUserManager):
    def _create_user(self,email,password,**extra_fields):
        if not email:
            raise ValueError("Please enter an email address")
        email = self.normalize_email(email)
        user=self.model(email=email,**extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self,email=None,password=None,**extra_fields):
         extra_fields.setdefault('is_staff',False)
         extra_fields.setdefault('is_superuser',False)
         return self._create_user(email,password,**extra_fields)

    def create_superuser(self,email=None,password=None,**extra_fields):
         extra_fields.setdefault('is_staff',True)
         extra_fields.setdefault('is_superuser',True)
         return self._create_user(email,password,**extra_fields)

class User_model(AbstractBaseUser,PermissionsMixin):
    User_Role=(
        ('Organizer','organizer'),
        ('Coach','Coach'),
        ('Player','player'),
        ('Other','other'),
    )
    avatar=models.ImageField(upload_to='img/profile_avatar',blank=True,null=True)
    email=models.EmailField(max_length=256,unique=True)
    firstname=models.CharField(max_length=255,blank=True,null=True)
    lastname=models.CharField(max_length=255,blank=True,null=True)
    password =models.CharField(max_length=255)
    phone = models.IntegerField(blank=True,null=True)
    role = models.CharField(max_length=30,choices=User_Role)
    
    is_active=models.BooleanField(default=True)
    is_superuser=models.BooleanField(default=False)
    is_staff=models.BooleanField(default=False)
    is_block = models.BooleanField(default=False)
    otp = models.IntegerField(blank=True,null=True)
    otp_created_at = models.DateTimeField(blank=True,null=True)
    otp_verified = models.BooleanField(default=False)
    
    objects=CustomUserManager()

    USERNAME_FIELD='email'
    REQUIRED_FIELDS=[]

class Team_Model(models.Model):
    team_name = models.CharField(max_length=256,unique=True)
    coach = models.ForeignKey(User_model, on_delete=models.CASCADE,related_name='teams_coach')
    player = models.ManyToManyField(User_model, related_name='teams_player')
    
    def __str__(self):
        return self.team_name
    
class Event_Model(models.Model):
    name = models.CharField(max_length=100,unique=True)
    organizer = models.ForeignKey(User_model, on_delete= models.CASCADE,related_name='events_org')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=100)
    teams = models.ManyToManyField(Team_Model,related_name='events_team')
    
    def __str__(self):
        return self.name

class Match_Model(models.Model):
    event = models.ForeignKey(Event_Model,on_delete=models.CASCADE,related_name='match_event')
    team1 = models.ForeignKey(Team_Model,on_delete=models.CASCADE,related_name='match_team1')
    team2 = models.ForeignKey(Team_Model,on_delete=models.CASCADE,related_name='match_team2')
    date = models.DateTimeField()
    result = models.CharField(max_length=100,blank=True,null=True)
    
    def _str_(self):
        return f"{self.team1} Vs {self.team2}"
    