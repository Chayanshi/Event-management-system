from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register([User_model,Event_Model,Team_Model,Match_Model])