from django.shortcuts import render, redirect
import requests
from datetime import datetime
from django.core.exceptions import ValidationError
from django.utils import timezone

base_url="http://127.0.0.1:8000/api/"


def set_session_data(request,token,email):
    request.session['email'] = email
    request.session['token'] = token


def get_email_from_session(request):
    email = request.session.get('email')
    return email

def get_token_from_session(request):
    token = request.session.get('token')
    return token['access']

    
    
def clear_session(request):
    request.session.clear()


def format_date(date_string):
    # Parse the date string from the API response
    parsed_date = datetime.fromisoformat(date_string)

    # Format the date in the desired format "YY-MM-DD HH:MM"
    formatted_date = parsed_date.strftime('%y-%m-%d %H:%M')

    return formatted_date
    

# Create your views here.
def main(request):
    return render(request, 'main.html')


def login(request, type):
    login_url=f"{base_url}Login"
    
    if request.method == "POST":
        email = request.POST['email']
        password = request.POST['password']

        api_url = f"{base_url}Login"
        data = {'email': email, 'password': password}
        response = requests.post(api_url, data=data)
        
        response_data = response.json()
        if response.status_code == 202:
            token = response_data.get('token')
            set_session_data(request, token,email)
            return redirect(homepage,type)
        elif response.status_code == 400:
            error_msg = response_data.get('response')  # Get the 'response' message from the API response
            return render(request, 'login.html',context={'type': type,'error':error_msg})
        elif response.status_code == 401:
             error_msg = response_data.get('response')  # Get the 'response' message from the API response
             return render(request, 'login.html',context={'type': type,'error':error_msg})
        elif response.status_code == 404:
             error_msg = response_data.get('response')  
             return render(request, 'login.html',context={'type': type,'error':error_msg})
        else:
        # Display the login form
            return render(request, 'login.html')
    
    return render(request, 'login.html', context={'type': type})


def logout(request):
    clear_session(request)
    return redirect(main)


def register(request):
    if request.method == 'POST':
        email = request.POST['email']
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        password = request.POST['password']
        confirm_password = request.POST['confirmpassword']
        phone = request.POST['phone']
        role = request.POST['role']
        image = request.FILES.get('photo')

        if confirm_password != password:
            error = "password not match. Please try again."
            # You can pass the error message to your registration template
            return render(request, 'register.html',context={'error':error})
        # Handle file upload if needed
        if not image:
            image=None

        # Create a dictionary with the data to send to the API
        data = {
            "email": email,
            "firstname": firstname,
            "lastname": lastname,
            "password": password,
            "phone": phone,
            "role": role,
            "image":image,
        }
        print(data['phone'])
        api_url=f"{base_url}Register"
        # Make a POST request to your API
        response = requests.post(api_url, json=data)
        print(response,response.json(),"\n\n")

        if response.status_code == 201:
            return render(request,"register_verify.html",context={'email':email})
        else:
            if response.status_code == 400:
                # Handle specific HTTP 400 errors, if needed
                error =response.json()
            else:
                # Handle other status codes with a generic error message
                error = response.json()
            
            try:
                response_data = response.json()
                error_message = response_data.get('error_message')
                if error_message:
                    error = error_message
            except ValueError:
                # If the response is not valid JSON, handle the error gracefully
                pass
    
        return render(request, 'register.html', context={'error': error})

    else:
        # If it's a GET request, simply render the registration form template
        return render(request, 'register.html')

def register_otp(request,email):
    if request.method == "POST":
        otp = request.POST['otp']
        verify_otp_url = f"{base_url}Verify_OTP?email={email}&OTP={otp}"


        # data = {'email': email,'OTP':otp}
        response = requests.get(verify_otp_url)
        print(response)
        response_data = response.json()
        if response.status_code == 200:
            return redirect(main)
        else:
            error_msg = response_data.get('response')  
            # return render(request, 'forgot.html', context={'email': email})
            return render(request, 'register_verify.html',context={'type': type,'error':error_msg,'email':email})
    context={
        'email':email
    }   
    return render(request,"register_verify.html",context=context)


def forgot_email(request):
    if request.method == "POST":
        email = request.POST['email']
        SendOTP_url=f"{base_url}SendOTP?email={email}"

        data = {'email': email}
        response = requests.get(SendOTP_url)
        print(response)
        response_data = response.json()
        if response.status_code == 200:
            return redirect('verify_otp', email=email)
        else:
            error_msg = response_data.get('response')
            return render(request, 'forgot_email.html',context={'error':error_msg,'email':email})
        
    return render(request,"forgot_email.html")

def verify_otp(request,email):
    
    if request.method == "POST":
        otp = request.POST['otp']
        verify_otp_url = f"{base_url}Verify_OTP?email={email}&OTP={otp}"


        data = {'email': email,'OTP':otp}
        response = requests.get(verify_otp_url)
        print(response)
        response_data = response.json()
        if response.status_code == 200:
            return redirect(forgot,email)
        else:
            error_msg = response_data.get('response')  
            # return render(request, 'forgot.html', context={'email': email})
            return render(request, 'otp_verify.html',context={'type': type,'error':error_msg,'email':email})
    context={
        'email':email
    }   
    return render(request,"otp_verify.html",context=context)


