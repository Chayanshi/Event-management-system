from django.shortcuts import render
from .models import *
from .serializers import *
from django.contrib.auth import login,logout,authenticate
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth.hashers import make_password,check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import re
import random
from .email import *
from datetime import datetime
from django.utils import timezone
from django.db.models import Q
from .pagination import custompagination
# Create your views here.

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
    
def get_random_otp():
    randomotp = random.randint(0000, 9999)
    return randomotp 


class RegisterUser(APIView):
    @swagger_auto_schema(
        operation_description="Fill in information to register",
        operation_summary="User registration",
        tags=['User'],
        request_body=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                required=['email','password'],
                properties={
                    'email':openapi.Schema(type=openapi.TYPE_STRING,default='string@gmail.com'),
                    'firstname':openapi.Schema(type=openapi.TYPE_STRING),
                    'lastname':openapi.Schema(type=openapi.TYPE_STRING),
                    'password':openapi.Schema(type=openapi.TYPE_STRING),
                    'phone':openapi.Schema(type=openapi.TYPE_NUMBER),
                    'role':openapi.Schema(type=openapi.TYPE_STRING),
                    'image': openapi.Schema(type=openapi.TYPE_FILE),
                }
            ),
    )
    def post(self,request):
        password_pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$"
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

        try:
            input = request.data
            
            if not re.match(email_regex, input['email']):
                return Response({'status': status.HTTP_400_BAD_REQUEST, 'message': "Invalid email format"}, status=status.HTTP_400_BAD_REQUEST)
            
            if re.match(password_pattern, input['password']):
                password = make_password(input['password'])
                
                if input['role']=='Organizer':
                    input['is_superuser']=True
                    input['is_staff']=True
                
                image_data = input.get('image')
                if image_data:
                    # Process and save the image
                    image_name = image_data.name
                    input['avatar'] = image_name
                 
                serializers = UserSerializer(data=input)
                if serializers.is_valid():
                    random_otp=get_random_otp()
                    serializers.save(password=password,otp=random_otp,otp_created_at=datetime.now())     # converting to hash password from serializers.py
                    print("\n\notp",random_otp)
                    sendotp(input['email'],random_otp)
                    return Response({'status':status.HTTP_201_CREATED,'response':'user registered successfully'},status=status.HTTP_201_CREATED)
                return Response({'status':status.HTTP_400_BAD_REQUEST,'response':'user can not be created','error':serializers.errors},status=status.HTTP_400_BAD_REQUEST)
            return Response({'status':status.HTTP_400_BAD_REQUEST,'response':'password must contain a capital letter, lower letter, number and a special character'},status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({'status':status.HTTP_500_INTERNAL_SERVER_ERROR,'response':e},status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class Verify_OTP(APIView):
    @swagger_auto_schema(
        operation_description="Verify the sended OTP to user email",
        operation_summary="OTP verification",
        tags=['User','Forgot Password'],
        manual_parameters=[
            openapi.Parameter('email',openapi.IN_QUERY,type=openapi.TYPE_STRING,description="Enter email to get verification otp"),
            openapi.Parameter('OTP',openapi.IN_QUERY,type=openapi.TYPE_INTEGER,description="Enter verification otp, sended on your email")
        ]
    )
    
    def get(self, request):
        email = request.query_params.get('email')
        entered_otp = request.query_params.get('OTP')
        try:
            try:
                user = User_model.objects.get(email=email)
            except Exception as e:
                return Response({'status':status.HTTP_400_BAD_REQUEST,'Response':"email not found"},status=status.HTTP_400_BAD_REQUEST)
            
            print('db',user.otp)
            print('user',entered_otp)
           
            if int(entered_otp) == user.otp and (timezone.now() - user.otp_created_at).seconds <=120:
                user.otp_verified = True
                user.save()
                return Response({'status':status.HTTP_200_OK,'Response':"Otp Verified"},status=status.HTTP_200_OK)
            return Response({'status':status.HTTP_404_NOT_FOUND,'Response':"OTP is not valid, the OTP Valid period is 2 min"},status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'status':status.HTTP_400_BAD_REQUEST,"error":str(e)},status=status.HTTP_400_BAD_REQUEST)
        
        
#UserLogin
       
class User_Login(APIView):
    @swagger_auto_schema(
        operation_description="Fill details to login",
        operation_summary="User Login",
        tags=['User'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email','password'],
            properties={
                'email':openapi.Schema(type=openapi.TYPE_STRING,default="vermaanshi198@gmail.com"),
                'password':openapi.Schema(type=openapi.TYPE_STRING,default="Verma@123")
            }
        )
    )
    def post(self,request):
        try:
            email=request.data['email']
            password=request.data['password']
            user = User_model.objects.get(email=email)
            
            if user.is_block != True:
                if check_password(password,user.password): 
                    token=get_tokens_for_user(user)
                    login(request,user)
                    # user['token_expire']=False
                    print(request.user)     
                    return Response({'status':status.HTTP_202_ACCEPTED,'response':'Logged In successfull','token':token},status=status.HTTP_202_ACCEPTED)
                return Response({'status':status.HTTP_400_BAD_REQUEST,'response':'password is incorrect'},status=status.HTTP_400_BAD_REQUEST)
            return Response({'status':status.HTTP_401_UNAUTHORIZED,"response":"Account is blocked"},status=status.HTTP_401_UNAUTHORIZED)
            
        except Exception as e:
            return Response({'status':status.HTTP_404_NOT_FOUND,'response':'user not found, check you email'},status=status.HTTP_404_NOT_FOUND)

class User_Logout(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(
        operation_description="Retrieve user profile data by ID",
        operation_summary="logout user by id",
        tags=['ProfileDataGet'],
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING),
        ],
    )
    def get(self,request,id):
            try:
                user = User_model.objects.get(id=id)
                user2=request.user
                logout(request)
                return Response({'status':status.HTTP_200_OK,'Response':'logout successfuly'},status.HTTP_200_OK)
            except User_model.DoesNotExist:
                return Response({'status':status.HTTP_400_BAD_REQUEST,'Response':'user not found'},status.HTTP_400_BAD_REQUEST)


