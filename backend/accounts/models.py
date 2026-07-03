from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save  # create profile before creat user
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from django.contrib.auth import get_user_model

import uuid

from utils.generate_code import generate_code

class User(AbstractUser):
    first_name = models.CharField(_('Frist Name'),max_length=255, null=True, blank=True)
    last_name = models.CharField(_('Last Name'),max_length=255, null=True, blank=True)
    username = models.CharField(_('Username'),max_length=255, unique=True, null=True, blank=True)
    email = models.EmailField(_('Email'),unique=True)

    # Change defult django in adminbanal
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return str(self.username)
    

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    cover_images = models.ImageField(_('Cover Image'), upload_to='Images_Profile', null=True, blank=True, default='user.png')
    address = models.TextField(_('Address'), max_length=300 , null=True, blank=True)
    phone = models.CharField(_('Phone'), max_length=30, null=True, blank=True)
    code = models.CharField(max_length=10, default=generate_code)
    verified = models.BooleanField(_('Verified'), default=False)

    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}" if self.user.first_name and self.user.last_name else self.user.username

    @property
    def email(self):
        return self.user.email

    @property
    def username(self):
        return self.user.username
    

@receiver(post_save, sender=User)
# create user profile automatic
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile ,sender=User)
post_save.connect(save_user_profile ,sender=User)