def forgot(request,email):
    Forgotpassword_url=f"{base_url}Forgotpassword?email={email}"
    if request.method == "POST":
        new_password = request.POST['new_password']
        confirm_new_password = request.POST['confirm_new_password']

        data = {'new_password': new_password,'confirm_new_password':confirm_new_password}
        response = requests.put(Forgotpassword_url, data=data)
        
        response_data = response.json()
        print(response_data)
        if response.status_code == 202:
            return redirect(main)
        else:
            error_msg = response_data.get('response')  
            return render(request, 'forgot.html',context={'type': type,'error':error_msg})
    context={
        'email':email
    }  
    return render(request,"forgot.html",context=context)



# Update the homepage view
def homepage(request, type):
    context = {
            'type': type,
        }
    if type == 1:   
        token=get_token_from_session(request)

        if not token:
            return redirect('login')

        match_url = f"{base_url}ViewMatchs"
        event_url = f"{base_url}ViewEvent"
        teams_url = f"{base_url}GetAllTeams"
        view_user_url = f"{base_url}ViewUser"


        headers = {
            'Authorization': f'Bearer {token}',
        }
        print(headers)
        match_response = requests.get(match_url, headers=headers)
        event_response = requests.get(event_url, headers=headers)
        teams_response = requests.get(teams_url, headers=headers)
        view_user_response = requests.get(view_user_url, headers=headers)
       
        
        # print('response',response)
        match_response_data = match_response.json()
        event_response_data = event_response.json()
        teams_response_data = teams_response.json()
        # print(response_data, 'hiii')

        organizers = []
        if view_user_response.status_code == 200:
            user_data = view_user_response.json()
            players = [user for user in user_data['response'] if user['role'] == "Player"]


        #matches
        if match_response.status_code == 200:
            for match in match_response_data['response']:
                match['date'] = format_date(match['date'])
        
        ###events
        if event_response.status_code == 200:
            for event in event_response_data['response']:
                event['start_date'] = format_date(event['start_date'])
                event['end_date'] = format_date(event['end_date'])

                event['num_teams'] = len(event['teams'])

        ###teams
        if teams_response.status_code == 200:
            teams_data = []

            for team in teams_response_data['response']:
                team_name = team.get('team_name')
                coach = team.get('coach')
                coach_name = f"{coach['firstname']} {coach['lastname']}"
                players = team.get('player')
                player_names = [f"{player['firstname']} {player['lastname']}" for player in players]

                team_info = {
                    'team_name': team_name,
                    'coach_name': coach_name,
                    'player_names': player_names,
                }

                teams_data.append(team_info)
    
            context = {
                'type': type,
                'matches_data': match_response_data['response'],
                'events_data': event_response_data['response'],
                'teams_data': teams_data,
                'player': players,
            }
            return render(request, 'other_users/home.html', context=context)
    elif type == 2:
        token=get_token_from_session(request)
        email = get_email_from_session(request)
        get_logged_user_url = f"{base_url}GetUser?email={email}"
        headers = {
        'Authorization': f'Bearer {token}',
        }
        log_user_response = requests.get(get_logged_user_url, headers=headers)
        # print('response',log_user_response)
        log_user_role=""
        if log_user_response.status_code == 200:
            log_user_response_data = log_user_response.json()
            log_user_role = log_user_response_data['response']['role']
         
        # print(log_user_role,'log_user_role')  
        if log_user_role !='Organizer':
            error_msg = "Only an Organizer can login"
            return render(request, 'login.html',context={'type': type,'error':error_msg}) 
        
        return redirect('dashboard',type)
        
    else:
        return redirect('main')
            
    

# Other users' URLs
def home(request, type):
    return render(request, 'other_users/home.html', context={'type': type})
    

def profile(request, type):
    token = get_token_from_session(request)
    email = get_email_from_session(request)
    if not token:
        return redirect('login')
    try:
        get_logged_user_url = f"{base_url}GetUser?email={email}"
        
        headers = {
            'Authorization': f'Bearer {token}',
        }
        log_user_response = requests.get(get_logged_user_url, headers=headers)
        if log_user_response.status_code == 200:
            log_user_response_data = log_user_response.json()
            context = {
                'type': type,
                'logged_user':log_user_response_data['response']
            }
            return render(request, 'other_users/profile.html', context=context)
        
    except Exception as e:
        context = {
            'type': type,
        }
        return render(request, 'other_users/profile.html', context=context)

   

def edit_profile(request, type):
    token = get_token_from_session(request)
    email = get_email_from_session(request)
    
    if not token:
        return redirect('login')
    
    get_logged_user_url = f"{base_url}GetUser?email={email}"
    update_user_url = f"{base_url}Update?email={email}"
    
    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    
    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        context = {
            'type': type,
            'logged_user': log_user_response_data['response']
        }
        if request.method == "POST":
            firstname = request.POST.get('firstname')
            lastname = request.POST.get('lastname')
            role = request.POST.get('role')
            phone = request.POST.get('phone')
            image = request.FILES.get('image')
            
            data = {
                'firstname': firstname,
                'lastname': lastname,
                'role': role,
                'phone': phone,
            }
            file = { }
            if image:
                file['image'] = image
                
            print('data')
            update_user_response = requests.put(update_user_url, data=data , files=file,  headers=headers)
            print('update_user_response',update_user_response)
            
            if update_user_response.status_code == 202:
                return redirect('profile', type=type)
            
            else:
                context['error'] = "Profile update failed."
        return render(request, 'other_users/edit_profile.html', context=context)
    
    return redirect('login')