class Send_OTP(APIView):
    @swagger_auto_schema(
        operation_description="enter your account detail to get verification email",
        operation_summary="Send email",
        tags=['Forgot Password'],
        manual_parameters=[
            openapi.Parameter('email',openapi.IN_QUERY,type=openapi.TYPE_STRING,description="Enter email to get verification otp")
        ]
    )
    def get(self, request):
        email = request.query_params.get('email')
        try:
            try:
                user = User_model.objects.get(email=email)
            except Exception as e:
                return Response({'status':status.HTTP_400_BAD_REQUEST,'Response':"User not found"},status=status.HTTP_400_BAD_REQUEST)
            
            otp=get_random_otp()
            print(otp)
            sendotp(otp=otp,email=email)
            user.otp = otp
            user.save()
            # if email_result == 1:
            return Response({'status':status.HTTP_200_OK,'Response':"Check your email for otp"},status=status.HTTP_200_OK)
            # return Response({'status':status.HTTP_404_NOT_FOUND,'Response':"OTP can't be sended on this email"},status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'status':status.HTTP_400_BAD_REQUEST,"error":str(e)},status=status.HTTP_400_BAD_REQUEST)
        

class ForgotPassword(APIView):
    @swagger_auto_schema(
        operation_description="Have to verify email with otp, then change the password if you have forgot your password",
        operation_summary="Forgot password",
        tags=['Forgot Password'],
        request_body=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                required=['new_password','confirm_new_password'],
                properties={
                    'new_password':openapi.Schema(type=openapi.TYPE_STRING),
                    'confirm_new_password':openapi.Schema(type=openapi.TYPE_STRING)
                }
            ),
        
        manual_parameters=[
            openapi.Parameter('email',openapi.IN_QUERY,type=openapi.TYPE_STRING,description="Enter email to get verification otp"),
           
        ]
    )
    def put(self,request):
        password_pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$"
        email = request.query_params.get('email')
        try:
            try:
                user = User_model.objects.get(email=email)
            except Exception as e:
                return Response({'status':status.HTTP_400_BAD_REQUEST,'Response':"email not found"},status=status.HTTP_400_BAD_REQUEST)
            
            if not user.otp_verified:
                return Response({'status':status.HTTP_400_BAD_REQUEST,'Response':"Verify email to change password"},status=status.HTTP_400_BAD_REQUEST)
                
            input = request.data
            print(input['new_password'])
            if str(input['new_password']) == str(input['confirm_new_password']):
                if re.match(password_pattern, input['new_password']):
                    hash_password = make_password(input['new_password'])
                    user.password = hash_password
                    user.save()
                    return Response({'status':status.HTTP_200_OK,'Response':"password changed successfully"},status=status.HTTP_200_OK)
                return Response({'status':status.HTTP_400_BAD_REQUEST,'response':'password must contain a capital letter, lower letter, number and a special character'},status=status.HTTP_400_BAD_REQUEST)
            return Response({'status':status.HTTP_400_BAD_REQUEST,'response':'password not match'},status=status.HTTP_400_BAD_REQUEST)
            
        
        except Exception as e:
            return Response({'status':status.HTTP_400_BAD_REQUEST,"error":str(e)},status=status.HTTP_400_BAD_REQUEST)

