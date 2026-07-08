"""
إضافة بيانات كاملة وشاملة لجميع جداول قاعدة البيانات
تم التطوير بواسطة: مهندس / إسلام حمدى
"""

import os
import django
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
import random

# إعداد Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from products.models import Category, Brand, Unit, Product, ProductImage
from customers.models import Customer
from suppliers.models import Supplier
from inventory.models import Warehouse, Stock, StockMovement
from sales.models import Invoice, InvoiceItem, Payment, Return
from purchases.models import PurchaseOrder, PurchaseItem
from finance.models import Account, JournalEntry, JournalLine, Expense, Income, DailyClosing
from notifications.models import Notification

User = get_user_model()

# ============================================
# 1. إنشاء المستخدمين
# ============================================

def create_users():
    """إنشاء مستخدمين كاملين"""
    print("👤 Creating users...")
    
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@duka.com',
            'password': 'admin123456',
            'first_name': 'مدير',
            'last_name': 'النظام',
            'is_staff': True,
            'is_superuser': True,
        },
        {
            'username': 'islam_hamdy',
            'email': 'islam@duka.com',
            'password': 'Islam@2026',
            'first_name': 'إسلام',
            'last_name': 'حمدى',
            'is_staff': True,
            'is_superuser': True,
        },
        {
            'username': 'manager',
            'email': 'manager@duka.com',
            'password': 'manager123',
            'first_name': 'مدير',
            'last_name': 'المبيعات',
            'is_staff': True,
            'is_superuser': False,
        },
        {
            'username': 'cashier',
            'email': 'cashier@duka.com',
            'password': 'cashier123',
            'first_name': 'محاسب',
            'last_name': 'الصندوق',
            'is_staff': False,
            'is_superuser': False,
        },
        {
            'username': 'store_keeper',
            'email': 'store@duka.com',
            'password': 'store123',
            'first_name': 'أمين',
            'last_name': 'المخزن',
            'is_staff': False,
            'is_superuser': False,
        },
    ]
    
    users = []
    for data in users_data:
        user, created = User.objects.update_or_create(
            username=data['username'],
            defaults={
                'email': data['email'],
                'password': make_password(data['password']),
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'is_staff': data['is_staff'],
                'is_superuser': data['is_superuser'],
                'is_active': True,
            }
        )
        users.append(user)
        if created:
            print(f"  ✅ {data['username']} created")
        else:
            print(f"  ℹ️ {data['username']} already exists")
    
    return users

# ============================================
# 2. إنشاء الفئات
# ============================================

def create_categories():
    """إنشاء فئات المنتجات"""
    print("📁 Creating categories...")
    
    categories_data = [
        # فئات رئيسية
        {'name': 'صنابير', 'name_ar': 'صنابير', 'description': 'جميع أنواع الصنابير والمحابس'},
        {'name': 'خلاطات', 'name_ar': 'خلاطات', 'description': 'خلاطات المطبخ والحمام'},
        {'name': 'مواسير', 'name_ar': 'مواسير', 'description': 'مواسير المياه والصرف'},
        {'name': 'محابس', 'name_ar': 'محابس', 'description': 'محابس التحكم في المياه'},
        {'name': 'أدوات صحية', 'name_ar': 'أدوات صحية', 'description': 'أدوات صحية للحمامات والمطابخ'},
        {'name': 'مضخات', 'name_ar': 'مضخات', 'description': 'مضخات المياه'},
        {'name': 'خزانات', 'name_ar': 'خزانات', 'description': 'خزانات المياه'},
        {'name': 'أنظمة ري', 'name_ar': 'أنظمة ري', 'description': 'أنظمة الري الزراعي'},
        {'name': 'أدوات كهربائية', 'name_ar': 'أدوات كهربائية', 'description': 'أدوات ومعدات كهربائية'},
        {'name': 'مواد بناء', 'name_ar': 'مواد بناء', 'description': 'مواد البناء والتشييد'},
        # فئات إضافية
        {'name': 'أدوات سباكة', 'name_ar': 'أدوات سباكة', 'description': 'أدوات السباكة والتركيبات'},
        {'name': 'مستلزمات منزلية', 'name_ar': 'مستلزمات منزلية', 'description': 'مستلزمات المنزل والمطبخ'},
    ]
    
    categories = []
    for data in categories_data:
        cat, created = Category.objects.get_or_create(
            name=data['name'],
            defaults={
                'name_ar': data['name_ar'],
                'description': data['description'],
                'is_active': True,
            }
        )
        categories.append(cat)
        if created:
            print(f"  ✅ {data['name']} created")
    
    return categories

# ============================================
# 3. إنشاء العلامات التجارية
# ============================================