# Organizer home URLs
def dashboard(request, type):
    token = get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    try:
        event_url = f"{base_url}ViewEvent"
        user_url = f"{base_url}ViewUser"
        teams_url = f"{base_url}GetAllTeams"
        matches_url = f"{base_url}ViewMatchs"

        get_logged_user_url = f"{base_url}GetUser?email={email}"

        headers = {
            'Authorization': f'Bearer {token}',
        }

        # Fetch data from various APIs
        log_user_response = requests.get(get_logged_user_url, headers=headers)
        user_response = requests.get(user_url, headers=headers)
        team_response = requests.get(teams_url, headers=headers)
        matches_response = requests.get(matches_url, headers=headers)
        event_response = requests.get(event_url, headers=headers)

        # Initialize variables with default values
        log_user_avatar = ""
        log_user_first = ""
        log_user_last = ""
        log_user_role = ""
        user_count = 0
        team_count = 0
        match_count = 0
        event_count = 0
        event_response_data = []

        # Check the status codes and fetch the data
        if log_user_response.status_code == 200:
            log_user_response_data = log_user_response.json()
            log_user_avatar = log_user_response_data['response']['avatar']
            log_user_first = log_user_response_data['response']['firstname']
            log_user_last = log_user_response_data['response']['lastname']
            log_user_role = log_user_response_data['response']['role']

        if user_response.status_code == 200:
            user_response_data = user_response.json()
            user_count = user_response_data.get('count', 0)

        if team_response.status_code == 200:
            team_response_data = team_response.json()
            team_count = team_response_data.get('count', 0)
        
        if matches_response.status_code == 200:
            matches_response_data = matches_response.json()
            match_count = matches_response_data.get('count', 0)
        
        if event_response.status_code == 200:
            event_response_data = event_response.json()
            # Format date and time for events
            for event in event_response_data['response']:
                event['start_date'] = format_date(event['start_date'])
                event['end_date'] = format_date(event['end_date'])
                event['num_teams'] = len(event['teams'])
                # print(event['num_teams'] )
                
            # num_teams = len(response_data['response']['teams'])
            event_count = len(event_response_data['response'])  # Use len to count the events
        
        context = {
            'type': type,
            'data': event_response_data['response'],
            'event_count': event_count,
            'team_count': team_count,
            'match_count': match_count,
            'user_count': user_count,
            'log_user_avatar': log_user_avatar,
            'log_user_first': log_user_first,
            'log_user_last': log_user_last,
            'log_user_role': log_user_role,
        }

        return render(request, 'organizer/dashboard.html', context=context)
    except Exception as e:
        context = {
            'type': type,
        }
        return render(request, 'organizer/dashboard.html', context=context)

    # else:
    #     context = {
    #         'type': type,
    #     }
    #     return render(request, 'organizer/dashboard.html', context={'type': type})



#matches

def matches(request, type):
    token=get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    api_url = f"{base_url}ViewMatchs"
    search_query = request.GET.get('search')
    get_logged_user_url = f"{base_url}GetUser?email={email}"

    headers = {
        'Authorization': f'Bearer {token}',
    }
    # print(headers)
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    context = {}
    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        context['log_user_avatar'] = log_user_response_data['response']['avatar']
        context['log_user_first'] = log_user_response_data['response']['firstname']
        context['log_user_last'] = log_user_response_data['response']['lastname']
        context['log_user_role'] = log_user_response_data['response']['role']

    response = requests.get(api_url, headers=headers)
    # print('response',response)
    response_data = response.json()
    # print(response_data, 'hiii')

    if response.status_code == 200:

        for event in response_data['response']:
            event['date'] = format_date(event['date'])
            

        context = {
            'type': type,
            'matches_data': response_data['response'],
        }
        if type == 1:
            return render(request, 'other_users/matches.html', context=context)
        elif type == 2:
            return render(request, 'organizer/matches.html', context=context)
    else:
        context = {
            'type': type,
        }
        if type == 1:
            return render(request, 'other_users/matches.html', context=context)
        elif type == 2:
            return render(request, 'organizer/matches.html', context=context)
        else:
            return redirect('main')

def Add_match(request, type):
    token = get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    # API URLs
    get_logged_user_url = f"{base_url}GetUser?email={email}"
    match_url = f"{base_url}RegisterMatch"
    event_url = f"{base_url}ViewEvent"

    headers = {
        'Authorization': f'Bearer {token}',
    }

    # Fetch data from APIs
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    event_response = requests.get(event_url, headers=headers)

    context = {
        'type': type,
    }

    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        context['log_user_avatar'] = log_user_response_data['response']['avatar']
        context['log_user_first'] = log_user_response_data['response']['firstname']
        context['log_user_last'] = log_user_response_data['response']['lastname']
        context['log_user_role'] = log_user_response_data['response']['role']

    if event_response.status_code == 200:
        event_data = event_response.json()['response']
        event_names = [event['name'] for event in event_data]
        team_names = [team for event in event_data for team in event.get('teams', [])]

        context['event_names'] = event_names
        context['team_names'] = team_names

    if request.method == "POST":
        data = {
            'event': request.POST['event'],
            'team1': request.POST['team1'],
            'team2': request.POST['team2'],
            'date': request.POST['date'],
            'result': request.POST['result'],
        }

        api_url = match_url

        response = requests.post(api_url, json=data, headers=headers)

        if response.status_code == 201:
            return redirect('matches', type=type)

    return render(request, 'organizer/add_match.html', context=context)


