"""
WSGI config for core project.
"""

import os
import sys

# ✅ تطبيق التصحيح
try:
    import patch_django  # noqa
except ImportError:
    pass

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
