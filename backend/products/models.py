from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _

import uuid

class Category(models.Model):
    """فئة المنتج"""
    name = models.CharField(max_length=100, unique=True, verbose_name="الاسم")
    name_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="الاسم بالعربية")
    description = models.TextField(blank=True, null=True, verbose_name="الوصف")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, 
                               related_name='children', verbose_name="الفئة الرئيسية")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = "فئة"
        verbose_name_plural = "الفئات"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Brand(models.Model):
    """العلامة التجارية"""
    name = models.CharField(max_length=100, unique=True, verbose_name="الاسم")
    name_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="الاسم بالعربية")
    logo = models.ImageField(upload_to='brands/', blank=True, null=True, verbose_name="الشعار")
    description = models.TextField(blank=True, null=True, verbose_name="الوصف")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'brands'
        verbose_name = "علامة تجارية"
        verbose_name_plural = "العلامات التجارية"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Unit(models.Model):
    """وحدة القياس"""
    name = models.CharField(max_length=50, unique=True, verbose_name="الاسم")
    name_ar = models.CharField(max_length=50, blank=True, null=True, verbose_name="الاسم بالعربية")
    symbol = models.CharField(max_length=10, blank=True, null=True, verbose_name="الرمز")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    
    class Meta:
        db_table = 'units'
        verbose_name = "وحدة"
        verbose_name_plural = "الوحدات"
        ordering = ['name']
    
    def __str__(self):
        return self.name