def Edit_match(request, type, id):
    token = get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    # API URLs
    get_logged_user_url = f"{base_url}GetUser?email={email}"
    match_url = f"{base_url}ParticularMatch?match_id={id}"  # Update the API URL to fetch match details
    event_url = f"{base_url}ViewEvent"

    headers = {
        'Authorization': f'Bearer {token}',
    }

    # Fetch data from APIs
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    match_response = requests.get(match_url, headers=headers)  # Fetch match details
    event_response = requests.get(event_url, headers=headers)

    context = {
        'type': type,
        'id': id,  # Pass the match id to the template
    }

    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        context['log_user_avatar'] = log_user_response_data['response']['avatar']
        context['log_user_first'] = log_user_response_data['response']['firstname']
        context['log_user_last'] = log_user_response_data['response']['lastname']
        context['log_user_role'] = log_user_response_data['response']['role']

    if match_response.status_code == 200:
        match_data = match_response.json()['response']
        context['event'] = match_data['event']
        context['team1'] = match_data['team1']
        context['team2'] = match_data['team2']
        context['date'] = match_data['date']
        context['result'] = match_data['result']

    if event_response.status_code == 200:
        event_data = event_response.json()['response']
        event_names = [event['name'] for event in event_data]
        team_names = [team for event in event_data for team in event.get('teams', [])]

        context['event_names'] = event_names
        context['team_names'] = team_names

    if request.method == "POST":
        data = {
            'event': request.POST['event'],
            'team1': request.POST['team1'],
            'team2': request.POST['team2'],
            'date': request.POST['date'],
            'result': request.POST['result'],
        }

        api_url = f"{base_url}UpdateMatch?match_id={id}"

        response = requests.put(api_url, json=data, headers=headers)

        if response.status_code == 200:
            return redirect('matches', type)  # Redirect to the matches page after a successful update

    return render(request, 'organizer/edit_match.html', context=context)


def View_match(request,type,id):
    event_id=id
    token=get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    api_url = f"{base_url}ParticularMatch?match_id={event_id}"
    get_logged_user_url = f"{base_url}GetUser?email={email}"

    headers = {
        'Authorization': f'Bearer {token}',
    }
    response = requests.get(api_url, headers=headers)
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    # print('response',response)
    response_data = response.json()
    print(response_data, 'hiii')

    log_user_avatar = ""
    log_user_first = ""
    log_user_last = ""
    log_user_role = ""


    if log_user_response.status_code == 200:
            log_user_response_data = log_user_response.json()
            log_user_avatar = log_user_response_data['response']['avatar']
            log_user_first = log_user_response_data['response']['firstname']
            log_user_last = log_user_response_data['response']['lastname']
            log_user_role = log_user_response_data['response']['role']


    if response.status_code == 200:
         # Format date and time
        response_data['response']['date'] = format_date(response_data['response']['date'])

        print(response_data)
        # response_data['response']['teams']=len(response_data['response']['teams'])
        context = {
            'type': type,
            'data': response_data['response'],
            'log_user_avatar': log_user_avatar,
            'log_user_first': log_user_first,
            'log_user_last': log_user_last,
            'log_user_role': log_user_role,
        }
        return render(request, 'organizer/view_match.html', context=context)
    
    return render(request, 'organizer/view_match.html', context={'type': type})


def Delete_match(request,type,id):
    api_url = f"{base_url}DeleteMatch?match_id={id}"

    # Include the authentication token in the headers if needed
    headers = {
        'Authorization': f'Bearer {get_token_from_session(request)}',
    }

    response = requests.delete(api_url, headers=headers)
    print(response)

    if response.status_code == 200:
        return redirect(matches, type=type)
    else:
        return redirect(matches, type=type)
    


## users 
def users(request, type):
    token=get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    api_url = f"{base_url}ViewUser"
    get_logged_user_url = f"{base_url}GetUser?email={email}"

    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    log_user_avatar = ""
    log_user_first = ""
    log_user_last = ""
    log_user_role = ""
    print(headers)
    response = requests.get(api_url, headers=headers)
    log_user_response = requests.get(get_logged_user_url, headers=headers)

    # print('response',response)
    response_data = response.json()
    print(response_data, 'hiii')

    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        log_user_avatar = log_user_response_data['response']['avatar']
        log_user_first = log_user_response_data['response']['firstname']
        log_user_last = log_user_response_data['response']['lastname']
        log_user_role = log_user_response_data['response']['role']

    
    if response.status_code == 200:
        context = {
            'type': type,
            'users_data': response_data['response'],
            'log_user_avatar': log_user_avatar,
            'log_user_first': log_user_first,
            'log_user_last': log_user_last,
            'log_user_role': log_user_role,
        }
    return render(request, 'organizer/users.html', context=context)



def Add_user(request,type):
    token = get_token_from_session(request)
    email = get_email_from_session(request)
    
    if not token:
        return redirect('login')
    
    get_logged_user_url = f"{base_url}GetUser?email={email}"
    
    headers = {
        'Authorization': f'Bearer {token}',
    }
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    context = {
        'type': type,
        'id': id,
    }
    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        context['log_user_avatar'] = log_user_response_data['response']['avatar']
        context['log_user_first'] = log_user_response_data['response']['firstname']
        context['log_user_last'] = log_user_response_data['response']['lastname']
        context['log_user_role'] = log_user_response_data['response']['role']

    
    if request.method == 'POST':
        email = request.POST['email']
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        password = request.POST['password']
        confirm_password = request.POST['confirmpassword']
        phone = request.POST['phone']
        role = request.POST['role']
        image = request.FILES.get('photo')

        if confirm_password != password:
            pw_error = "password not match. Please try again."
            return render(request, 'add_user.html',context={'pw_error':pw_error})

        data = {
            'email': email,
            'firstname': firstname,
            'lastname': lastname,
            'password': password,
            'phone': phone,
            'role': role,
        }
        if image:
            data['image'] = image

        api_url=f"{base_url}Register"
        # Make a POST request to your API
        response = requests.post(api_url, data=data)
        print(response)
        response_data = response.json()
        print(response_data)
        if response.status_code == 201:
           return redirect(users, type=type)
        else:
            # error = "Registration failed. Please try again."
            error= response_data.get('response')
            return render(request, 'organizer/add_user.html', context={'error':error})

    else:
        return render(request, 'organizer/add_user.html', context=context)
    