def create_brands():
    """إنشاء علامات تجارية"""
    print("🏷️ Creating brands...")
    
    brands_data = [
        {'name': 'Ideal', 'name_ar': 'ايديال', 'description': 'شركة ايديال للصنابير - مصر'},
        {'name': 'Grohe', 'name_ar': 'جروهي', 'description': 'شركة جروهي الألمانية'},
        {'name': 'Hansgrohe', 'name_ar': 'هانزجروهي', 'description': 'شركة هانزجروهي الألمانية'},
        {'name': 'Villeroy & Boch', 'name_ar': 'فيلروي وبوش', 'description': 'شركة فيلروي وبوش الألمانية'},
        {'name': 'Duravit', 'name_ar': 'دورافيت', 'description': 'شركة دورافيت الألمانية'},
        {'name': 'Toto', 'name_ar': 'توتو', 'description': 'شركة توتو اليابانية'},
        {'name': 'Kohler', 'name_ar': 'كولر', 'description': 'شركة كولر الأمريكية'},
        {'name': 'Moen', 'name_ar': 'موين', 'description': 'شركة موين الأمريكية'},
        {'name': 'Delta', 'name_ar': 'دلتا', 'description': 'شركة دلتا الأمريكية'},
        {'name': 'American Standard', 'name_ar': 'أمريكان ستاندرد', 'description': 'شركة أمريكان ستاندرد'},
        {'name': 'Saudi Ceramics', 'name_ar': 'السعودية للسيراميك', 'description': 'شركة السعودية للسيراميك'},
        {'name': 'Al Rajhi', 'name_ar': 'الراجحي', 'description': 'مصنع الراجحي للصنابير'},
        {'name': 'IslamHamdy', 'name_ar': 'إسلام حمدى', 'description': 'ماركة إسلام حمدى للصنابير الفاخرة'},
        {'name': 'HamdyTech', 'name_ar': 'حمدى تك', 'description': 'منتجات تقنية من إسلام حمدى'},
    ]
    
    brands = []
    for data in brands_data:
        brand, created = Brand.objects.get_or_create(
            name=data['name'],
            defaults={
                'name_ar': data['name_ar'],
                'description': data['description'],
                'is_active': True,
            }
        )
        brands.append(brand)
        if created:
            print(f"  ✅ {data['name']} created")
    
    return brands

# ============================================
# 4. إنشاء وحدات القياس
# ============================================

def create_units():
    """إنشاء وحدات القياس"""
    print("📏 Creating units...")
    
    units_data = [
        {'name': 'قطعة', 'name_ar': 'قطعة', 'symbol': 'قطعة'},
        {'name': 'كيلو جرام', 'name_ar': 'كيلو جرام', 'symbol': 'كجم'},
        {'name': 'متر', 'name_ar': 'متر', 'symbol': 'م'},
        {'name': 'علبة', 'name_ar': 'علبة', 'symbol': 'علبة'},
        {'name': 'طقم', 'name_ar': 'طقم', 'symbol': 'طقم'},
        {'name': 'لتر', 'name_ar': 'لتر', 'symbol': 'لتر'},
        {'name': 'قدم', 'name_ar': 'قدم', 'symbol': 'قدم'},
        {'name': 'كرتونة', 'name_ar': 'كرتونة', 'symbol': 'كرتونة'},
        {'name': 'باكيت', 'name_ar': 'باكيت', 'symbol': 'باكيت'},
        {'name': 'رول', 'name_ar': 'رول', 'symbol': 'رول'},
        {'name': 'وحدة إسلام', 'name_ar': 'وحدة إسلام', 'symbol': 'إس'},
        {'name': 'قطعة حمدى', 'name_ar': 'قطعة حمدى', 'symbol': 'ح'},
    ]
    
    units = []
    for data in units_data:
        unit, created = Unit.objects.get_or_create(
            name=data['name'],
            defaults={
                'name_ar': data['name_ar'],
                'symbol': data['symbol'],
                'is_active': True,
            }
        )
        units.append(unit)
        if created:
            print(f"  ✅ {data['name']} created")
    
    return units

# ============================================
# 5. إنشاء المنتجات
# ============================================

