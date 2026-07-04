from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import ReportLog

@admin.register(ReportLog)
class ReportLogAdmin(admin.ModelAdmin):
    """إدارة سجل التقارير"""
    list_display = ['title', 'report_type_display', 'format_display', 'created_by', 'created_at']
    list_filter = ['report_type', 'format', 'created_at']
    search_fields = ['title', 'created_by__username']
    readonly_fields = ['id', 'created_at', 'created_by']
    ordering = ['-created_at']
    
    fieldsets = (
        (_('معلومات التقرير'), {
            'fields': ('id', 'title', 'report_type', 'format')
        }),
        (_('تفاصيل التقرير'), {
            'fields': ('filters', 'file_path')
        }),
        (_('معلومات النظام'), {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def report_type_display(self, obj):
        """عرض نوع التقرير بشكل منسق"""
        colors = {
            'sales': '#28a745',
            'purchases': '#17a2b8',
            'inventory': '#ffc107',
            'customers': '#6f42c1',
            'suppliers': '#fd7e14',
            'finance': '#20c997',
            'profit_loss': '#dc3545',
        }
        color = colors.get(obj.report_type, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_report_type_display()
        )
    report_type_display.short_description = _('نوع التقرير')
    
    def format_display(self, obj):
        """عرض الصيغة بشكل منسق"""
        colors = {
            'json': '#17a2b8',
            'pdf': '#dc3545',
            'excel': '#28a745',
            'csv': '#ffc107',
        }
        color = colors.get(obj.format, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold; text-transform: uppercase;">{}</span>',
            color, obj.format
        )
    format_display.short_description = _('الصيغة')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')
    
    actions = ['delete_reports']
    
    def delete_reports(self, request, queryset):
        """حذف التقارير المحددة"""
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'تم حذف {count} تقرير(تقارير) بنجاح.')
    delete_reports.short_description = _('حذف التقارير المحددة')