class ChangePassword(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAuthenticated]
    @swagger_auto_schema(
        operation_description="Have to verify email with otp, then change the password.",
        operation_summary="Change password",
        tags=['change'],
        request_body=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                required=['new_password','confirm_new_password'],
                properties={
                    'current_password':openapi.Schema(type=openapi.TYPE_STRING),
                    'new_password':openapi.Schema(type=openapi.TYPE_STRING),
                    'confirm_new_password':openapi.Schema(type=openapi.TYPE_STRING)
                }
            ),
        
        manual_parameters=[
            # openapi.Parameter('email',openapi.IN_QUERY,type=openapi.TYPE_STRING,description="Enter email to get verification otp"),
            openapi.Parameter('Authorization',openapi.IN_HEADER,type=openapi.TYPE_STRING,description="access token for Authentication")
        ]
    )
    def put(self,request):
        password_pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$"
        # email = request.query_params.get('email')
        email = request.user
        try:
            try:
                user = User_model.objects.get(email=email)
            except Exception as e:
                return Response({'status':status.HTTP_400_BAD_REQUEST,'Response':"email not found"},status=status.HTTP_400_BAD_REQUEST)
             
            input = request.data
            print(input['new_password'])
            if check_password(str(input['current_password']),user.password):  
                if str(input['new_password']) == str(input['confirm_new_password']):
                    if re.match(password_pattern, input['new_password']):
                        hash_password = make_password(input['new_password'])
                        user.password = hash_password
                        user.save()
                        return Response({'status':status.HTTP_200_OK,'Response':"password changed successfully"},status=status.HTTP_200_OK)
                    return Response({'status':status.HTTP_400_BAD_REQUEST,'response':'password must contain a capital letter, lower letter, number and a special character'},status=status.HTTP_400_BAD_REQUEST)
                return Response({'status':status.HTTP_400_BAD_REQUEST,'response':'confirm password and new pasword not match'},status=status.HTTP_400_BAD_REQUEST)
            return Response({'status':status.HTTP_400_BAD_REQUEST,'response':'current password not match'},status=status.HTTP_400_BAD_REQUEST)
            
        
        except Exception as e:
            return Response({'status':status.HTTP_400_BAD_REQUEST,"error":str(e)},status=status.HTTP_400_BAD_REQUEST)
         


