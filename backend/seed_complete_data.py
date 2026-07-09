"""
إضافة بيانات كاملة وشاملة مع فواتير ومدفوعات
"""

import os
import django
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from products.models import Category, Brand, Unit, Product
from customers.models import Customer
from suppliers.models import Supplier
from inventory.models import Warehouse, Stock
from sales.models import Invoice, InvoiceItem, Payment, Return
from finance.models import Account, Expense, Income
from notifications.models import Notification

User = get_user_model()

def create_users():
    print("👤 Creating users...")
    users_data = [
        {'username': 'admin', 'email': 'admin@duka.com', 'password': 'admin123456', 'first_name': 'مدير', 'last_name': 'النظام', 'is_staff': True, 'is_superuser': True},
        {'username': 'islam_hamdy', 'email': 'islam@duka.com', 'password': 'Islam@2026', 'first_name': 'إسلام', 'last_name': 'حمدى', 'is_staff': True, 'is_superuser': True},
        {'username': 'manager', 'email': 'manager@duka.com', 'password': 'manager123', 'first_name': 'مدير', 'last_name': 'المبيعات', 'is_staff': True},
        {'username': 'cashier', 'email': 'cashier@duka.com', 'password': 'cashier123', 'first_name': 'محاسب', 'last_name': 'الصندوق'},
        {'username': 'store_keeper', 'email': 'store@duka.com', 'password': 'store123', 'first_name': 'أمين', 'last_name': 'المخزن'},
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
                'is_staff': data.get('is_staff', False),
                'is_superuser': data.get('is_superuser', False),
                'is_active': True,
            }
        )
        users.append(user)
        if created:
            print(f"  ✅ {data['username']} created")
        else:
            print(f"  ℹ️ {data['username']} already exists")
    return users

def create_categories():
    print("📁 Creating categories...")
    categories_data = [
        {'name': 'صنابير', 'name_ar': 'صنابير', 'description': 'جميع أنواع الصنابير'},
        {'name': 'خلاطات', 'name_ar': 'خلاطات', 'description': 'خلاطات المطبخ والحمام'},
        {'name': 'مواسير', 'name_ar': 'مواسير', 'description': 'مواسير المياه والصرف'},
        {'name': 'محابس', 'name_ar': 'محابس', 'description': 'محابس التحكم في المياه'},
        {'name': 'أدوات صحية', 'name_ar': 'أدوات صحية', 'description': 'أدوات صحية للحمامات'},
        {'name': 'مضخات', 'name_ar': 'مضخات', 'description': 'مضخات المياه'},
        {'name': 'خزانات', 'name_ar': 'خزانات', 'description': 'خزانات المياه'},
        {'name': 'أنظمة ري', 'name_ar': 'أنظمة ري', 'description': 'أنظمة الري الزراعي'},
        {'name': 'أدوات كهربائية', 'name_ar': 'أدوات كهربائية', 'description': 'أدوات كهربائية'},
        {'name': 'مواد بناء', 'name_ar': 'مواد بناء', 'description': 'مواد البناء'},
    ]
    categories = []
    for data in categories_data:
        cat, created = Category.objects.get_or_create(name=data['name'], defaults=data)
        categories.append(cat)
        if created:
            print(f"  ✅ {data['name']} created")
    return categories

def create_brands():
    print("🏷️ Creating brands...")
    brands_data = [
        {'name': 'Ideal', 'name_ar': 'ايديال'},
        {'name': 'Grohe', 'name_ar': 'جروهي'},
        {'name': 'Hansgrohe', 'name_ar': 'هانزجروهي'},
        {'name': 'Villeroy & Boch', 'name_ar': 'فيلروي وبوش'},
        {'name': 'Duravit', 'name_ar': 'دورافيت'},
        {'name': 'Toto', 'name_ar': 'توتو'},
        {'name': 'Kohler', 'name_ar': 'كولر'},
        {'name': 'Moen', 'name_ar': 'موين'},
        {'name': 'Delta', 'name_ar': 'دلتا'},
        {'name': 'American Standard', 'name_ar': 'أمريكان ستاندرد'},
        {'name': 'Saudi Ceramics', 'name_ar': 'السعودية للسيراميك'},
        {'name': 'Al Rajhi', 'name_ar': 'الراجحي'},
        {'name': 'IslamHamdy', 'name_ar': 'إسلام حمدى'},
        {'name': 'HamdyTech', 'name_ar': 'حمدى تك'},
    ]
    brands = []
    for data in brands_data:
        brand, created = Brand.objects.get_or_create(
            name=data['name'],
            defaults={'name_ar': data['name_ar'], 'is_active': True}
        )
        brands.append(brand)
        if created:
            print(f"  ✅ {data['name']} created")
    return brands

