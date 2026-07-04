from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Company, Branch, StoreSettings, SocialLink, PaymentMethod, ShippingMethod
from .serializers import (
    CompanySerializer, CompanyUpdateSerializer,
    BranchSerializer, BranchCreateSerializer,
    StoreSettingsSerializer,
    SocialLinkSerializer,
    PaymentMethodSerializer,
    ShippingMethodSerializer
)


# ============================================
# Company ViewSet
# ============================================

class CompanyViewSet(viewsets.ViewSet):
    """ViewSet لإدارة بيانات الشركة"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """جلب بيانات الشركة"""
        company = Company.get_company()
        serializer = CompanySerializer(company)
        return Response(serializer.data)
    
    def update(self, request):
        """تحديث بيانات الشركة بالكامل"""
        company = Company.get_company()
        serializer = CompanyUpdateSerializer(company, data=request.data)
        
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request):
        """تحديث جزئي لبيانات الشركة"""
        company = Company.get_company()
        serializer = CompanyUpdateSerializer(company, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def upload_logo(self, request):
        """رفع شعار الشركة"""
        company = Company.get_company()
        
        if 'logo' not in request.FILES:
            return Response(
                {"error": "Please provide a logo file"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        company.logo = request.FILES['logo']
        company.updated_by = request.user
        company.save()
        
        return Response({
            'message': 'Logo uploaded successfully',
            'logo_url': company.logo.url if company.logo else None
        })
    
    @action(detail=False, methods=['post'])
    def upload_cover(self, request):
        """رفع صورة الغلاف"""
        company = Company.get_company()
        
        if 'cover' not in request.FILES:
            return Response(
                {"error": "Please provide a cover image"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        company.cover_image = request.FILES['cover']
        company.updated_by = request.user
        company.save()
        
        return Response({
            'message': 'Cover image uploaded successfully',
            'cover_url': company.cover_image.url if company.cover_image else None
        })


# ============================================
# Branch ViewSet
# ============================================

class BranchViewSet(viewsets.ModelViewSet):
    """ViewSet لإدارة الفروع"""
    queryset = Branch.objects.all().select_related('company', 'manager')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BranchCreateSerializer
        return BranchSerializer
    
    def get_queryset(self):
        company = Company.get_company()
        return super().get_queryset().filter(company=company)
    
    def create(self, request, *args, **kwargs):
        """إنشاء فرع جديد مع إرجاع البيانات الكاملة"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # حفظ الفرع
        branch = serializer.save()
        
        # إرجاع البيانات باستخدام BranchSerializer لعرض الكود
        output_serializer = BranchSerializer(branch)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """تفعيل/إلغاء تفعيل الفرع"""
        branch = self.get_object()
        branch.is_active = not branch.is_active
        branch.save()
        return Response({
            'message': f'Branch {branch.name} is now {"active" if branch.is_active else "inactive"}',
            'is_active': branch.is_active
        })
    
    @action(detail=True, methods=['post'])
    def set_main(self, request, pk=None):
        """تعيين الفرع كفرع رئيسي"""
        branch = self.get_object()
        company = branch.company
        
        # إلغاء الرئيسي عن جميع الفروع
        company.branches.update(is_main=False)
        
        # تعيين هذا الفرع كرئيسي
        branch.is_main = True
        branch.save()
        
        return Response({
            'message': f'{branch.name} is now the main branch'
        })


# ============================================
# Settings ViewSet
# ============================================

class SettingsViewSet(viewsets.ViewSet):
    """ViewSet لإعدادات النظام"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """جلب الإعدادات"""
        settings = StoreSettings.get_settings()
        serializer = StoreSettingsSerializer(settings)
        return Response(serializer.data)
    
    def update(self, request):
        """تحديث الإعدادات"""
        settings = StoreSettings.get_settings()
        serializer = StoreSettingsSerializer(settings, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def reset_defaults(self, request):
        """إعادة الإعدادات للوضع الافتراضي"""
        settings = StoreSettings.get_settings()
        
        # حذف الإعدادات الحالية
        settings.delete()
        
        # إنشاء إعدادات جديدة
        new_settings = StoreSettings.get_settings()
        new_settings.updated_by = request.user
        new_settings.save()
        
        serializer = StoreSettingsSerializer(new_settings)
        return Response(serializer.data)


# ============================================
# SocialLink ViewSet
# ============================================

class SocialLinkViewSet(viewsets.ModelViewSet):
    """ViewSet لروابط التواصل الاجتماعي"""
    queryset = SocialLink.objects.all()
    serializer_class = SocialLinkSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        company = Company.get_company()
        return super().get_queryset().filter(company=company)


# ============================================
# PaymentMethod ViewSet
# ============================================

class PaymentMethodViewSet(viewsets.ModelViewSet):
    """ViewSet لطرق الدفع"""
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        company = Company.get_company()
        return super().get_queryset().filter(company=company)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """تعيين طريقة الدفع كافتراضية"""
        method = self.get_object()
        
        # إلغاء الافتراضي عن الكل
        PaymentMethod.objects.filter(company=method.company).update(is_default=False)
        
        # تعيين هذه الطريقة كافتراضية
        method.is_default = True
        method.save()
        
        return Response({'message': f'{method.name} is now the default payment method'})


# ============================================
# ShippingMethod ViewSet
# ============================================

class ShippingMethodViewSet(viewsets.ModelViewSet):
    """ViewSet لطرق الشحن"""
    queryset = ShippingMethod.objects.all()
    serializer_class = ShippingMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        company = Company.get_company()
        return super().get_queryset().filter(company=company)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """تعيين طريقة الشحن كافتراضية"""
        method = self.get_object()
        
        # إلغاء الافتراضي عن الكل
        ShippingMethod.objects.filter(company=method.company).update(is_default=False)
        
        # تعيين هذه الطريقة كافتراضية
        method.is_default = True
        method.save()
        
        return Response({'message': f'{method.name} is now the default shipping method'})