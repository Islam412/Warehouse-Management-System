"""
Django project initialization
"""

# تطبيق تصحيح التوافق مع Python 3.14
try:
    import patch_django  # noqa
except ImportError:
    pass