def Edit_user(request, type, email):
    user_email = email
    token = get_token_from_session(request)
    logged_user_email = get_email_from_session(request)

    if not token:
        return redirect('login')

    logged_user_url = f"{base_url}GetUser?email={logged_user_email}"
    get_user_url = f"{base_url}GetUser?email={user_email}"
    update_user_url = f"{base_url}Update?email={user_email}"

    headers = {
        'Authorization': f'Bearer {token}',
    }

    log_user_response = requests.get(logged_user_url, headers=headers)
    context = {
        'type': type,
        'id': id,  # Pass the match id to the template
    }
    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        context['log_user_avatar'] = log_user_response_data['response']['avatar']
        context['log_user_first'] = log_user_response_data['response']['firstname']
        context['log_user_last'] = log_user_response_data['response']['lastname']
        context['log_user_role'] = log_user_response_data['response']['role']

    user_data = {}
    try:
        # Fetch the user's existing data
        user_response = requests.get(get_user_url, headers=headers)
        print(user_response)
        if user_response.status_code == 200:
            user_data = user_response.json()['response']
            print("User Data:", user_data)  # Add this line for debugging
        else:
            print("User Data Not Found")  # Add this line for debugging
    except Exception as e:
        print("Exception:", e)  # Add this line for debugging
        return render(request, 'organizer/edit_user.html', context=context)

    if request.method == "POST":
        firstname = request.POST.get('firstname')
        lastname = request.POST.get('lastname')
        role = request.POST.get('role')
        phone = request.POST.get('phone')
        image = request.FILES.get('image')
        print("\nimage >>", image)
        data = {
            'firstname': firstname,
            'lastname': lastname,
            'role': role,
            'phone': phone,
        }

        if image:
            data['image'] = image

        # print("image >>", data['image'])
        update_user_response = requests.put(update_user_url, data=data, headers=headers)
        print(update_user_response)
        if update_user_response.status_code == 202:
            return redirect(users, type=type)
        else:
            context = {'type': type, 'user_data': user_data, 'error': update_user_response.json()}
            return render(request, 'organizer/edit_user.html', context=context)

    else:
        print("\n\ndata::",user_data)
        # context = {'type': type, 'user_data': user_data}
        context['user_data']=user_data
        # print(context)

        return render(request, 'organizer/edit_user.html', context=context)

def View_user(request,type,email):
    user_email=email
    token=get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    get_logged_user_url = f"{base_url}GetUser?email={email}"
    get_user_url = f"{base_url}GetUser?email={user_email}"

    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    user_response = requests.get(get_user_url, headers=headers)
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    # print('response',response)
    response_data = user_response.json()
    # print(response_data, 'hiii')

    log_user_avatar = ""
    log_user_first = ""
    log_user_last = ""
    log_user_role = ""


    if log_user_response.status_code == 200:
            log_user_response_data = log_user_response.json()
            log_user_avatar = log_user_response_data['response']['avatar']
            log_user_first = log_user_response_data['response']['firstname']
            log_user_last = log_user_response_data['response']['lastname']
            log_user_role = log_user_response_data['response']['role']


    if user_response.status_code == 200:
        # print(response_data)
        # response_data['response']['teams']=len(response_data['response']['teams'])
        context = {
            'type': type,
            'data': response_data['response'],
            'log_user_avatar': log_user_avatar,
            'log_user_first': log_user_first,
            'log_user_last': log_user_last,
            'log_user_role': log_user_role,
        }
        return render(request, 'organizer/view_user.html', context=context)
    
    return render(request, 'organizer/view_user.html', context=context)

def Delete_user(request,type,email):
    api_url = f"{base_url}Delete?email={email}"

    # Include the authentication token in the headers if needed
    headers = {
        'Authorization': f'Bearer {get_token_from_session(request)}',
    }

    response = requests.delete(api_url, headers=headers)
    print(response)

    if response.status_code == 200:
        return redirect(users, type=type)
    else:
        return redirect(users, type=type)
    



#teams

def teams(request, type):
    token=get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    api_url = f"{base_url}GetAllTeams"
    search_query = request.GET.get('search')
    get_logged_user_url = f"{base_url}GetUser?email={email}"

    headers = {
        'Authorization': f'Bearer {token}',
    }

    log_user_avatar = ""
    log_user_first = ""
    log_user_last = ""
    log_user_role = ""
    
    response = requests.get(api_url, headers=headers)
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    # print('response',response)
    response_data = response.json()

    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        log_user_avatar = log_user_response_data['response']['avatar']
        log_user_first = log_user_response_data['response']['firstname']
        log_user_last = log_user_response_data['response']['lastname']
        log_user_role = log_user_response_data['response']['role']

    # print("response\n\n",response_data['response'])
    if response.status_code == 200:
        teams_data = []

        for team in response_data['response']:
            team_id = team.get('id')
            team_name = team.get('team_name')
            coach = team.get('coach')
            coach_name = f"{coach['firstname']} {coach['lastname']}"
            players = team.get('player')
            player_names = [f"{player['firstname']} {player['lastname']}" for player in players]

            team_info = {
                'id':team_id,
                'team_name': team_name,
                'coach_name': coach_name,
                'player_names': player_names,
                
            }

            teams_data.append(team_info)

        # print(teams_data)
        context = {
            'type': type,
            'data': teams_data,
            'log_user_avatar': log_user_avatar,
            'log_user_first': log_user_first,
            'log_user_last': log_user_last,
            'log_user_role': log_user_role,
        }
        if type == 1:
            return render(request, 'other_users/teams.html', context=context)
        elif type == 2:
            return render(request, 'organizer/teams.html', context=context)
    else:
        context = {
            'type': type,
        }
        if type == 1:
            return render(request, 'other_users/teams.html', context=context)
        elif type == 2:
            return render(request, 'organizer/teams.html', context=context)
        else:
            return redirect('main')

    return render(request, 'organizer/teams.html', context={'type': type})


