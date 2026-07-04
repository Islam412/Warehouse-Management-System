from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import DashboardWidget

@admin.register(DashboardWidget)
class DashboardWidgetAdmin(admin.ModelAdmin):
    list_display = ['title', 'widget_type_display', 'user', 'order', 'is_active']
    list_filter = ['widget_type', 'is_active']
    search_fields = ['title', 'user__username']
    list_editable = ['order', 'is_active']
    ordering = ['order']
    
    def widget_type_display(self, obj):
        return obj.get_widget_type_display()
    widget_type_display.short_description = _('النوع')