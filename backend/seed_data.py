import os
import django
import uuid
from decimal import Decimal
from datetime import datetime, timedelta

# إعداد Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Category, Brand, Unit, Product
from customers.models import Customer
from suppliers.models import Supplier
from inventory.models import Warehouse, Stock, StockMovement
from django.contrib.auth.hashers import make_password

User = get_user_model()

def create_users():
    """إنشاء مستخدمين"""
    print("👤 Creating users...")
    
    # مستخدم مشرف - استخدام update_or_create لتجنب التكرار
    admin, created = User.objects.update_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'password': make_password('admin123456'),
            'first_name': 'Admin',
            'last_name': 'System',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        }
    )
    if created:
        print("  ✅ Admin user created")
    else:
        print("  ℹ️ Admin user already exists")
    
    # مستخدم عادي
    user, created = User.objects.update_or_create(
        username='user',
        defaults={
            'email': 'user@example.com',
            'password': make_password('user123456'),
            'first_name': 'Test',
            'last_name': 'User',
            'is_staff': False,
            'is_superuser': False,
            'is_active': True,
        }
    )
    if created:
        print("  ✅ Regular user created")
    else:
        print("  ℹ️ Regular user already exists")
    
    return admin, user

def create_categories():
    """إنشاء فئات المنتجات"""
    print("📁 Creating categories...")
    
    categories_data = [
        {'name': 'صنابير', 'name_ar': 'صنابير', 'description': 'جميع أنواع الصنابير والمحابس'},
        {'name': 'خلاطات', 'name_ar': 'خلاطات', 'description': 'خلاطات المطبخ والحمام'},
        {'name': 'مواسير', 'name_ar': 'مواسير', 'description': 'مواسير المياه والصرف'},
        {'name': 'محابس', 'name_ar': 'محابس', 'description': 'محابس التحكم في المياه'},
        {'name': 'أدوات صحية', 'name_ar': 'أدوات صحية', 'description': 'أدوات صحية للحمامات والمطابخ'},
        {'name': 'مضخات', 'name_ar': 'مضخات', 'description': 'مضخات المياه'},
        {'name': 'خزانات', 'name_ar': 'خزانات', 'description': 'خزانات المياه'},
        {'name': 'أنظمة ري', 'name_ar': 'أنظمة ري', 'description': 'أنظمة الري الزراعي'},
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
        else:
            print(f"  ℹ️ {data['name']} already exists")
    
    return categories

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
        else:
            print(f"  ℹ️ {data['name']} already exists")
    
    return brands

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
        else:
            print(f"  ℹ️ {data['name']} already exists")
    
    return units

def create_products(categories, brands, units, user):
    """إنشاء منتجات"""
    print("📦 Creating products...")
    
    products_data = [
        {
            'name': 'قلب حنفية',
            'name_ar': 'قلب حنفية',
            'description': 'قلب حنفية استانلس ستيل مقاس 1/2',
            'category': categories[0] if len(categories) > 0 else None,
            'brand': brands[0] if len(brands) > 0 else None,
            'unit': units[0] if len(units) > 0 else None,
            'sku': 'SKU-001',
            'barcode': '1234567890',
            'purchase_price': 50.00,
            'selling_price': 80.00,
            'wholesale_price': 65.00,
            'size': '1/2',
            'color': 'Chrome',
            'weight': 0.5,
            'is_active': True,
            'is_featured': True,
            'has_stock': True,
        },
        {
            'name': 'خلاط مطبخ',
            'name_ar': 'خلاط مطبخ',
            'description': 'خلاط مطبخ استانلس ستيل مع خرطوم',
            'category': categories[1] if len(categories) > 1 else None,
            'brand': brands[1] if len(brands) > 1 else None,
            'unit': units[0] if len(units) > 0 else None,
            'sku': 'SKU-002',
            'barcode': '1234567891',
            'purchase_price': 150.00,
            'selling_price': 250.00,
            'wholesale_price': 200.00,
            'size': 'standard',
            'color': 'Silver',
            'weight': 2.0,
            'is_active': True,
            'is_featured': True,
            'has_stock': True,
        },
        {
            'name': 'مواسير PVC',
            'name_ar': 'مواسير PVC',
            'description': 'مواسير PVC مقاس 1 بوصة - 3 متر',
            'category': categories[2] if len(categories) > 2 else None,
            'brand': brands[4] if len(brands) > 4 else None,
            'unit': units[2] if len(units) > 2 else None,
            'sku': 'SKU-003',
            'barcode': '1234567892',
            'purchase_price': 30.00,
            'selling_price': 45.00,
            'wholesale_price': 38.00,
            'size': '1 بوصة',
            'color': 'White',
            'weight': 1.0,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
        {
            'name': 'محبس زاوية',
            'name_ar': 'محبس زاوية',
            'description': 'محبس زاوية نحاس 1/2',
            'category': categories[3] if len(categories) > 3 else None,
            'brand': brands[2] if len(brands) > 2 else None,
            'unit': units[0] if len(units) > 0 else None,
            'sku': 'SKU-004',
            'barcode': '1234567893',
            'purchase_price': 25.00,
            'selling_price': 45.00,
            'wholesale_price': 35.00,
            'size': '1/2',
            'color': 'Gold',
            'weight': 0.3,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
        {
            'name': 'طقم حمام كامل',
            'name_ar': 'طقم حمام كامل',
            'description': 'طقم حمام كامل شامل حوض وخلاط وإكسسوارات',
            'category': categories[4] if len(categories) > 4 else None,
            'brand': brands[3] if len(brands) > 3 else None,
            'unit': units[4] if len(units) > 4 else None,
            'sku': 'SKU-005',
            'barcode': '1234567894',
            'purchase_price': 800.00,
            'selling_price': 1200.00,
            'wholesale_price': 1000.00,
            'size': 'standard',
            'color': 'White',
            'weight': 15.0,
            'is_active': True,
            'is_featured': True,
            'has_stock': True,
        },
        {
            'name': 'مضخة مياه',
            'name_ar': 'مضخة مياه',
            'description': 'مضخة مياه بقدرة 1 حصان',
            'category': categories[5] if len(categories) > 5 else None,
            'brand': brands[0] if len(brands) > 0 else None,
            'unit': units[0] if len(units) > 0 else None,
            'sku': 'SKU-006',
            'barcode': '1234567895',
            'purchase_price': 500.00,
            'selling_price': 750.00,
            'wholesale_price': 650.00,
            'size': '1 حصان',
            'color': 'Blue',
            'weight': 10.0,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
        {
            'name': 'خزان مياه',
            'name_ar': 'خزان مياه',
            'description': 'خزان مياه 1000 لتر',
            'category': categories[6] if len(categories) > 6 else None,
            'brand': brands[5] if len(brands) > 5 else None,
            'unit': units[5] if len(units) > 5 else None,
            'sku': 'SKU-007',
            'barcode': '1234567896',
            'purchase_price': 1200.00,
            'selling_price': 1800.00,
            'wholesale_price': 1500.00,
            'size': '1000 لتر',
            'color': 'Blue',
            'weight': 50.0,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
        {
            'name': 'خرطوم ري',
            'name_ar': 'خرطوم ري',
            'description': 'خرطوم ري 50 متر',
            'category': categories[7] if len(categories) > 7 else None,
            'brand': brands[6] if len(brands) > 6 else None,
            'unit': units[2] if len(units) > 2 else None,
            'sku': 'SKU-008',
            'barcode': '1234567897',
            'purchase_price': 80.00,
            'selling_price': 120.00,
            'wholesale_price': 100.00,
            'size': '50 متر',
            'color': 'Green',
            'weight': 3.0,
            'is_active': True,
            'is_featured': False,
            'has_stock': True,
        },
    ]
    
    products = []
    for data in products_data:
        if not data['category'] or not data['brand'] or not data['unit']:
            print(f"  ⚠️ Skipping {data['name']} - missing category/brand/unit")
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

def create_customers(user):
    """إنشاء عملاء"""
    print("👤 Creating customers...")
    
    customers_data = [
        {
            'name': 'أحمد محمد',
            'name_ar': 'أحمد محمد',
            'phone': '01001234567',
            'email': 'ahmed@example.com',
            'address': 'شارع النيل، القاهرة',
            'balance': 0,
            'is_active': True,
            'is_vip': True,
        },
        {
            'name': 'سارة علي',
            'name_ar': 'سارة علي',
            'phone': '01007654321',
            'email': 'sara@example.com',
            'address': 'شارع الأهرام، الجيزة',
            'balance': 500.00,
            'is_active': True,
            'is_vip': False,
        },
        {
            'name': 'محمد حسن',
            'name_ar': 'محمد حسن',
            'phone': '01009876543',
            'email': 'mohamed@example.com',
            'address': 'مدينة نصر، القاهرة',
            'balance': -200.00,
            'is_active': True,
            'is_vip': False,
        },
        {
            'name': 'فاطمة إبراهيم',
            'name_ar': 'فاطمة إبراهيم',
            'phone': '01005432167',
            'email': 'fatma@example.com',
            'address': 'الإسكندرية',
            'balance': 1000.00,
            'is_active': True,
            'is_vip': True,
        },
        {
            'name': 'عبدالله سعيد',
            'name_ar': 'عبدالله سعيد',
            'phone': '01003216547',
            'email': 'abdullah@example.com',
            'address': 'مدينة 6 أكتوبر',
            'balance': 300.00,
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

def create_suppliers(user):
    """إنشاء موردين"""
    print("🏭 Creating suppliers...")
    
    suppliers_data = [
        {
            'name': 'شركة النيل للتجارة',
            'name_ar': 'شركة النيل للتجارة',
            'phone': '01001112222',
            'email': 'nile@example.com',
            'address': 'القاهرة',
            'balance': 0,
            'is_active': True,
        },
        {
            'name': 'مؤسسة الإسكندرية',
            'name_ar': 'مؤسسة الإسكندرية',
            'phone': '01002223333',
            'email': 'alex@example.com',
            'address': 'الإسكندرية',
            'balance': -500.00,
            'is_active': True,
        },
        {
            'name': 'شركة الجيزة للمواسير',
            'name_ar': 'شركة الجيزة للمواسير',
            'phone': '01003334444',
            'email': 'giza@example.com',
            'address': 'الجيزة',
            'balance': 1000.00,
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

def create_warehouse(user):
    """إنشاء مخزن"""
    print("🏠 Creating warehouse...")
    
    warehouse, created = Warehouse.objects.get_or_create(
        name='المخزن الرئيسي',
        defaults={
            'name_ar': 'المخزن الرئيسي',
            'location': 'الطابق الأول، المبنى الرئيسي',
            'manager': user,
            'is_active': True,
        }
    )
    if created:
        print("  ✅ Warehouse created")
    else:
        print("  ℹ️ Warehouse already exists")
    
    return warehouse

def create_stock(products, warehouse):
    """إنشاء مخزون أولي"""
    print("📊 Creating stock...")
    
    stock_data = [
        {'product': products[0] if len(products) > 0 else None, 'quantity': 50, 'min_quantity': 10, 'max_quantity': 100},
        {'product': products[1] if len(products) > 1 else None, 'quantity': 30, 'min_quantity': 5, 'max_quantity': 50},
        {'product': products[2] if len(products) > 2 else None, 'quantity': 100, 'min_quantity': 20, 'max_quantity': 200},
        {'product': products[3] if len(products) > 3 else None, 'quantity': 40, 'min_quantity': 10, 'max_quantity': 80},
        {'product': products[4] if len(products) > 4 else None, 'quantity': 15, 'min_quantity': 3, 'max_quantity': 30},
        {'product': products[5] if len(products) > 5 else None, 'quantity': 20, 'min_quantity': 5, 'max_quantity': 40},
        {'product': products[6] if len(products) > 6 else None, 'quantity': 10, 'min_quantity': 2, 'max_quantity': 20},
        {'product': products[7] if len(products) > 7 else None, 'quantity': 60, 'min_quantity': 10, 'max_quantity': 100},
    ]
    
    stocks = []
    for data in stock_data:
        if not data['product']:
            continue
            
        stock, created = Stock.objects.get_or_create(
            product=data['product'],
            warehouse=warehouse,
            defaults={
                'quantity': data['quantity'],
                'min_quantity': data['min_quantity'],
                'max_quantity': data['max_quantity'],
                'reserved_quantity': 0,
            }
        )
        stocks.append(stock)
        if created:
            print(f"  ✅ Stock for {data['product'].name} created")
        else:
            print(f"  ℹ️ Stock for {data['product'].name} already exists")
    
    return stocks

def main():
    """الدالة الرئيسية"""
    print("\n" + "="*60)
    print("  🌱 SEEDING DATABASE WITH TEST DATA")
    print("="*60 + "\n")
    
    try:
        # إنشاء المستخدمين
        admin, user = create_users()
        print()
        
        # إنشاء الفئات
        categories = create_categories()
        print()
        
        # إنشاء العلامات التجارية
        brands = create_brands()
        print()
        
        # إنشاء وحدات القياس
        units = create_units()
        print()
        
        # إنشاء المنتجات
        products = create_products(categories, brands, units, user)
        print()
        
        # إنشاء العملاء
        customers = create_customers(user)
        print()
        
        # إنشاء الموردين
        suppliers = create_suppliers(user)
        print()
        
        # إنشاء المخزن
        warehouse = create_warehouse(user)
        print()
        
        # إنشاء المخزون
        stocks = create_stock(products, warehouse)
        print()
        
        print("\n" + "="*60)
        print("  ✅ SEEDING COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"\n  📊 Summary:")
        print(f"  • {User.objects.count()} users")
        print(f"  • {Category.objects.count()} categories")
        print(f"  • {Brand.objects.count()} brands")
        print(f"  • {Unit.objects.count()} units")
        print(f"  • {Product.objects.count()} products")
        print(f"  • {Customer.objects.count()} customers")
        print(f"  • {Supplier.objects.count()} suppliers")
        print(f"  • {Warehouse.objects.count()} warehouse")
        print(f"  • {Stock.objects.count()} stock items")
        print("\n  🔑 Login credentials:")
        print(f"  • Admin: admin@example.com / admin123456")
        print(f"  • User: user@example.com / user123456")
        print("\n" + "="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Please make sure:")
        print("  1. Django is properly configured")
        print("  2. Database migrations are applied")
        print("  3. You're in the correct directory")

if __name__ == "__main__":
    main()
