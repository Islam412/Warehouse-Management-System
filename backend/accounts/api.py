from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListAPIView ,CreateAPIView, UpdateAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken , OutstandingToken , BlacklistedToken
from rest_framework_simplejwt.exceptions import TokenError


from userauths.serializers import UserSerializer , ProfileSerializer , LoginSerializer
from .models import User , Profile 


class UserRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]