def create_units():
    print("📏 Creating units...")
    units_data = [
        {'name': 'قطعة', 'symbol': 'قطعة'},
        {'name': 'كيلو جرام', 'symbol': 'كجم'},
        {'name': 'متر', 'symbol': 'م'},
        {'name': 'علبة', 'symbol': 'علبة'},
        {'name': 'طقم', 'symbol': 'طقم'},
        {'name': 'لتر', 'symbol': 'لتر'},
        {'name': 'كرتونة', 'symbol': 'كرتونة'},
    ]
    units = []
    for data in units_data:
        unit, created = Unit.objects.get_or_create(
            name=data['name'],
            defaults={'symbol': data['symbol'], 'is_active': True}
        )
        units.append(unit)
        if created:
            print(f"  ✅ {data['name']} created")
    return units

def create_products(categories, brands, units, user):
    print("📦 Creating products...")
    products_data = [
        {'name': 'قلب حنفية إسلام', 'sku': 'ISLAM-001', 'category': categories[0], 'brand': brands[12], 'unit': units[0], 'purchase_price': 100, 'selling_price': 200},
        {'name': 'خلاط مطبخ حمدى', 'sku': 'HAMDY-001', 'category': categories[1], 'brand': brands[13], 'unit': units[0], 'purchase_price': 250, 'selling_price': 450},
        {'name': 'طقم حمام إسلام', 'sku': 'ISLAM-002', 'category': categories[4], 'brand': brands[12], 'unit': units[4], 'purchase_price': 1000, 'selling_price': 2000},
        {'name': 'قلب حنفية استانلس', 'sku': 'SKU-001', 'category': categories[0], 'brand': brands[0], 'unit': units[0], 'purchase_price': 45, 'selling_price': 75},
        {'name': 'خلاط مطبخ ستانلس', 'sku': 'SKU-002', 'category': categories[1], 'brand': brands[1], 'unit': units[0], 'purchase_price': 180, 'selling_price': 320},
        {'name': 'مواسير PVC', 'sku': 'SKU-003', 'category': categories[2], 'brand': brands[4], 'unit': units[2], 'purchase_price': 35, 'selling_price': 55},
        {'name': 'محبس زاوية نحاس', 'sku': 'SKU-004', 'category': categories[3], 'brand': brands[2], 'unit': units[0], 'purchase_price': 30, 'selling_price': 50},
        {'name': 'طقم حمام كامل', 'sku': 'SKU-005', 'category': categories[4], 'brand': brands[3], 'unit': units[4], 'purchase_price': 900, 'selling_price': 1500},
        {'name': 'مضخة مياه', 'sku': 'SKU-006', 'category': categories[5], 'brand': brands[6], 'unit': units[0], 'purchase_price': 550, 'selling_price': 850},
        {'name': 'خزان مياه', 'sku': 'SKU-007', 'category': categories[6], 'brand': brands[5], 'unit': units[5], 'purchase_price': 1300, 'selling_price': 2000},
        {'name': 'خرطوم ري', 'sku': 'SKU-008', 'category': categories[7], 'brand': brands[7], 'unit': units[2], 'purchase_price': 90, 'selling_price': 140},
        {'name': 'سخان مياه كهربائي', 'sku': 'SKU-009', 'category': categories[8], 'brand': brands[8], 'unit': units[0], 'purchase_price': 800, 'selling_price': 1200},
        {'name': 'أسمنت بورتلاند', 'sku': 'SKU-010', 'category': categories[9], 'brand': brands[10], 'unit': units[1], 'purchase_price': 120, 'selling_price': 180},
    ]
    products = []
    for data in products_data:
        product, created = Product.objects.get_or_create(
            sku=data['sku'],
            defaults={
                'name': data['name'],
                'category': data['category'],
                'brand': data['brand'],
                'unit': data['unit'],
                'purchase_price': data['purchase_price'],
                'selling_price': data['selling_price'],
                'is_active': True,
                'has_stock': True,
                'created_by': user,
            }
        )
        products.append(product)
        if created:
            print(f"  ✅ {data['name']} created")
    return products

