from django.urls import path
from .views import *
from django.urls import re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


schema_view = get_schema_view(
   openapi.Info(
      title="Volleyball Event Management",
      default_version='v1',
      description="APIs for managing Volleyball Events.",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)


urlpatterns=[
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path("Register",RegisterUser.as_view()),
    path('Verify_OTP',Verify_OTP.as_view()),
    path('Login',User_Login.as_view()),
    path('Logout',User_Logout.as_view()),
    path('Update',UpdateUser.as_view()),
    path('Delete',DeleteUser.as_view()),
    path('ViewUser',ViewUser.as_view()),
    path('GetUser',Get_ParticularUser.as_view()),
    path('Forgotpassword',ForgotPassword.as_view()),
    path('ChangePassword',ChangePassword.as_view()),
    path('SendOTP',Send_OTP.as_view()),
    
    path('RegisterTeam',RegisterTeam.as_view()),
    path('GetAllTeams',ViewTeams.as_view()),
    path('ParticularTeam',Get_ParticularTeam.as_view()),
    path('UpdateTeam',UpdateTeams.as_view()),
    path('DeleteTeam',DeleteTeam.as_view()),
    
    
    path('RegisterEvent',RegisterEvent.as_view()),
    path('ViewEvent',ViewEvent.as_view()),
    path('ParticularEvent',Get_ParticularEvent.as_view()),
    path('UpdateEvent',UpdateEvent.as_view()),
    path('DeleteEvent',DeleteEvent.as_view()),
    
    path('RegisterMatch',RegisterMatch.as_view()),
    path('UpdateMatch',UpdateMatch.as_view()),
    path('ViewMatchs',ViewMatch.as_view()),
    path('ParticularMatch',Get_ParticularMatch.as_view()),
    path('DeleteMatch',DeleteMatch.as_view()),
]