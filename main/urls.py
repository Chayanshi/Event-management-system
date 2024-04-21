from django.urls import path, include
from main.views import *

urlpatterns = [
    path('', main, name='main'),
    path('login/<int:type>/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('register/', register, name='register'),
    path('register_otp/<str:email>', register_otp, name='register_otp'),
    path('forgot_email', forgot_email, name='forgot_email'),
    path('verify_otp/<str:email>', verify_otp, name='verify_otp'),
    path('forgot/<str:email>', forgot, name='forgot'),
    # Redirect to home or dashboard page
    path('homepage/<int:type>/', homepage, name='homepage'),
    
    path('profile/<int:type>/', profile, name='profile'),
    path('edit_profile/<int:type>/', edit_profile, name='edit_profile'),
    
    # Home page for fans, players, and others
    path('home/<int:type>/', home, name='home'),
    
    # Home page for organizers
    path('dashboard/<int:type>/', dashboard, name='dashboard'),
    
    #matches 
    path('matches/<int:type>/', matches, name='matches'),
    path('Add_match/<int:type>/',Add_match,name="Add_match"),
    path('View_match/<int:type>/<int:id>',View_match,name="View_match"),
    path('Edit_match/<int:type>/<int:id>',Edit_match,name="Edit_match"),
    path('Delete_match/<int:type>/<int:id>',Delete_match,name="Delete_match"),
    
    
    #events 
    path('events/<int:type>/', events, name='events'),
    path('Add_event/<int:type>/',Add_event,name="Add_event"),
    path('Edit_event/<int:type>/<int:id>',Edit_event,name="Edit_event"),
    path('View_event/<int:type>/<int:id>',View_event,name="View_event"),
    path('Delete_event/<int:type>/<int:id>',Delete_event,name="Delete_event"),
    
    #users
    path('users/<int:type>/', users, name='users'),
    path('Add_user/<int:type>/',Add_user,name="Add_user"),
    path('View_user/<int:type>/<str:email>',View_user,name="View_user"),
    path('Edit_user/<int:type>/<str:email>',Edit_user,name="Edit_user"),
    path('Delete_user/<int:type>/<str:email>',Delete_user,name="Delete_user"),
    
    #teams
    path('teams/<int:type>/', teams, name='teams'),
    path('Add_team/<int:type>/',Add_team,name="Add_team"),
    path('View_team/<int:type>/<str:name>',View_team,name="View_team"),
    path('Edit_team/<int:type>/<str:name>',Edit_team,name="Edit_team"),
    path('Delete_team/<int:type>/<str:name>',Delete_team,name="Delete_team"),
    

]
