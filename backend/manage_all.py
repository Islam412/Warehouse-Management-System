#!/usr/bin/env python
"""
أداة إدارة شاملة للمشروع
تم التطوير بواسطة: مهندس / إسلام حمدى
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

# إعداد مسار المشروع
BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

def run_command(cmd, cwd=None):
    """تشغيل أمر وعرض الناتج"""
    print(f"\n📌 تشغيل: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd or BASE_DIR, capture_output=False)
    return result.returncode == 0

def setup_database():
    """تهيئة قاعدة البيانات من الصفر"""
    print("\n" + "="*70)
    print("  🗄️  تهيئة قاعدة البيانات")
    print("="*70)
    
    # 1. إنشاء الترحيلات
    run_command("python manage.py makemigrations")
    
    # 2. تنفيذ الترحيلات
    run_command("python manage.py migrate")
    
    # 3. إضافة البيانات
    run_command("python manage.py seed_full_database")
    
    print("\n✅ تم تهيئة قاعدة البيانات بنجاح!")

def create_superuser():
    """إنشاء مستخدم مشرف"""
    print("\n" + "="*70)
    print("  👤 إنشاء مستخدم مشرف")
    print("="*70)
    run_command("python manage.py createsuperuser")

def run_server():
    """تشغيل السيرفر"""
    print("\n" + "="*70)
    print("  🚀 تشغيل السيرفر")
    print("="*70)
    run_command("python manage.py runserver")

def run_celery_worker():
    """تشغيل Celery Worker"""
    print("\n" + "="*70)
    print("  ⚙️  تشغيل Celery Worker")
    print("="*70)
    run_command("celery -A core worker --loglevel=info")

def run_celery_beat():
    """تشغيل Celery Beat"""
    print("\n" + "="*70)
    print("  ⏰ تشغيل Celery Beat")
    print("="*70)
    run_command("celery -A core beat --loglevel=info")

def run_all():
    """تشغيل كل شيء"""
    print("\n" + "="*70)
    print("  🚀 تشغيل كل الخدمات")
    print("="*70)
    
    # تشغيل السيرفر في الخلفية
    run_command("python manage.py runserver &")
    
    # تشغيل Celery Worker في الخلفية
    run_command("celery -A core worker --loglevel=info &")
    
    # تشغيل Celery Beat في الخلفية
    run_command("celery -A core beat --loglevel=info &")
    
    print("\n✅ جميع الخدمات تعمل في الخلفية!")

def test_apis():
    """اختبار الـ APIs"""
    print("\n" + "="*70)
    print("  🧪 اختبار الـ APIs")
    print("="*70)
    run_command("./test_apis.sh")

def show_help():
    """عرض المساعدة"""
    print("""
╔══════════════════════════════════════════════════════════════╗
║  📋 أوامر إدارة المشروع                                    ║
║  تم التطوير بواسطة: مهندس / إسلام حمدى                    ║
╚══════════════════════════════════════════════════════════════╝

  🗄️  python manage_all.py setup      - تهيئة قاعدة البيانات
  👤  python manage_all.py superuser  - إنشاء مستخدم مشرف
  🚀  python manage_all.py server     - تشغيل السيرفر فقط
  ⚙️  python manage_all.py worker     - تشغيل Celery Worker
  ⏰  python manage_all.py beat       - تشغيل Celery Beat
  🚀  python manage_all.py all        - تشغيل كل الخدمات
  🧪  python manage_all.py test       - اختبار الـ APIs
  ℹ️  python manage_all.py help       - عرض هذه المساعدة

  📝 مثال:
    python manage_all.py setup
    python manage_all.py superuser
    python manage_all.py all
""")

def main():
    parser = argparse.ArgumentParser(
        description='أداة إدارة شاملة لمشروع DUKA',
        add_help=False
    )
    parser.add_argument('command', nargs='?', default='help',
                       help='الأمر المطلوب تنفيذه')
    
    args = parser.parse_args()
    
    commands = {
        'setup': setup_database,
        'superuser': create_superuser,
        'server': run_server,
        'worker': run_celery_worker,
        'beat': run_celery_beat,
        'all': run_all,
        'test': test_apis,
        'help': show_help,
    }
    
    if args.command in commands:
        commands[args.command]()
    else:
        print(f"❌ أمر غير معروف: {args.command}")
        show_help()

if __name__ == "__main__":
    main()