def Add_team(request,type):
    token = get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    # API URLs
    get_logged_user_url = f"{base_url}GetUser?email={email}"
    view_user_url = f"{base_url}ViewUser"
    team_url = f"{base_url}RegisterTeam"

    headers = {
        'Authorization': f'Bearer {token}',
    }

    log_user_avatar = ""
    log_user_first = ""
    log_user_last = ""
    log_user_role = ""
    # Fetch data from APIs
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    view_user_response = requests.get(view_user_url, headers=headers)
    if view_user_response.status_code == 200:
        user_data = view_user_response.json()
        # Filter only organizers
        players = [user for user in user_data['response'] if user['role'] == "Player"]
        coaches = [user for user in user_data['response'] if user['role'] == "Coach"]

    context={
        'type': type,
        'players':players,
        'coaches':coaches,
    }
    
    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        context['log_user_avatar'] = log_user_response_data['response']['avatar']
        context['log_user_first'] = log_user_response_data['response']['firstname']
        context['log_user_last'] = log_user_response_data['response']['lastname']
        context['log_user_role'] = log_user_response_data['response']['role']


    if request.method == "POST":
        data = {
            'name': request.POST['team_name'],
            'coach': request.POST['coaches'],
            'players': request.POST.getlist('players'),
        }

        api_url = team_url

        response = requests.post(api_url, json=data, headers=headers)

        if response.status_code == 201:
            return redirect('teams', type=type)
        
    context={
        'type': type,
        'players':players,
        'coaches':coaches,
        'log_user_avatar': log_user_avatar,
        'log_user_first': log_user_first,
        'log_user_last': log_user_last,
        'log_user_role': log_user_role,
    }
    return render(request, 'organizer/add_team.html', context=context)

    

def Edit_team(request, type, name):
        team_name = name
        token = get_token_from_session(request)
        email = get_email_from_session(request)

        if not token:
            return redirect('login')

        
        get_logged_user_url = f"{base_url}GetUser?email={email}"
        get_team_url = f"{base_url}ParticularTeam?team_name={team_name}"
        view_user_url = f"{base_url}ViewUser"
        teams_url = f"{base_url}GetAllTeams"

        headers = {
            'Authorization': f'Bearer {token}',
        }

        log_user_avatar = ""
        log_user_first = ""
        log_user_last = ""
        log_user_role = ""

        # Make a GET request to the API to retrieve team data
        get_team_response = requests.get(get_team_url, headers=headers)
        log_user_response = requests.get(get_logged_user_url, headers=headers)
        team_response = requests.get(teams_url, headers=headers)
        view_user_response = requests.get(view_user_url, headers=headers)

        if log_user_response.status_code == 200:
            log_user_response_data = log_user_response.json()
            log_user_avatar = log_user_response_data['response']['avatar']
            log_user_first = log_user_response_data['response']['firstname']
            log_user_last = log_user_response_data['response']['lastname']
            log_user_role = log_user_response_data['response']['role']

        organizers = []
        team_names = []

        if view_user_response.status_code == 200:
            user_data = view_user_response.json()
            # Filter only organizers
            coaches = [user for user in user_data['response'] if user['role'] == "Coach"]
            players = [user for user in user_data['response'] if user['role'] == "Player"]

        if team_response.status_code == 200:
            teams_data = team_response.json()['response']
            team_names = [team['team_name'] for team in teams_data]

        
        if get_team_response.status_code == 200:
            team_data = get_team_response.json()['response']  # Access the team data
            # print("\nhi",team_data)
            context = {
                'type': type,
                'team_data': team_data,
                'log_user_avatar': log_user_avatar,
                'log_user_first': log_user_first,
                'log_user_last': log_user_last,
                'log_user_role': log_user_role,
                'team_names': team_names,
                'coaches': coaches,
                'players':players,
            }
            return render(request, 'organizer/edit_team.html', context=context)
    
        if request.method == 'POST':
            print('\n\nasdfghj\n\n')
            # Retrieve form data from the POST request
            name = request.POST.get('name')
            coach = request.POST.get('coach')
            players = request.POST.getlist('players')

            api_url = f"{base_url}UpdateTeam?Team_name={name}"
            data = {
                'name': name,
                'coach': coach,
                'players': players
            }
            print("data",data)
            response = requests.put(api_url, json=data,headers=headers)
            if response.status_code == 200:
                print(response.text)
                return render(request, 'organizer/teams.html', context=context)
            else:
                return render(request, 'organizer/edit_team.html', context={'type':type,'name':name,'error':"unable to update team details"})
    