def create_customers(user):
    print("👤 Creating customers...")
    customers_data = [
        {'name': 'أحمد محمد', 'phone': '01001234567', 'balance': 0, 'is_vip': False},
        {'name': 'سارة علي', 'phone': '01007654321', 'balance': 500, 'is_vip': False},
        {'name': 'محمد حسن', 'phone': '01009876543', 'balance': -200, 'is_vip': False},
        {'name': 'فاطمة إبراهيم', 'phone': '01005432167', 'balance': 1000, 'is_vip': True},
        {'name': 'عبدالله سعيد', 'phone': '01003216547', 'balance': 300, 'is_vip': False},
        {'name': 'نورة عبدالرحمن', 'phone': '01001122334', 'balance': 2000, 'is_vip': True},
        {'name': 'خالد سليمان', 'phone': '01002233445', 'balance': 750, 'is_vip': False},
        {'name': 'عميل إسلام الأول', 'phone': '01000000001', 'balance': 10000, 'is_vip': True},
        {'name': 'عميلة إسلام الثانية', 'phone': '01000000002', 'balance': 5000, 'is_vip': True},
    ]
    customers = []
    for data in customers_data:
        customer, created = Customer.objects.get_or_create(
            phone=data['phone'],
            defaults={
                'name': data['name'],
                'balance': data['balance'],
                'is_vip': data['is_vip'],
                'is_active': True,
                'created_by': user,
            }
        )
        customers.append(customer)
        if created:
            print(f"  ✅ {data['name']} created")
    return customers

def create_suppliers(user):
    print("🏭 Creating suppliers...")
    suppliers_data = [
        {'name': 'مورد إسلام الأول', 'phone': '01000000011', 'balance': 20000},
        {'name': 'مورد إسلام الثاني', 'phone': '01000000012', 'balance': 15000},
        {'name': 'شركة النيل للتجارة', 'phone': '01001112222', 'balance': 0},
        {'name': 'مؤسسة الإسكندرية', 'phone': '01002223333', 'balance': -500},
        {'name': 'شركة الجيزة للمواسير', 'phone': '01003334444', 'balance': 1000},
        {'name': 'مصنع الرياض للصنابير', 'phone': '01004445555', 'balance': 2500},
        {'name': 'شركة الخليج للمضخات', 'phone': '01005556666', 'balance': -300},
    ]
    suppliers = []
    for data in suppliers_data:
        supplier, created = Supplier.objects.get_or_create(
            phone=data['phone'],
            defaults={
                'name': data['name'],
                'balance': data['balance'],
                'is_active': True,
                'created_by': user,
            }
        )
        suppliers.append(supplier)
        if created:
            print(f"  ✅ {data['name']} created")
    return suppliers

def create_warehouses(user):
    print("🏠 Creating warehouses...")
    warehouses_data = [
        {'name': 'مخزن إسلام حمدى', 'location': 'مدينة إسلام'},
        {'name': 'المخزن الرئيسي', 'location': 'الطابق الأول'},
        {'name': 'مخزن المواد الخام', 'location': 'الطابق الأرضي'},
        {'name': 'مخزن المنتجات النهائية', 'location': 'الطابق الثاني'},
    ]
    warehouses = []
    for data in warehouses_data:
        warehouse, created = Warehouse.objects.get_or_create(
            name=data['name'],
            defaults={'location': data['location'], 'is_active': True, 'manager': user}
        )
        warehouses.append(warehouse)
        if created:
            print(f"  ✅ {data['name']} created")
    return warehouses