def create_products(categories, brands, units, user):
    """إنشاء منتجات كاملة"""
    print("📦 Creating products...")
    
    products_data = [
        # منتجات إسلام حمدى (الفاخرة)
        {
            'name': 'قلب حنفية إسلام',
            'name_ar': 'قلب حنفية إسلام',
            'description': 'قلب حنفية فاخر من تصميم إسلام حمدى - استانلس ستيل',
            'category': categories[0],
            'brand': brands[12],
            'unit': units[0],
            'sku': 'ISLAM-001',
            'barcode': 'ISLAM2024001',
            'purchase_price': 100.00,
            'selling_price': 200.00,
            'wholesale_price': 150.00,
            'size': '1/2',
            'color': 'Gold Premium',
            'weight': 0.75,
            'is_active': True,
            'is_featured': True,
            'has_stock': True,
        },
        {
            'name': 'خلاط مطبخ حمدى',
            'name_ar': 'خلاط مطبخ حمدى',
            'description': 'خلاط مطبخ راقي من إنتاج إسلام حمدى - استانلس ستيل',
            'category': categories[1],
            'brand': brands[13],
            'unit': units[0],
            'sku': 'HAMDY-001',
            'barcode': 'HAMDY2024001',
            'purchase_price': 250.00,
            'selling_price': 450.00,
            'wholesale_price': 350.00,
            'size': 'Standard',
            'color': 'Chrome Premium',
            'weight': 2.5,
            'is_active': True,
            'is_featured': True,
            'has_stock': True,
        },
        {
            'name': 'طقم حمام إسلام',
            'name_ar': 'طقم حمام إسلام',
            'description': 'طقم حمام كامل فاخر من تصميم إسلام حمدى',
            'category': categories[4],
            'brand': brands[12],
            'unit': units[4],
            'sku': 'ISLAM-002',
            'barcode': 'ISLAM2024002',
            'purchase_price': 1000.00,
            'selling_price': 2000.00,
            'wholesale_price': 1500.00,
            'size': 'Deluxe',
            'color': 'Premium Gold',
            'weight': 18.0,
            'is_active': True,
            'is_featured': True,
            'has_stock': True,
        },
        # منتجات عادية
        {
            'name': 'قلب حنفية استانلس',
            'name_ar': 'قلب حنفية استانلس',
            'description': 'قلب حنفية استانلس ستيل مقاس 1/2 بوصة',
            'category': categories[0],
            'brand': brands[0],
            'unit': units[0],
            'sku': 'SKU-001',
            'barcode': '1234567890',
            'purchase_price': 45.00,
            'selling_price': 75.00,
            'wholesale_price': 60.00,
            'size': '1/2',
            'color': 'Silver',
            'weight': 0.5,
            'is_active': True,
            'is_featured': True,
            'has_stock': True,
        },
        {
            'name': 'خلاط مطبخ ستانلس',
            'name_ar': 'خلاط مطبخ ستانلس',
            'description': 'خلاط مطبخ ستانلس ستيل مع خرطوم مرن',
            'category': categories[1],
            'brand': brands[1],
            'unit': units[0],
            'sku': 'SKU-002',
            'barcode': '1234567891',
            'purchase_price': 180.00,
            'selling_price': 320.00,
            'wholesale_price': 250.00,
            'size': 'Standard',
            'color': 'Chrome',
            'weight': 2.0,
            'is_active': True,
            'is_featured': True,
            'has_stock': True,
        },
        {
            'name': 'مواسير PVC 1 بوصة',
            'name_ar': 'مواسير PVC 1 بوصة',
            'description': 'مواسير PVC مقاس 1 بوصة - طول 3 متر',
            'category': categories[2],
            'brand': brands[4],
            'unit': units[2],
            'sku': 'SKU-003',
            'barcode': '1234567892',
            'purchase_price': 35.00,
            'selling_price': 55.00,
            'wholesale_price': 42.00,
            'size': '1 بوصة',
            'color': 'White',
            'weight': 1.0,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
        {
            'name': 'محبس زاوية نحاس',
            'name_ar': 'محبس زاوية نحاس',
            'description': 'محبس زاوية نحاسي مقاس 1/2 بوصة',
            'category': categories[3],
            'brand': brands[2],
            'unit': units[0],
            'sku': 'SKU-004',
            'barcode': '1234567893',
            'purchase_price': 30.00,
            'selling_price': 50.00,
            'wholesale_price': 38.00,
            'size': '1/2',
            'color': 'Gold',
            'weight': 0.3,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
        {
            'name': 'طقم حمام كامل فاخر',
            'name_ar': 'طقم حمام كامل فاخر',
            'description': 'طقم حمام كامل شامل حوض وخلاط وإكسسوارات',
            'category': categories[4],
            'brand': brands[3],
            'unit': units[4],
            'sku': 'SKU-005',
            'barcode': '1234567894',
            'purchase_price': 900.00,
            'selling_price': 1500.00,
            'wholesale_price': 1200.00,
            'size': 'Standard',
            'color': 'White',
            'weight': 15.0,
            'is_active': True,
            'is_featured': True,
            'has_stock': True,
        },
        {
            'name': 'مضخة مياه 1 حصان',
            'name_ar': 'مضخة مياه 1 حصان',
            'description': 'مضخة مياه بقدرة 1 حصان - 220 فولت',
            'category': categories[5],
            'brand': brands[6],
            'unit': units[0],
            'sku': 'SKU-006',
            'barcode': '1234567895',
            'purchase_price': 550.00,
            'selling_price': 850.00,
            'wholesale_price': 700.00,
            'size': '1 حصان',
            'color': 'Blue',
            'weight': 10.0,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
        {
            'name': 'خزان مياه 1000 لتر',
            'name_ar': 'خزان مياه 1000 لتر',
            'description': 'خزان مياه بلاستيكي سعة 1000 لتر',
            'category': categories[6],
            'brand': brands[5],
            'unit': units[5],
            'sku': 'SKU-007',
            'barcode': '1234567896',
            'purchase_price': 1300.00,
            'selling_price': 2000.00,
            'wholesale_price': 1600.00,
            'size': '1000 لتر',
            'color': 'Blue',
            'weight': 50.0,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
        {
            'name': 'خرطوم ري 50 متر',
            'name_ar': 'خرطوم ري 50 متر',
            'description': 'خرطوم ري بلاستيكي طول 50 متر',
            'category': categories[7],
            'brand': brands[7],
            'unit': units[2],
            'sku': 'SKU-008',
            'barcode': '1234567897',
            'purchase_price': 90.00,
            'selling_price': 140.00,
            'wholesale_price': 110.00,
            'size': '50 متر',
            'color': 'Green',
            'weight': 3.0,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
        {
            'name': 'سخان مياه كهربائي',
            'name_ar': 'سخان مياه كهربائي',
            'description': 'سخان مياه كهربائي سعة 50 لتر',
            'category': categories[8],
            'brand': brands[8],
            'unit': units[0],
            'sku': 'SKU-009',
            'barcode': '1234567898',
            'purchase_price': 800.00,
            'selling_price': 1200.00,
            'wholesale_price': 1000.00,
            'size': '50 لتر',
            'color': 'White',
            'weight': 20.0,
            'is_active': True,
            'is_featured': True,
            'has_stock': True,
        },
        {
            'name': 'أسمنت بورتلاند 50 كجم',
            'name_ar': 'أسمنت بورتلاند 50 كجم',
            'description': 'أسمنت بورتلاند عادي - 50 كجم',
            'category': categories[9],
            'brand': brands[10],
            'unit': units[1],
            'sku': 'SKU-010',
            'barcode': '1234567899',
            'purchase_price': 120.00,
            'selling_price': 180.00,
            'wholesale_price': 150.00,
            'size': '50 كجم',
            'color': 'Gray',
            'weight': 50.0,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
    ]
    
    products = []
    for data in products_data:
        if not data['category'] or not data['brand'] or not data['unit']:
            print(f"  ⚠️ Skipping {data['name']} - missing data")
            continue
            
        product, created = Product.objects.get_or_create(
            sku=data['sku'],
            defaults={
                'name': data['name'],
                'name_ar': data['name_ar'],
                'description': data['description'],
                'category': data['category'],
                'brand': data['brand'],
                'unit': data['unit'],
                'barcode': data['barcode'],
                'purchase_price': data['purchase_price'],
                'selling_price': data['selling_price'],
                'wholesale_price': data['wholesale_price'],
                'size': data['size'],
                'color': data['color'],
                'weight': data['weight'],
                'is_active': data['is_active'],
                'is_featured': data['is_featured'],
                'has_stock': data['has_stock'],
                'created_by': user,
            }
        )
        products.append(product)
        if created:
            print(f"  ✅ {data['name']} created")
        else:
            print(f"  ℹ️ {data['name']} already exists")
    
    return products

# ============================================
# 6. إنشاء العملاء
# ============================================

def create_customers(user):
    """إنشاء عملاء"""
    print("👤 Creating customers...")
    
    customers_data = [
        # عملاء إسلام حمدى (VIP)
        {
            'name': 'عميل إسلام الأول',
            'name_ar': 'عميل إسلام الأول',
            'phone': '01000000001',
            'email': 'client1@islam.com',
            'address': 'مدينة إسلام، مصر',
            'balance': 10000.00,
            'is_active': True,
            'is_vip': True,
        },
        {
            'name': 'عميلة إسلام الثانية',
            'name_ar': 'عميلة إسلام الثانية',
            'phone': '01000000002',
            'email': 'client2@islam.com',
            'address': 'قرية إسلام، مصر',
            'balance': 5000.00,
            'is_active': True,
            'is_vip': True,
        },
        # عملاء عاديين
        {
            'name': 'أحمد محمد السيد',
            'name_ar': 'أحمد محمد السيد',
            'phone': '01001234567',
            'email': 'ahmed@example.com',
            'address': 'شارع النيل، القاهرة',
            'balance': 0,
            'is_active': True,
            'is_vip': False,
        },
        {
            'name': 'سارة علي حسن',
            'name_ar': 'سارة علي حسن',
            'phone': '01007654321',
            'email': 'sara@example.com',
            'address': 'شارع الأهرام، الجيزة',
            'balance': 500.00,
            'is_active': True,
            'is_vip': False,
        },
        {
            'name': 'محمد حسن إبراهيم',
            'name_ar': 'محمد حسن إبراهيم',
            'phone': '01009876543',
            'email': 'mohamed@example.com',
            'address': 'مدينة نصر، القاهرة',
            'balance': -200.00,
            'is_active': True,
            'is_vip': False,
        },
        {
            'name': 'فاطمة إبراهيم محمود',
            'name_ar': 'فاطمة إبراهيم محمود',
            'phone': '01005432167',
            'email': 'fatma@example.com',
            'address': 'الإسكندرية',
            'balance': 1000.00,
            'is_active': True,
            'is_vip': True,
        },
        {
            'name': 'عبدالله سعيد أحمد',
            'name_ar': 'عبدالله سعيد أحمد',
            'phone': '01003216547',
            'email': 'abdullah@example.com',
            'address': 'مدينة 6 أكتوبر',
            'balance': 300.00,
            'is_active': True,
            'is_vip': False,
        },
        {
            'name': 'نورة عبدالرحمن',
            'name_ar': 'نورة عبدالرحمن',
            'phone': '01001122334',
            'email': 'nora@example.com',
            'address': 'الرياض، المملكة العربية السعودية',
            'balance': 2000.00,
            'is_active': True,
            'is_vip': True,
        },
        {
            'name': 'خالد سليمان',
            'name_ar': 'خالد سليمان',
            'phone': '01002233445',
            'email': 'khalid@example.com',
            'address': 'جدة، المملكة العربية السعودية',
            'balance': 750.00,
            'is_active': True,
            'is_vip': False,
        },
    ]
    
    customers = []
    for data in customers_data:
        customer, created = Customer.objects.get_or_create(
            phone=data['phone'],
            defaults={
                'name': data['name'],
                'name_ar': data['name_ar'],
                'email': data['email'],
                'address': data['address'],
                'balance': data['balance'],
                'is_active': data['is_active'],
                'is_vip': data['is_vip'],
                'created_by': user,
            }
        )
        customers.append(customer)
        if created:
            print(f"  ✅ {data['name']} created")
        else:
            print(f"  ℹ️ {data['name']} already exists")
    
    return customers

# ============================================
# 7. إنشاء الموردين
# ============================================

def create_suppliers(user):
    """إنشاء موردين"""
    print("🏭 Creating suppliers...")
    
    suppliers_data = [
        # موردين إسلام حمدى
        {
            'name': 'مورد إسلام الأول',
            'name_ar': 'مورد إسلام الأول',
            'phone': '01000000011',
            'email': 'supplier1@islam.com',
            'address': 'منطقة إسلام الصناعية',
            'balance': 20000.00,
            'is_active': True,
        },
        {
            'name': 'مورد إسلام الثاني',
            'name_ar': 'مورد إسلام الثاني',
            'phone': '01000000012',
            'email': 'supplier2@islam.com',
            'address': 'مدينة إسلام الصناعية',
            'balance': 15000.00,
            'is_active': True,
        },
        # موردين عاديين
        {
            'name': 'شركة النيل للتجارة',
            'name_ar': 'شركة النيل للتجارة',
            'phone': '01001112222',
            'email': 'nile@example.com',
            'address': 'القاهرة، مصر',
            'balance': 0,
            'is_active': True,
        },
        {
            'name': 'مؤسسة الإسكندرية للتوريدات',
            'name_ar': 'مؤسسة الإسكندرية للتوريدات',
            'phone': '01002223333',
            'email': 'alex@example.com',
            'address': 'الإسكندرية، مصر',
            'balance': -500.00,
            'is_active': True,
        },
        {
            'name': 'شركة الجيزة للمواسير',
            'name_ar': 'شركة الجيزة للمواسير',
            'phone': '01003334444',
            'email': 'giza@example.com',
            'address': 'الجيزة، مصر',
            'balance': 1000.00,
            'is_active': True,
        },
        {
            'name': 'مصنع الرياض للصنابير',
            'name_ar': 'مصنع الرياض للصنابير',
            'phone': '01004445555',
            'email': 'riyadh@example.com',
            'address': 'الرياض، المملكة العربية السعودية',
            'balance': 2500.00,
            'is_active': True,
        },
        {
            'name': 'شركة الخليج للمضخات',
            'name_ar': 'شركة الخليج للمضخات',
            'phone': '01005556666',
            'email': 'gulf@example.com',
            'address': 'الدمام، المملكة العربية السعودية',
            'balance': -300.00,
            'is_active': True,
        },
    ]
    
    suppliers = []
    for data in suppliers_data:
        supplier, created = Supplier.objects.get_or_create(
            phone=data['phone'],
            defaults={
                'name': data['name'],
                'name_ar': data['name_ar'],
                'email': data['email'],
                'address': data['address'],
                'balance': data['balance'],
                'is_active': data['is_active'],
                'created_by': user,
            }
        )
        suppliers.append(supplier)
        if created:
            print(f"  ✅ {data['name']} created")
        else:
            print(f"  ℹ️ {data['name']} already exists")
    
    return suppliers

# ============================================
# 8. إنشاء المخازن
# ============================================

def create_warehouses(user):
    """إنشاء مخازن"""
    print("🏠 Creating warehouses...")
    
    warehouses_data = [
        {
            'name': 'مخزن إسلام حمدى',
            'name_ar': 'مخزن إسلام حمدى',
            'location': 'مدينة إسلام، المنطقة الذهبية',
            'is_active': True,
        },
        {
            'name': 'المخزن الرئيسي',
            'name_ar': 'المخزن الرئيسي',
            'location': 'الطابق الأول، المبنى الرئيسي',
            'is_active': True,
        },
        {
            'name': 'مخزن المواد الخام',
            'name_ar': 'مخزن المواد الخام',
            'location': 'الطابق الأرضي، المبنى الخلفي',
            'is_active': True,
        },
        {
            'name': 'مخزن المنتجات النهائية',
            'name_ar': 'مخزن المنتجات النهائية',
            'location': 'الطابق الثاني، المبنى الرئيسي',
            'is_active': True,
        },
    ]
    
    warehouses = []
    for data in warehouses_data:
        warehouse, created = Warehouse.objects.get_or_create(
            name=data['name'],
            defaults={
                'name_ar': data['name_ar'],
                'location': data['location'],
                'manager': user,
                'is_active': data['is_active'],
            }
        )
        warehouses.append(warehouse)
        if created:
            print(f"  ✅ {data['name']} created")
        else:
            print(f"  ℹ️ {data['name']} already exists")
    
    return warehouses

# ============================================
# 9. إنشاء المخزون
# ============================================

def create_stock(products, warehouses):
    """إنشاء مخزون كامل"""
    print("📊 Creating stock...")
    
    stock_data = []
    
    # توزيع المنتجات على المخازن
    for i, product in enumerate(products):
        if not product:
            continue
            
        # المنتجات الفاخرة في مخزن إسلام
        if 'ISLAM' in product.sku or 'HAMDY' in product.sku:
            stock_data.append({
                'product': product,
                'warehouse': warehouses[0],
                'quantity': random.randint(50, 150),
                'min_quantity': random.randint(10, 30),
                'max_quantity': random.randint(150, 300),
            })
        else:
            # المنتجات العادية في المخازن الأخرى
            warehouse_idx = i % 3 + 1  # 1, 2, 3
            if warehouse_idx < len(warehouses):
                stock_data.append({
                    'product': product,
                    'warehouse': warehouses[warehouse_idx],
                    'quantity': random.randint(30, 200),
                    'min_quantity': random.randint(5, 20),
                    'max_quantity': random.randint(100, 400),
                })
    
    stocks = []
    for data in stock_data:
        if not data['product'] or not data['warehouse']:
            continue
            
        stock, created = Stock.objects.get_or_create(
            product=data['product'],
            warehouse=data['warehouse'],
            defaults={
                'quantity': data['quantity'],
                'min_quantity': data['min_quantity'],
                'max_quantity': data['max_quantity'],
                'reserved_quantity': 0,
                'updated_by': None,
            }
        )
        stocks.append(stock)
        if created:
            print(f"  ✅ Stock for {data['product'].name} in {data['warehouse'].name} created")
        else:
            print(f"  ℹ️ Stock for {data['product'].name} in {data['warehouse'].name} already exists")
    
    return stocks

# ============================================
# 10. إنشاء الحسابات المالية
# ============================================

def create_accounts():
    """إنشاء حسابات مالية"""
    print("💰 Creating accounts...")
    
    accounts_data = [
        # حسابات إسلام حمدى
        {'code': 'ISLAM-1000', 'name': 'حساب إسلام الرئيسي', 'name_ar': 'حساب إسلام الرئيسي', 'account_type': 'asset', 'balance': 50000.00},
        {'code': 'ISLAM-2000', 'name': 'حساب إسلام الجاري', 'name_ar': 'حساب إسلام الجاري', 'account_type': 'asset', 'balance': 25000.00},
        {'code': 'ISLAM-3000', 'name': 'حساب إسلام الاستثماري', 'name_ar': 'حساب إسلام الاستثماري', 'account_type': 'asset', 'balance': 100000.00},
        # حسابات عادية
        {'code': '1000', 'name': 'النقدية', 'name_ar': 'النقدية', 'account_type': 'asset', 'balance': 50000.00},
        {'code': '1010', 'name': 'الصندوق', 'name_ar': 'الصندوق', 'account_type': 'asset', 'balance': 15000.00},
        {'code': '1020', 'name': 'البنك', 'name_ar': 'البنك', 'account_type': 'asset', 'balance': 35000.00},
        {'code': '2000', 'name': 'الموردين', 'name_ar': 'الموردين', 'account_type': 'liability', 'balance': 20000.00},
        {'code': '2010', 'name': 'العملاء', 'name_ar': 'العملاء', 'account_type': 'asset', 'balance': 15000.00},
        {'code': '3000', 'name': 'رأس المال', 'name_ar': 'رأس المال', 'account_type': 'equity', 'balance': 100000.00},
        {'code': '4000', 'name': 'إيرادات المبيعات', 'name_ar': 'إيرادات المبيعات', 'account_type': 'revenue', 'balance': 0},
        {'code': '5000', 'name': 'مصروفات التشغيل', 'name_ar': 'مصروفات التشغيل', 'account_type': 'expense', 'balance': 0},
    ]
    
    accounts = []
    for data in accounts_data:
        account, created = Account.objects.get_or_create(
            code=data['code'],
            defaults={
                'name': data['name'],
                'name_ar': data['name_ar'],
                'account_type': data['account_type'],
                'balance': data['balance'],
                'is_active': True,
            }
        )
        accounts.append(account)
        if created:
            print(f"  ✅ {data['code']} - {data['name']} created")
        else:
            print(f"  ℹ️ {data['code']} - {data['name']} already exists")
    
    return accounts

# ============================================
# 11. إنشاء المصروفات
# ============================================

def create_expenses(user):
    """إنشاء مصروفات"""
    print("💸 Creating expenses...")
    
    expenses_data = [
        # مصروفات إسلام حمدى
        {
            'category': 'rent',
            'amount': 10000.00,
            'date': datetime.now().date() - timedelta(days=5),
            'description': 'إيجار مكتب إسلام حمدى',
            'payment_method': 'bank_transfer',
            'created_by': user,
        },
        {
            'category': 'salaries',
            'amount': 5000.00,
            'date': datetime.now().date() - timedelta(days=2),
            'description': 'رواتب فريق إسلام حمدى',
            'payment_method': 'bank_transfer',
            'created_by': user,
        },
        {
            'category': 'marketing',
            'amount': 3000.00,
            'date': datetime.now().date() - timedelta(days=3),
            'description': 'تسويق منتجات إسلام حمدى',
            'payment_method': 'cash',
            'created_by': user,
        },
        # مصروفات عادية
        {
            'category': 'rent',
            'amount': 5000.00,
            'date': datetime.now().date() - timedelta(days=5),
            'description': 'إيجار المكتب الشهري',
            'payment_method': 'cash',
            'created_by': user,
        },
        {
            'category': 'salaries',
            'amount': 15000.00,
            'date': datetime.now().date() - timedelta(days=2),
            'description': 'رواتب الموظفين',
            'payment_method': 'bank_transfer',
            'created_by': user,
        },
        {
            'category': 'utilities',
            'amount': 800.00,
            'date': datetime.now().date() - timedelta(days=3),
            'description': 'فواتير الكهرباء والمياه',
            'payment_method': 'cash',
            'created_by': user,
        },
        {
            'category': 'supplies',
            'amount': 1200.00,
            'date': datetime.now().date() - timedelta(days=7),
            'description': 'مستلزمات مكتبية',
            'payment_method': 'cash',
            'created_by': user,
        },
        {
            'category': 'transport',
            'amount': 600.00,
            'date': datetime.now().date() - timedelta(days=1),
            'description': 'مصاريف النقل والشحن',
            'payment_method': 'cash',
            'created_by': user,
        },
    ]
    
    expenses = []
    for data in expenses_data:
        expense = Expense.objects.create(
            category=data['category'],
            amount=data['amount'],
            date=data['date'],
            description=data['description'],
            payment_method=data['payment_method'],
            created_by=data['created_by'],
        )
        expenses.append(expense)
        print(f"  ✅ {data['description']} - {data['amount']} ج.م")
    
    return expenses

# ============================================
# 12. إنشاء الإيرادات
# ============================================

def create_incomes(user):
    """إنشاء إيرادات"""
    print("💵 Creating incomes...")
    
    incomes_data = [
        # إيرادات إسلام حمدى
        {
            'category': 'sales',
            'amount': 25000.00,
            'date': datetime.now().date() - timedelta(days=1),
            'description': 'مبيعات منتجات إسلام حمدى',
            'payment_method': 'bank_transfer',
            'created_by': user,
        },
        {
            'category': 'services',
            'amount': 15000.00,
            'date': datetime.now().date() - timedelta(days=2),
            'description': 'خدمات تصميم إسلام حمدى',
            'payment_method': 'cash',
            'created_by': user,
        },
        # إيرادات عادية
        {
            'category': 'sales',
            'amount': 25000.00,
            'date': datetime.now().date() - timedelta(days=1),
            'description': 'مبيعات اليوم',
            'payment_method': 'cash',
            'created_by': user,
        },
        {
            'category': 'services',
            'amount': 5000.00,
            'date': datetime.now().date() - timedelta(days=2),
            'description': 'خدمات تركيب',
            'payment_method': 'bank_transfer',
            'created_by': user,
        },
        {
            'category': 'sales',
            'amount': 18000.00,
            'date': datetime.now().date() - timedelta(days=3),
            'description': 'مبيعات الأسبوع',
            'payment_method': 'cash',
            'created_by': user,
        },
        {
            'category': 'sales',
            'amount': 12000.00,
            'date': datetime.now().date() - timedelta(days=5),
            'description': 'مبيعات اليوم',
            'payment_method': 'bank_transfer',
            'created_by': user,
        },
    ]
    
    incomes = []
    for data in incomes_data:
        income = Income.objects.create(
            category=data['category'],
            amount=data['amount'],
            date=data['date'],
            description=data['description'],
            payment_method=data['payment_method'],
            created_by=data['created_by'],
        )
        incomes.append(income)
        print(f"  ✅ {data['description']} - {data['amount']} ج.م")
    
    return incomes

# ============================================
# 13. الدالة الرئيسية
# ============================================

def main():
    """الدالة الرئيسية"""
    print("\n" + "="*70)
    print("  🌱 SEEDING COMPLETE DATABASE")
    print("  تم التطوير بواسطة: مهندس / إسلام حمدى")
    print("  Portfolio: https://islam-portfolio-phi.vercel.app/")
    print("="*70 + "\n")
    
    try:
        # 1. إنشاء المستخدمين
        users = create_users()
        admin_user = users[0]
        islam_user = users[1] if len(users) > 1 else users[0]
        print()
        
        # 2. إنشاء الفئات
        categories = create_categories()
        print()
        
        # 3. إنشاء العلامات التجارية
        brands = create_brands()
        print()
        
        # 4. إنشاء وحدات القياس
        units = create_units()
        print()
        
        # 5. إنشاء المنتجات
        products = create_products(categories, brands, units, islam_user)
        print()
        
        # 6. إنشاء العملاء
        customers = create_customers(islam_user)
        print()
        
        # 7. إنشاء الموردين
        suppliers = create_suppliers(islam_user)
        print()
        
        # 8. إنشاء المخازن
        warehouses = create_warehouses(islam_user)
        print()
        
        # 9. إنشاء المخزون
        stocks = create_stock(products, warehouses)
        print()
        
        # 10. إنشاء الحسابات المالية
        accounts = create_accounts()
        print()
        
        # 11. إنشاء المصروفات
        expenses = create_expenses(islam_user)
        print()
        
        # 12. إنشاء الإيرادات
        incomes = create_incomes(islam_user)
        print()
        
        print("\n" + "="*70)
        print("  ✅ SEEDING COMPLETED SUCCESSFULLY!")
        print("="*70)
        print(f"\n  📊 Summary:")
        print(f"  • Users: {User.objects.count()}")
        print(f"  • Categories: {Category.objects.count()}")
        print(f"  • Brands: {Brand.objects.count()}")
        print(f"  • Units: {Unit.objects.count()}")
        print(f"  • Products: {Product.objects.count()}")
        print(f"  • Customers: {Customer.objects.count()}")
        print(f"  • Suppliers: {Supplier.objects.count()}")
        print(f"  • Warehouses: {Warehouse.objects.count()}")
        print(f"  • Stock items: {Stock.objects.count()}")
        print(f"  • Accounts: {Account.objects.count()}")
        print(f"  • Expenses: {Expense.objects.count()}")
        print(f"  • Incomes: {Income.objects.count()}")
        print("\n  🔑 Login credentials:")
        print(f"  • Admin:    admin@duka.com / admin123456")
        print(f"  • Islam:    islam@duka.com / Islam@2026")
        print(f"  • Manager:  manager@duka.com / manager123")
        print(f"  • Cashier:  cashier@duka.com / cashier123")
        print(f"  • Store:    store@duka.com / store123")
        print("\n  💰 Financial Summary:")
        total_expenses = sum(e.amount for e in Expense.objects.all())
        total_incomes = sum(i.amount for i in Income.objects.all())
        print(f"  • Total Expenses: {total_expenses:.2f} ج.م")
        print(f"  • Total Incomes:  {total_incomes:.2f} ج.م")
        print(f"  • Net Profit:     {total_incomes - total_expenses:.2f} ج.م")
        
        total_stock_value = sum(s.quantity * s.product.purchase_price for s in Stock.objects.all())
        print(f"  • Total Stock Value: {total_stock_value:.2f} ج.م")
        print("\n" + "="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