def View_team(request, type, name):
    team_name = name
    token = get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    get_logged_user_url = f"{base_url}GetUser?email={email}"
    get_team_url = f"{base_url}ParticularTeam?team_name={team_name}"

    headers = {
        'Authorization': f'Bearer {token}',
    }

    log_user_avatar = ""
    log_user_first = ""
    log_user_last = ""
    log_user_role = ""

    # Make a GET request to the API to retrieve team data
    team_response = requests.get(get_team_url, headers=headers)
    log_user_response = requests.get(get_logged_user_url, headers=headers)

    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        log_user_avatar = log_user_response_data['response']['avatar']
        log_user_first = log_user_response_data['response']['firstname']
        log_user_last = log_user_response_data['response']['lastname']
        log_user_role = log_user_response_data['response']['role']

    if team_response.status_code == 200:
        team_data = team_response.json()['response']  # Access the team data
        # print(team_data)
        # print(log_user_avatar)
        context = {
            'type': type,
            'team_data': team_data, 
            'log_user_avatar': log_user_avatar,
            'log_user_first': log_user_first,
            'log_user_last': log_user_last,
            'log_user_role': log_user_role,
        }

        return render(request, 'organizer/view_team.html', context=context)

    return render(request, 'organizer/view_team.html', context={'type': type})

def Delete_team(request,type,name):
    api_url = f"{base_url}DeleteTeam?team_name={name}"

    # Include the authentication token in the headers if needed
    headers = {
        'Authorization': f'Bearer {get_token_from_session(request)}',
    }

    response = requests.delete(api_url, headers=headers)
    print(response)

    if response.status_code == 200:
        return redirect(teams, type=type)
    else:
        return redirect(teams, type=type)
    # return render(request, 'organizer/team.html', context={'type': type})


#events

def events(request, type):
    token = get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    api_url = f"{base_url}ViewEvent"
    get_logged_user_url = f"{base_url}GetUser?email={email}"

    headers = {
        'Authorization': f'Bearer {token}',
    }
    log_user_avatar = ""
    log_user_first = ""
    log_user_last = ""
    log_user_role = ""
    # print(headers)
    response = requests.get(api_url, headers=headers)
    log_user_response = requests.get(get_logged_user_url, headers=headers)

    # print('response',response)
    response_data = response.json()
    print(response_data, 'hiii')
    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        log_user_avatar = log_user_response_data['response']['avatar']
        log_user_first = log_user_response_data['response']['firstname']
        log_user_last = log_user_response_data['response']['lastname']
        log_user_role = log_user_response_data['response']['role']

    
    if response.status_code == 200:
         # Format date and time
        for event in response_data['response']:
            event['start_date'] = format_date(event['start_date'])
            event['end_date'] = format_date(event['end_date'])

            event['num_teams'] = len(event['teams'])
        # print(len(response_data['response']['teams']))
        # response_data['response']['teams']=len(response_data['response']['teams'])
        context = {
            'type': type,
            'data': response_data['response'],
            'log_user_avatar': log_user_avatar,
            'log_user_first': log_user_first,
            'log_user_last': log_user_last,
            'log_user_role': log_user_role,
        }
        if type == 1:
            return render(request, 'other_users/events.html', context=context)
        elif type == 2:
            return render(request, 'organizer/events.html', context=context)
    else:
        context = {
            'type': type,
        }
        if type == 1:
            return render(request, 'other_users/events.html', context=context)
        elif type == 2:
            return render(request, 'organizer/events.html', context=context)
        else:
            return redirect('main')
    
    
    
def Add_event(request, type):
    token = get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')
    
    # API URLs
    get_logged_user_url = f"{base_url}GetUser?email={email}"
    teams_url = f"{base_url}GetAllTeams"
    view_user_url = f"{base_url}ViewUser"

    headers = {
        'Authorization': f'Bearer {token}',
    }

    # Fetch data from APIs
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    team_response = requests.get(teams_url, headers=headers)
    view_user_response = requests.get(view_user_url, headers=headers)

    # Initialize variables
    organizers = []
    team_names = []

    if view_user_response.status_code == 200:
        user_data = view_user_response.json()
        # Filter only organizers
        organizers = [user for user in user_data['response'] if user['role'] == "Organizer"]

    if team_response.status_code == 200:
        teams_data = team_response.json()['response']
        team_names = [team['team_name'] for team in teams_data]

    print(team_names)
    # Default context data
    context = {
        'type': type,
        'log_user_avatar': '',
        'log_user_first': '',
        'log_user_last': '',
        'log_user_role': '',
        'team_names': team_names,
        'organizers': organizers,
    }

    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        context['log_user_avatar'] = log_user_response_data['response']['avatar']
        context['log_user_first'] = log_user_response_data['response']['firstname']
        context['log_user_last'] = log_user_response_data['response']['lastname']
        context['log_user_role'] = log_user_response_data['response']['role']

    if request.method == "POST":
        # Handle form submission here
        # Retrieve data from the form and make the necessary API request to add the event
        
        # Construct the data to send in the API request
        data = {
            'name': request.POST['name'],
            'organizer': request.POST['organizer'],
            'start_date': request.POST['start_date'],
            'end_date': request.POST['end_date'],
            'location': request.POST['location'],
            'teams': request.POST.getlist('teams'),
        }

       
        
        api_url = f"{base_url}RegisterEvent"  # Replace with the actual API URL

        headers = {
            'Authorization': f'Bearer {token}',
        }

        response = requests.post(api_url, json=data, headers=headers)

        if response.status_code == 201:
            return redirect('events', type)

    return render(request, 'organizer/add_event.html', context=context)
    
