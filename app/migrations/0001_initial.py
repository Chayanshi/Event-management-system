# Generated by Django 4.2.7 on 2023-11-02 06:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User_model',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('email', models.EmailField(max_length=256, unique=True)),
                ('firstname', models.CharField(blank=True, max_length=255, null=True)),
                ('lastname', models.CharField(blank=True, max_length=255, null=True)),
                ('password', models.CharField(max_length=255)),
                ('phone', models.IntegerField()),
                ('role', models.CharField(choices=[('Organizer', 'organizer'), ('Coach', 'Coach'), ('Player', 'player'), ('Fans', 'fans'), ('Volunteer', 'volunteer'), ('Referee', 'referee')], max_length=30)),
                ('is_active', models.BooleanField(default=True)),
                ('is_superuser', models.BooleanField(default=False)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_block', models.BooleanField(default=False)),
                ('otp', models.IntegerField(blank=True, null=True)),
                ('otp_created_at', models.DateTimeField(blank=True, null=True)),
                ('otp_verified', models.BooleanField(default=False)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Event_Model',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('start_date', models.DateTimeField()),
                ('end_date', models.DateTimeField()),
                ('location', models.CharField(max_length=100)),
                ('organizer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events_org', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Team_Model',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('team_name', models.CharField(max_length=256, unique=True)),
                ('coach', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='teams_coach', to=settings.AUTH_USER_MODEL)),
                ('player', models.ManyToManyField(related_name='teams_player', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Match_Model',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField()),
                ('result', models.CharField(blank=True, max_length=100, null=True)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='match_event', to='app.event_model')),
                ('refree', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='match_refree', to=settings.AUTH_USER_MODEL)),
                ('team1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='match_team1', to='app.team_model')),
                ('team2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='match_team2', to='app.team_model')),
            ],
        ),
        migrations.AddField(
            model_name='event_model',
            name='teams',
            field=models.ManyToManyField(related_name='events_team', to='app.team_model'),
        ),
        migrations.AddField(
            model_name='event_model',
            name='volunteer',
            field=models.ManyToManyField(related_name='events_vol', to=settings.AUTH_USER_MODEL),
        ),
    ]