#Update User
class UpdateUser(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Update User details",
        operation_summary="User Update",
        tags=['User'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=[],
            properties={
                'image': openapi.Schema(type=openapi.TYPE_FILE),
                'firstname': openapi.Schema(type=openapi.TYPE_STRING),
                'lastname': openapi.Schema(type=openapi.TYPE_STRING),
                'phone': openapi.Schema(type=openapi.TYPE_NUMBER),
                'role': openapi.Schema(type=openapi.TYPE_STRING),
                'image': openapi.Schema(type=openapi.TYPE_FILE),
            }
        ),
        manual_parameters=[
            openapi.Parameter('email', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Enter email to get verification otp"),
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication")
        ]
    )
    def put(self, request):
        email = request.query_params.get('email')

        try:
            try:
                user = User_model.objects.get(email=email)
            except Exception as e:
                return Response({'status': status.HTTP_400_BAD_REQUEST, 'Response': "email not found"}, status=status.HTTP_400_BAD_REQUEST)

            input_data = request.data
            if input_data['role'] == 'Organizer':
                input_data['is_superuser'] = True
                input_data['is_staff'] = True

            # Handle the uploaded image
            image_data = input_data.get('image')
            if image_data:
                user.avatar = image_data
                user.save()

            ser = UserSerializer(user, data=input_data, partial=True)
            if ser.is_valid():
                ser.save()
                return Response({'status': status.HTTP_202_ACCEPTED, 'Response': "updated successfully"}, status=status.HTTP_202_ACCEPTED)
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'Response': "Can't update data", "error": ser.errors},
                            status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class DeleteUser(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(
        operation_description="Delete User",
        operation_summary="Delete User",
        tags=['User'],
        manual_parameters=
        [
            openapi.Parameter('email', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING),
        ]
    )
    def delete(self,request):
        email = request.query_params.get('email')
        try:
            user = User_model.objects.get(email=request.user)
            user.delete()
            return Response({'status':status.HTTP_200_OK,"message": "User  deleted"}, status=status.HTTP_200_OK)
        except User_model.DoesNotExist:
            return Response({'status':status.HTTP_400_BAD_REQUEST,"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)



class ViewUser(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_classes = custompagination
    
    @swagger_auto_schema(
        operation_description="Get all User detail,Only Admin have this permission",
        operation_summary="All User Details",
        tags=['User'],
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication"),
            openapi.Parameter('search', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Search users by email, first name, or last name (case-insensitive)")
        ]
    )
    def get(self, request):
        search_query = request.query_params.get('search', '')
        
        if request.user.role in ['Organizer','organizer']:
            users = User_model.objects.all().exclude(role='organizer')
            
        elif request.user.role in ['Coach','coach']:
            users = User_model.objects.filter(role='player')
            
        elif request.user.role in ['Player','player']:
            users = User_model.objects.get(email=request.user.email)
            
        else:
            users = User_model.objects.filter(role=['other','organizer'])


        # Apply search filter if a search query is provided
        if search_query:
            users = users.filter(Q(email__icontains=search_query) | Q(firstname__icontains=search_query) | Q(lastname__icontains=search_query))

        total_count = users.count()
        paginator = self.pagination_classes()
        users = paginator.paginate_queryset(queryset=users, request=request)
        ser = GetUserSerializer(users, many=True)  # Serialize a list of users
        return Response({'status': status.HTTP_200_OK, "count": total_count, "next": paginator.get_next_link(), "previous": paginator.get_previous_link(), 'response': ser.data}, status=status.HTTP_200_OK)



class Get_ParticularUser(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAuthenticated]
    @swagger_auto_schema(
        operation_description="Get particular Teacher detail, only a Principle or Admin can access this",
        operation_summary="Principle Detail",
        tags=['User'],
        manual_parameters=[
            openapi.Parameter('email',openapi.IN_QUERY,type=openapi.TYPE_STRING,description="Enter email to get verification otp"),
            openapi.Parameter('Authorization',openapi.IN_HEADER,type=openapi.TYPE_STRING,description="access token for Authentication")
        ]
    )
    def get(self, request):
        email = request.query_params.get('email')
        try:
            try:
                user = User_model.objects.get(email=email)
            except Exception as e:
                return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        
 
            user = User_model.objects.get(email=user)
            ser = GetUserSerializer(user)
            
            return Response({'status': status.HTTP_200_OK, 'response': ser.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'response': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 

#Team API View

class RegisterTeam(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Register a Team",
        operation_summary="Register Team",
        tags=['Team'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'coach', 'players'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING),
                'coach': openapi.Schema(type=openapi.TYPE_STRING, description='Enter email id of coach'),
                'players': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_STRING),
                    description='Enter email id of players'
                )
            }
        ),
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication")
        ]
    )
    def post(self, request):
        try:
            user = request.user  
            if user.role not in ['Organizer', 'Coach']:
                return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': 'Only an organizer or a coach can create a team'}, status=status.HTTP_400_BAD_REQUEST)

            input_data = request.data
            coach = User_model.objects.get(email=input_data['coach'])
            
            team = Team_Model.objects.create(team_name=input_data['name'], coach=coach)

            for player_email in input_data['players']:
                try:
                    player = User_model.objects.get(email=player_email)
                    team.player.add(player)
                except User_model.DoesNotExist:
                    return Response({'status': status.HTTP_201_CREATED, 'response': 'All player account have to be created'}, status=status.HTTP_201_CREATED)

            return Response({'status': status.HTTP_201_CREATED, 'response': 'Team registered successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'response': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except User_model.DoesNotExist:
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': "Coach email is not valid"}, status=status.HTTP_400_BAD_REQUEST)
        
        
class ViewTeams(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_classes = custompagination
    
    @swagger_auto_schema(
        operation_description="Get all teams detail",
        operation_summary="All Teams Details",
        tags=['Team'],
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication"),
            openapi.Parameter('search', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Search users by email, first name, or last name (case-insensitive)")
        ]
    )
    def get(self, request):
        search_query = request.query_params.get('search', '')

        teams = Team_Model.objects.all()
        # Apply search filter if a search query is provided
        if search_query:
            teams = teams.filter(
                Q(team_name__icontains=search_query)
            )

        total_count = teams.count()
        paginator = self.pagination_classes()
        teams = paginator.paginate_queryset(queryset=teams, request=request)
        ser = GetTeamSerializer(teams, many=True)  # Serialize a list of teams
        return Response({
            'status': status.HTTP_200_OK,
            "count": total_count,
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
            'response': ser.data
        }, status=status.HTTP_200_OK)
        

class Get_ParticularTeam(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAuthenticated]
    @swagger_auto_schema(
        operation_description="Get particular Team detail",
        operation_summary="Team Detail",
        tags=['Team'],
        manual_parameters=[
            openapi.Parameter('team_name',openapi.IN_QUERY,type=openapi.TYPE_STRING,description="Team Name"),
            openapi.Parameter('Authorization',openapi.IN_HEADER,type=openapi.TYPE_STRING,description="access token for Authentication")
        ]
    )
    def get(self, request):
        team_name = request.query_params.get('team_name')
        try:
 
            team = Team_Model.objects.get(team_name=team_name)
            ser = GetTeamSerializer(team)
            
            return Response({'status': status.HTTP_200_OK, 'response': ser.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'response': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
     
class UpdateTeams(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Update Team",
        operation_summary="Update Team",
        tags=['Team'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=[],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING),
                'coach': openapi.Schema(type=openapi.TYPE_STRING, description='Enter email id of coach'),
                'players': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_STRING),
                    description='Enter email id of players'
                )
            }
        ),
        manual_parameters=[
            openapi.Parameter('Team_name', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Team name, Note if team name is updated enter previous name of the team"),
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication")
        ]
    )
    def put(self, request):
        team_name = request.query_params.get('Team_name')
        try:
            input_data = request.data
            print(input_data)
            team = Team_Model.objects.get(team_name=team_name)
            if input_data['name']:
                team.team_name = input_data['name']
            
            coach = User_model.objects.get(email=input_data['coach'])
            team.coach = coach
            for player_email in input_data['players']:
                try:
                    player = User_model.objects.get(email=player_email)
                    team.player.add(player)
                except User_model.DoesNotExist:
                    return Response({'status': status.HTTP_201_CREATED, 'response': 'All player account have to be created'}, status=status.HTTP_201_CREATED)
            
            team.save()
            return Response({'status': status.HTTP_200_OK, 'response': 'Team updated successfully'}, status=status.HTTP_200_OK)
        except Team_Model.DoesNotExist:
            return Response({'status': status.HTTP_401_BAD_REQUEST, 'response': 'Team not found'}, status=status.HTTP_400_BAD_REQUEST)


class DeleteTeam(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Delete Team",
        operation_summary="Delete Team",
        tags=['Team'],
        manual_parameters=[
            openapi.Parameter('team_name',openapi.IN_QUERY,type=openapi.TYPE_STRING,description="Team Name"),
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication")
        ]
    )
    def delete(self, request):
        team_name = request.query_params.get('team_name')

        try:
            team = Team_Model.objects.get(team_name=team_name)
            team.delete()
            return Response({'status':status.HTTP_200_OK, 'response': 'Team deleted successfully'}, status=status.HTTP_200_OK)
        except Team_Model.DoesNotExist:
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': 'Team not found'}, status=status.HTTP_400_BAD_REQUEST)



#Event API View

class RegisterEvent(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Register an Event",
        operation_summary="Register Event",
        tags=['Event'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'organizer', 'start_date', 'end_date', 'location'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING),
                'organizer': openapi.Schema(type=openapi.TYPE_STRING, description='Enter email id of the organizer'),
                'start_date': openapi.Schema(type=openapi.TYPE_STRING, description='Start date and time (YYYY-MM-DDTHH:MM:SS)'),
                'end_date': openapi.Schema(type=openapi.TYPE_STRING, description='End date and time (YYYY-MM-DDTHH:MM:SS)'),
                'location': openapi.Schema(type=openapi.TYPE_STRING),
                'teams': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_STRING),
                    description='Enter team names'
                ),
            }
        ),
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication")
        ]
    )

    def post(self, request):
        try:
            if request.user.role not in ['Organizer', 'organizer']:
                return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': 'Only an organizer can host an Event'}, status=status.HTTP_400_BAD_REQUEST)

            input_data = request.data
            organizer = User_model.objects.get(email=input_data['organizer'])
            teams = [Team_Model.objects.get(team_name=team_name) for team_name in input_data['teams']]

            event = Event_Model.objects.create(
                name=input_data['name'],
                start_date=input_data['start_date'],
                end_date=input_data['end_date'],
                location=input_data['location'],
                organizer=organizer,
            )

            event.save()
            event.teams.set(teams)
            
            return Response({'status': status.HTTP_201_CREATED, 'response': 'Event registered successfully'}, status=status.HTTP_201_CREATED)
            # return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'response': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ViewEvent(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_classes = custompagination

    @swagger_auto_schema(
        operation_description="View Event",
        operation_summary="View Event",
        tags=['Event'],
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication"),
            openapi.Parameter('search', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Search users by email, first name, or last name (case-insensitive)")
        ]
    )

    def get(self, request):
        search_query = request.query_params.get('search', '')
        try:
            event = Event_Model.objects.all()
            if search_query:
                event = event.filter(
                    Q(name__icontains=search_query)
                )

            total_count = event.count()
            paginator = self.pagination_classes()
            event = paginator.paginate_queryset(queryset=event, request=request)
            serializer = EventSerializer(event, many=True)
            return Response({
            'status': status.HTTP_200_OK,
            "count": total_count,
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
            'response': serializer.data
        }, status=status.HTTP_200_OK)
        except Event_Model.DoesNotExist:
            return Response({'status': status.HTTP_404_NOT_FOUND, 'response': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'response': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Get_ParticularEvent(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAuthenticated]
    @swagger_auto_schema(
        operation_description="Get particular Event detail",
        operation_summary="Event Detail",
        tags=['Event'],
        manual_parameters=[
            openapi.Parameter('id',openapi.IN_QUERY,type=openapi.TYPE_INTEGER,description="Event Name"),
            openapi.Parameter('Authorization',openapi.IN_HEADER,type=openapi.TYPE_STRING,description="access token for Authentication")
        ]
    )
    def get(self, request):
        event_id_str = request.query_params.get('id')

        if not event_id_str:
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': "Event ID is missing."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event_id = int(event_id_str)
            event = Event_Model.objects.get(id=event_id)
            ser = EventSerializer(event)
            return Response({'status': status.HTTP_200_OK, 'response': ser.data}, status=status.HTTP_200_OK)
        except Event_Model.DoesNotExist:
            return Response({'status': status.HTTP_404_NOT_FOUND, 'response': "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': "Invalid Event ID format."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'response': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
        
class UpdateEvent(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Update Event",
        operation_summary="Update Event",
        tags=['Event'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=[],
            properties={
                'new_name': openapi.Schema(type=openapi.TYPE_STRING),
                'organizer': openapi.Schema(type=openapi.TYPE_STRING, description='Enter email id of the organizer'),
                'start_date': openapi.Schema(type=openapi.TYPE_STRING, description='Start date and time (YYYY-MM-DDTHH:MM:SS)'),
                'end_date': openapi.Schema(type=openapi.TYPE_STRING, description='End date and time (YYYY-MM-DDTHH:MM:SS)'),
                'location': openapi.Schema(type=openapi.TYPE_STRING),
                'teams': openapi.Schema(type=openapi.TYPE_ARRAY,items=openapi.Items(type=openapi.TYPE_STRING),description='Enter team names'),
            }
        ),
        manual_parameters=[
            openapi.Parameter('id',openapi.IN_QUERY,type=openapi.TYPE_INTEGER,description="Event Name"),
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication")
        ]
    )
    def put(self, request):
        event_id_str = request.query_params.get('id')

        if not event_id_str:
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': "Event ID is missing."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            input_data = request.data
            event_id = int(event_id_str)
            event = Event_Model.objects.get(id=event_id)
            
            organizer = None
            if 'organizer' in input_data:
                organizer = User_model.objects.get(email=input_data['organizer'])

            teams = []
            if 'teams' in input_data:
                teams = [Team_Model.objects.get(team_name=team_name) for team_name in input_data['teams']]

            event.name=input_data['new_name']
            event.start_date=input_data['start_date']
            event.end_date=input_data['end_date']
            event.location=input_data['location']
            event.organizer=organizer
            event.teams.set(teams)
            event.save()
            
            return Response({'status': status.HTTP_200_OK, 'response': 'Team updated successfully'}, status=status.HTTP_200_OK)
        except Team_Model.DoesNotExist:
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': 'Team not found'}, status=status.HTTP_400_BAD_REQUEST)


class DeleteEvent(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Delete Event",
        operation_summary="Delete Event",
        tags=['Event'],
        manual_parameters=[
            openapi.Parameter('id',openapi.IN_QUERY,type=openapi.TYPE_INTEGER,description="Event Name"),
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication")
        ]
    )
    def delete(self, request):
        event_id_str = request.query_params.get('id')

        if not event_id_str:
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': "Event ID is missing."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event_id = int(event_id_str)
            event = Event_Model.objects.get(id=event_id)
            event.delete()
            return Response({'status':status.HTTP_200_OK, 'response': 'event deleted successfully'}, status=status.HTTP_200_OK)
        except Event_Model.DoesNotExist:
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': 'event not found'}, status=status.HTTP_400_BAD_REQUEST)



#Match API View

class RegisterMatch(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Register an Match",
        operation_summary="Register Match",
        tags=['Match'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['event', 'team1', 'team2','date'],
            properties={
                'event': openapi.Schema(type=openapi.TYPE_STRING),
                'date': openapi.Schema(type=openapi.TYPE_STRING, description='Start date and time (YYYY-MM-DDTHH:MM:SS)'),
                'result': openapi.Schema(type=openapi.TYPE_STRING),
                'team1': openapi.Schema( type=openapi.TYPE_STRING, description='Enter team name'),
                'team2': openapi.Schema( type=openapi.TYPE_STRING, description='Enter team name'),
            }
        ),
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication")
        ]
    )

    
    def post(self, request):
        try:
            if request.user.role not in ['Organizer', 'organizer']:
                return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': 'Only an organizer can host an Event'}, status=status.HTTP_400_BAD_REQUEST)
            
            data = request.data

            event = Event_Model.objects.get(name=data['event'])
            team1 = Team_Model.objects.get(team_name=data['team1'])
            team2 = Team_Model.objects.get(team_name=data['team2'])
            date = data['date']
            result = data.get('result', None)

            match = Match_Model(event=event, team1=team1, team2=team2, date=date, result=result)
            match.save()

            return Response({'status': status.HTTP_201_CREATED, 'response': 'Match registered successfully'}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'response': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ViewMatch(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_classes = custompagination
    
    @swagger_auto_schema(
        operation_description="Get all teams detail",
        operation_summary="All Teams Details",
        tags=['Match'],
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication"),
            openapi.Parameter('search', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Search users by email, first name, or last name (case-insensitive)")
        ]
    )
    def get(self, request):
        search_query = request.query_params.get('search', '')

        matches = Match_Model.objects.all()
        # Apply search filter if a search query is provided
        if search_query:
            matches = matches.filter(
                Q(team_name__icontains=search_query) | Q(coach__email__icontains=search_query) | Q(player__email__icontains=search_query)
            )

        total_count = matches.count()
        paginator = self.pagination_classes()
        matches = paginator.paginate_queryset(queryset=matches, request=request)
        ser = GetMatchSerializer(matches, many=True)  # Serialize a list of teams
        return Response({
            'status': status.HTTP_200_OK,
            "count": total_count,
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
            'response': ser.data
        }, status=status.HTTP_200_OK)
        

class Get_ParticularMatch(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAuthenticated]
    @swagger_auto_schema(
        operation_description="Get particular Match detail",
        operation_summary="Match Detail",
        tags=['Match'],
        manual_parameters=[
            openapi.Parameter('match_id',openapi.IN_QUERY,type=openapi.TYPE_INTEGER,description="Match ID"),
            openapi.Parameter('Authorization',openapi.IN_HEADER,type=openapi.TYPE_STRING,description="access token for Authentication")
        ]
    )
    def get(self, request):
        match_id = request.query_params.get('match_id')
        try:
 
            match = Match_Model.objects.get(id=match_id)
            ser = GetMatchSerializer(match)
            
            return Response({'status': status.HTTP_200_OK, 'response': ser.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'response': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
 
class UpdateMatch(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Update Match",
        operation_summary="Update Match",
        tags=['Match'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=[],
            properties={
                'event': openapi.Schema(type=openapi.TYPE_STRING),
                'date': openapi.Schema(type=openapi.TYPE_STRING, description='Start date and time (YYYY-MM-DDTHH:MM:SS)'),
                'result': openapi.Schema(type=openapi.TYPE_STRING),
                'team1': openapi.Schema( type=openapi.TYPE_STRING, description='Enter team name'),
                'team2': openapi.Schema( type=openapi.TYPE_STRING, description='Enter team name'),
            }
        ),
        manual_parameters=[
            openapi.Parameter('match_id', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, description="Enter Match ID"),
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication")
        ]
    )
    def put(self, request):
        match_id = request.query_params.get('match_id')
        try:
            input_data = request.data
            match = Match_Model.objects.get(id=match_id)
            match.event = Event_Model.objects.get(name=input_data['event'])
            match.team1 = Team_Model.objects.get(team_name=input_data['team1'])
            match.team2 = Team_Model.objects.get(team_name=input_data['team2'])
            match.date = input_data['date']
            match.result = input_data['result']
            match.save()
            
            return Response({'status': status.HTTP_200_OK, 'response': 'Match updated successfully'}, status=status.HTTP_200_OK)
        except Team_Model.DoesNotExist:
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': 'Match not found'}, status=status.HTTP_400_BAD_REQUEST)


class DeleteMatch(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Delete Match",
        operation_summary="Delete Match",
        tags=['Match'],
        manual_parameters=[
            openapi.Parameter('match_id',openapi.IN_QUERY,type=openapi.TYPE_NUMBER,description='Match ID'),
            openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING, description="access token for Authentication")
        ]
    )
    def delete(self, request):
        match_id = request.query_params.get('match_id')

        try:
            match = Match_Model.objects.get(id=match_id)
            match.delete()
            return Response({'status':status.HTTP_200_OK, 'response': 'match deleted successfully'}, status=status.HTTP_200_OK)
        except Match_Model.DoesNotExist:
            return Response({'status': status.HTTP_400_BAD_REQUEST, 'response': 'match not found'}, status=status.HTTP_400_BAD_REQUEST)
