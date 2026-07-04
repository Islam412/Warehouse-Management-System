"""
تصحيح مشكلة Django مع Python 3.14
يصلح 'super' object has no attribute 'dicts'
"""

import sys
import django.template.context

if sys.version_info >= (3, 14):
    print("✅ Applying Django-Python 3.14 compatibility patch...")
    
    # حفظ المرجع للدالة الأصلية
    original_context = django.template.context.Context
    
    # إنشاء دالة جديدة للنسخ
    def new_copy(self):
        """نسخة معدلة تتجنب مشكلة super()"""
        # إنشاء كائن جديد
        new = django.template.context.Context()
        # نسخ البيانات يدوياً
        new.dicts = [d.copy() for d in self.dicts]
        # نسخ الخصائص الأخرى
        if hasattr(self, 'current_app'):
            new.current_app = self.current_app
        if hasattr(self, 'use_l10n'):
            new.use_l10n = self.use_l10n
        if hasattr(self, 'use_tz'):
            new.use_tz = self.use_tz
        if hasattr(self, 'autoescape'):
            new.autoescape = self.autoescape
        return new
    
    # تطبيق التصحيح
    django.template.context.Context.__copy__ = new_copy
    print("✅ Patch applied successfully!")
else:
    print("ℹ️ No patch needed")
