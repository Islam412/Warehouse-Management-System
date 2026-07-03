from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListAPIView ,CreateAPIView, UpdateAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken , OutstandingToken , BlacklistedToken
from rest_framework_simplejwt.exceptions import TokenError


from accounts.serializers import UserSerializer , ProfileSerializer , LoginSerializer
from .models import User , Profile 


class UserRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class UserListAPIView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class UserCreateAPIView(CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save(is_active=True)


class ProfileListAPIView(ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

class ProfileCreateAPIView(CreateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

class UpdateMyProfileAPIView(UpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)
    
class MyAccountAPIView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class MyProfileAPIView(RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)
    


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {"error": "Please provide both email and password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(password):
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.is_active:
            return Response(
                {"error": "User account is disabled"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        user_serializer = UserSerializer(user)
        
        return Response({
            'user': user_serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    

class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")

            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)

            # Blacklist the refresh token
            token.blacklist()

            return Response(
                {"message": "Logout successful"},
                status=status.HTTP_200_OK
            )

        except TokenError:
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )
        

class DeleteMyAccountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user

        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {"error": "Invalid refresh token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.delete()

        return Response(
            {"message": "Account deleted successfully"},
            status=status.HTTP_200_OK
        )