def create_stock(products, warehouses):
    print("📊 Creating stock...")
    stock_items = []
    for i, product in enumerate(products):
        warehouse_idx = i % len(warehouses)
        quantity = random.randint(50, 200)
        stock, created = Stock.objects.get_or_create(
            product=product,
            warehouse=warehouses[warehouse_idx],
            defaults={
                'quantity': quantity,
                'min_quantity': random.randint(5, 20),
                'max_quantity': quantity * 2,
                'reserved_quantity': 0,
            }
        )
        stock_items.append(stock)
        if created:
            print(f"  ✅ Stock for {product.name} created")
    return stock_items

def create_invoices(customers, products, user):
    print("📄 Creating invoices...")
    invoices = []
    statuses = ['confirmed', 'paid', 'partially_paid']
    
    for i in range(20):
        customer = random.choice(customers)
        num_items = random.randint(1, 3)
        selected_products = random.sample(products, num_items)
        
        # استخدام Decimal للعمليات الحسابية
        discount = Decimal(random.choice([0, 50, 100]))
        tax = Decimal(random.choice([0, 50, 100]))
        
        invoice = Invoice.objects.create(
            customer=customer,
            due_date=datetime.now().date() + timedelta(days=random.randint(7, 30)),
            discount=discount,
            tax=tax,
            notes=f"فاتورة رقم {i+1}",
            created_by=user,
        )
        
        total = Decimal(0)
        for product in selected_products:
            quantity = Decimal(random.randint(1, 5))
            unit_price = Decimal(str(product.selling_price))
            item_total = quantity * unit_price
            total += item_total
            InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                total=item_total,
            )
        
        # تحديث الفاتورة باستخدام Decimal
        invoice.subtotal = total
        invoice.total = total - invoice.discount + invoice.tax
        
        # اختيار مبلغ مدفوع عشوائي
        paid_choices = [Decimal(0), total * Decimal('0.5'), total]
        invoice.paid_amount = random.choice(paid_choices)
        invoice.remaining_amount = invoice.total - invoice.paid_amount
        
        if invoice.paid_amount >= invoice.total:
            invoice.status = 'paid'
        elif invoice.paid_amount > 0:
            invoice.status = 'partially_paid'
        else:
            invoice.status = random.choice(['confirmed', 'draft'])
        
        # حفظ بدون استدعاء update_totals مرة أخرى لتجنب التعارض
        invoice.save(update_fields=['subtotal', 'total', 'paid_amount', 'remaining_amount', 'status'])
        invoices.append(invoice)
        print(f"  ✅ Invoice {invoice.invoice_number} created")
    
    return invoices

def create_payments(invoices, user):
    print("💳 Creating payments...")
    payments = []
    for invoice in invoices[:10]:
        if invoice.remaining_amount > 0:
            payment = Payment.objects.create(
                invoice=invoice,
                amount=random.choice([invoice.remaining_amount * Decimal('0.5'), invoice.remaining_amount]),
                payment_method=random.choice(['cash', 'card', 'bank_transfer']),
                notes=f"دفعة على فاتورة {invoice.invoice_number}",
                created_by=user,
            )
            payments.append(payment)
            print(f"  ✅ Payment {payment.amount} for {invoice.invoice_number}")
    return payments

def create_expenses(user):
    print("💸 Creating expenses...")
    expenses_data = [
        {'category': 'rent', 'amount': 5000, 'description': 'إيجار المكتب الشهري'},
        {'category': 'salaries', 'amount': 15000, 'description': 'رواتب الموظفين'},
        {'category': 'utilities', 'amount': 800, 'description': 'فواتير الكهرباء والمياه'},
        {'category': 'marketing', 'amount': 3000, 'description': 'تسويق منتجات إسلام حمدى'},
        {'category': 'transport', 'amount': 600, 'description': 'مصاريف النقل والشحن'},
        {'category': 'supplies', 'amount': 1200, 'description': 'مستلزمات مكتبية'},
    ]
    expenses = []
    for data in expenses_data:
        expense = Expense.objects.create(
            category=data['category'],
            amount=Decimal(str(data['amount'])),
            date=datetime.now().date() - timedelta(days=random.randint(1, 10)),
            description=data['description'],
            payment_method='cash',
            created_by=user,
        )
        expenses.append(expense)
        print(f"  ✅ {data['description']} - {data['amount']} ج.م")
    return expenses