def Edit_event(request, type, id):
    event_id = id
    token = get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')
    
    # API URLs
    api_url = f"{base_url}ParticularEvent?id={event_id}"
    get_logged_user_url = f"{base_url}GetUser?email={email}"
    teams_url = f"{base_url}GetAllTeams"
    view_user_url = f"{base_url}ViewUser"

    headers = {
        'Authorization': f'Bearer {token}',
    }
    
    # Fetch data from APIs
    response = requests.get(api_url, headers=headers)
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    team_response = requests.get(teams_url, headers=headers)
    view_user_response = requests.get(view_user_url, headers=headers)

    # Initialize variables
    organizers = []
    team_names = []

    if view_user_response.status_code == 200:
        user_data = view_user_response.json()
        # Filter only organizers
        organizers = [user for user in user_data['response'] if user['role'] == "Organizer"]

    if team_response.status_code == 200:
        teams_data = team_response.json()['response']
        team_names = [team['team_name'] for team in teams_data]

    # Default context data
    context = {
        'type': type,
        'data': {},
        'log_user_avatar': '',
        'log_user_first': '',
        'log_user_last': '',
        'log_user_role': '',
        'team_names': team_names,
        'organizers': organizers,
    }

    if response.status_code == 200:
        response_data = response.json()
        # Format date and time
        response_data['response']['start_date'] = format_date(response_data['response']['start_date'])
        response_data['response']['end_date'] = format_date(response_data['response']['end_date'])
        response_data['response']['num_teams'] = len(response_data['response']['teams'])
        context['data'] = response_data['response']

    if log_user_response.status_code == 200:
        log_user_response_data = log_user_response.json()
        context['log_user_avatar'] = log_user_response_data['response']['avatar']
        context['log_user_first'] = log_user_response_data['response']['firstname']
        context['log_user_last'] = log_user_response_data['response']['lastname']
        context['log_user_role'] = log_user_response_data['response']['role']

    if request.method == "POST":
        new_name = request.POST['name']
        organizer = request.POST['organizer']
        start_date = request.POST['start_date']
        end_date = request.POST['end_date']
        location = request.POST['location']
        teams = request.POST.getlist('teams')
        
        # print(start_date)
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            
            start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
            end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')
            print(start_date)
        except ValueError:
            # Handle invalid date format
            error = "Invalid date format. Please use YYYY-MM-DD HH:MM:SS format."
            context['error']=error
            return render(request, 'organizer/edit_event.html', context)

        # Check if start_date is before end_date
        if start_date >= end_date:
            error = "Start date must be before end date."
            context['error']=error
            return render(request, 'organizer/edit_event.html', context)
        
        data = {
            'new_name': new_name,
            'organizer': organizer,
            'start_date': start_date_str,
            'end_date': end_date_str,
            'location': location,
            'teams': teams
        }

        
        
        api_url = f"{base_url}UpdateEvent?id={event_id}"

        headers = {
            'Authorization': f'Bearer {token}',
        }

        response = requests.put(api_url, json=data, headers=headers)
        print('response',response)
        if response.status_code == 200:
            return redirect(events, type)
        else:
            response_data = response.json()
            error = response_data.get('response')
            print(error)
            # return render(request, 'organizer/edit_event.html', context)
            

    return render(request, 'organizer/edit_event.html', context)

def View_event(request,type,id):
    # event_id = request.query_params.get('id')
    event_id=id
    token=get_token_from_session(request)
    email = get_email_from_session(request)

    if not token:
        return redirect('login')

    api_url = f"{base_url}ParticularEvent?id={event_id}"
    get_logged_user_url = f"{base_url}GetUser?email={email}"

    headers = {
        'Authorization': f'Bearer {token}',
    }
    response = requests.get(api_url, headers=headers)
    log_user_response = requests.get(get_logged_user_url, headers=headers)
    # print('response',response)
    response_data = response.json()
    print(response_data, 'hiii')

    log_user_avatar = ""
    log_user_first = ""
    log_user_last = ""
    log_user_role = ""


    if log_user_response.status_code == 200:
            log_user_response_data = log_user_response.json()
            log_user_avatar = log_user_response_data['response']['avatar']
            log_user_first = log_user_response_data['response']['firstname']
            log_user_last = log_user_response_data['response']['lastname']
            log_user_role = log_user_response_data['response']['role']


    if response.status_code == 200:
         # Format date and time
        response_data['response']['start_date'] = format_date(response_data['response']['start_date'])
        response_data['response']['end_date'] = format_date(response_data['response']['end_date'])
        response_data['response']['num_teams'] = len(response_data['response']['teams'])
        # print(len(response_data['response']['teams']))
        # response_data['response']['teams']=len(response_data['response']['teams'])
        context = {
            'type': type,
            'data': response_data['response'],
            'log_user_avatar': log_user_avatar,
            'log_user_first': log_user_first,
            'log_user_last': log_user_last,
            'log_user_role': log_user_role,
        }
        return render(request, 'organizer/view_event.html', context=context)
    

def Delete_event(request,type,id):
    api_url = f"{base_url}DeleteEvent?id={id}"

    # Include the authentication token in the headers if needed
    headers = {
        'Authorization': f'Bearer {get_token_from_session(request)}',
    }

    response = requests.delete(api_url, headers=headers)

    if response.status_code == 200:
        return redirect('events', type=type)
    else:
        return render(request, 'organizer/events.html', context={'type': type})
    