def create_incomes(user):
    print("💵 Creating incomes...")
    incomes_data = [
        {'category': 'sales', 'amount': 25000, 'description': 'مبيعات اليوم'},
        {'category': 'sales', 'amount': 18000, 'description': 'مبيعات الأسبوع'},
        {'category': 'services', 'amount': 5000, 'description': 'خدمات تركيب'},
        {'category': 'sales', 'amount': 12000, 'description': 'مبيعات اليوم'},
        {'category': 'services', 'amount': 15000, 'description': 'خدمات تصميم إسلام حمدى'},
        {'category': 'sales', 'amount': 25000, 'description': 'مبيعات منتجات إسلام حمدى'},
    ]
    incomes = []
    for data in incomes_data:
        income = Income.objects.create(
            category=data['category'],
            amount=Decimal(str(data['amount'])),
            date=datetime.now().date() - timedelta(days=random.randint(1, 7)),
            description=data['description'],
            payment_method='cash',
            created_by=user,
        )
        incomes.append(income)
        print(f"  ✅ {data['description']} - {data['amount']} ج.م")
    return incomes

def create_accounts():
    print("💰 Creating accounts...")
    accounts_data = [
        {'code': '1000', 'name': 'النقدية', 'account_type': 'asset', 'balance': 50000},
        {'code': '1010', 'name': 'الصندوق', 'account_type': 'asset', 'balance': 15000},
        {'code': '1020', 'name': 'البنك', 'account_type': 'asset', 'balance': 35000},
        {'code': '2000', 'name': 'الموردين', 'account_type': 'liability', 'balance': 20000},
        {'code': '2010', 'name': 'العملاء', 'account_type': 'asset', 'balance': 15000},
        {'code': '3000', 'name': 'رأس المال', 'account_type': 'equity', 'balance': 100000},
        {'code': '4000', 'name': 'إيرادات المبيعات', 'account_type': 'revenue', 'balance': 0},
        {'code': '5000', 'name': 'مصروفات التشغيل', 'account_type': 'expense', 'balance': 0},
    ]
    accounts = []
    for data in accounts_data:
        account, created = Account.objects.get_or_create(
            code=data['code'],
            defaults={
                'name': data['name'],
                'account_type': data['account_type'],
                'balance': Decimal(str(data['balance'])),
                'is_active': True,
            }
        )
        accounts.append(account)
        if created:
            print(f"  ✅ {data['code']} - {data['name']} created")
    return accounts

def main():
    print("\n" + "="*70)
    print("  🌱 SEEDING COMPLETE DATA")
    print("  تم التطوير بواسطة: مهندس / إسلام حمدى")
    print("="*70 + "\n")
    
    try:
        users = create_users()
        admin_user = users[0]
        islam_user = users[1] if len(users) > 1 else users[0]
        
        categories = create_categories()
        brands = create_brands()
        units = create_units()
        products = create_products(categories, brands, units, islam_user)
        customers = create_customers(islam_user)
        suppliers = create_suppliers(islam_user)
        warehouses = create_warehouses(islam_user)
        stock = create_stock(products, warehouses)
        invoices = create_invoices(customers, products, islam_user)
        payments = create_payments(invoices, islam_user)
        expenses = create_expenses(islam_user)
        incomes = create_incomes(islam_user)
        accounts = create_accounts()
        
        print("\n" + "="*70)
        print("  ✅ DATA SEEDING COMPLETED SUCCESSFULLY!")
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
        print(f"  • Stock: {Stock.objects.count()}")
        print(f"  • Invoices: {Invoice.objects.count()}")
        print(f"  • Payments: {Payment.objects.count()}")
        print(f"  • Expenses: {Expense.objects.count()}")
        print(f"  • Incomes: {Income.objects.count()}")
        print(f"  • Accounts: {Account.objects.count()}")
        print("\n  🔑 Login credentials:")
        print(f"  • Admin: admin@duka.com / admin123456")
        print(f"  • Islam: islam@duka.com / Islam@2026")
        print("\n" + "="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
