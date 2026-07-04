// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string;
}

export interface Profile {
  id: string;
  user: string;
  full_name: string;
  email: string;
  username: string;
  address: string;
  phone: string;
  verified: boolean;
  cover_images: string;
  code: string;
}

// ============================================
// Product Types
// ============================================

export interface Category {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  parent?: string;
  is_active: boolean;
  products_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  id: string;
  name: string;
  name_ar?: string;
  logo?: string;
  description?: string;
  is_active: boolean;
  products_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Unit {
  id: string;
  name: string;
  name_ar?: string;
  symbol?: string;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  image: string;
  image_url: string;
  is_primary: boolean;
  alt_text?: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  category: string;
  category_name?: string;
  brand: string;
  brand_name?: string;
  unit: string;
  unit_name?: string;
  sku: string;
  barcode?: string;
  purchase_price: number;
  selling_price: number;
  wholesale_price?: number;
  profit_margin: number;
  size?: string;
  color?: string;
  weight?: number;
  is_active: boolean;
  is_featured: boolean;
  has_stock: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// ============================================
// Customer & Supplier Types
// ============================================

export interface Customer {
  id: string;
  name: string;
  name_ar?: string;
  email?: string;
  phone: string;
  phone2?: string;
  address?: string;
  balance: number;
  credit_limit?: number;
  outstanding_balance: number;
  total_invoices: number;
  total_purchases: number;
  total_paid: number;
  tax_number?: string;
  notes?: string;
  is_active: boolean;
  is_vip: boolean;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  name_ar?: string;
  email?: string;
  phone: string;
  phone2?: string;
  address?: string;
  balance: number;
  tax_number?: string;
  notes?: string;
  is_active: boolean;
  total_purchases: number;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Sales Types
// ============================================

export interface InvoiceItem {
  id: string;
  product: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount: number;
  tax: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer: string;
  customer_name: string;
  customer_phone: string;
  date: string;
  due_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'draft' | 'confirmed' | 'paid' | 'partially_paid' | 'cancelled';
  status_display: string;
  is_overdue: boolean;
  notes?: string;
  items: InvoiceItem[];
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'cheque';
  payment_method_display: string;
  reference?: string;
  notes?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface Return {
  id: string;
  invoice: string;
  invoice_number: string;
  product: string;
  product_name: string;
  quantity: number;
  amount: number;
  reason?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

// ============================================
// Purchase Types
// ============================================

export interface PurchaseItem {
  id: string;
  order: string;
  product: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount: number;
  tax: number;
  received_quantity: number;
  remaining_quantity: number;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: string;
  supplier_name: string;
  supplier_phone: string;
  warehouse: string;
  warehouse_name: string;
  order_date: string;
  expected_date: string;
  received_date?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  status_display: string;
  notes?: string;
  items: PurchaseItem[];
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Inventory Types
// ============================================

export interface Warehouse {
  id: string;
  name: string;
  name_ar?: string;
  location?: string;
  manager?: string;
  manager_name?: string;
  is_active: boolean;
  stocks_count: number;
  created_at: string;
  updated_at: string;
}

export interface Stock {
  id: string;
  product: string;
  product_name: string;
  product_sku: string;
  warehouse: string;
  warehouse_name: string;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  is_low_stock: boolean;
  is_over_stock: boolean;
  last_updated: string;
  updated_by: string;
}

export interface StockMovement {
  id: string;
  product: string;
  product_name: string;
  warehouse: string;
  warehouse_name: string;
  movement_type: 'purchase' | 'sale' | 'return_sale' | 'return_purchase' | 'adjustment' | 'damage' | 'transfer' | 'opening';
  movement_type_display: string;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
}

// ============================================
// Finance Types
// ============================================

export interface Account {
  id: string;
  code: string;
  name: string;
  name_ar?: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_type_display: string;
  parent?: string;
  full_path: string;
  balance: number;
  is_active: boolean;
  notes?: string;
  children_count: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  date: string;
  description: string;
  reference_type?: string;
  reference_id?: string;
  lines: JournalLine[];
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface JournalLine {
  id: string;
  account: string;
  account_name: string;
  account_code: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface Expense {
  id: string;
  category: 'rent' | 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'transport' | 'marketing' | 'other';
  category_display: string;
  amount: number;
  date: string;
  description: string;
  payment_method: string;
  reference?: string;
  invoice?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  category: 'sales' | 'services' | 'interest' | 'other';
  category_display: string;
  amount: number;
  date: string;
  description: string;
  payment_method: string;
  reference?: string;
  invoice?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CashTransaction {
  id: string;
  transaction_type: 'cash_in' | 'cash_out' | 'transfer';
  transaction_type_display: string;
  amount: number;
  date: string;
  description: string;
  reference_type?: string;
  reference_id?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface DailyClosing {
  id: string;
  date: string;
  opening_balance: number;
  cash_in: number;
  cash_out: number;
  closing_balance: number;
  total_sales: number;
  total_expenses: number;
  total_income: number;
  net_profit: number;
  notes?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error' | 'stock_alert' | 'payment_due' | 'collection_due' | 'order_received' | 'system';
  notification_type_display: string;
  user: string;
  is_read: boolean;
  is_sent: boolean;
  link?: string;
  reference_type?: string;
  reference_id?: string;
  extra_data: any;
  created_at: string;
  read_at?: string;
  sent_at?: string;
}

export interface NotificationPreference {
  id: string;
  user: string;
  enable_notifications: boolean;
  enable_email: boolean;
  enable_push: boolean;
  stock_alert: boolean;
  payment_due: boolean;
  collection_due: boolean;
  order_received: boolean;
  system_updates: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  notification: string;
  channel: 'email' | 'push' | 'sms' | 'whatsapp';
  channel_display: string;
  status: string;
  response?: string;
  error?: string;
  created_at: string;
  sent_at?: string;
}

// ============================================
// Settings Types
// ============================================

export interface Company {
  id: string;
  name: string;
  name_ar?: string;
  legal_name?: string;
  logo?: string;
  favicon?: string;
  cover_image?: string;
  phone?: string;
  phone2?: string;
  whatsapp?: string;
  email?: string;
  email2?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  snapchat?: string;
  address?: string;
  address_ar?: string;
  city?: string;
  city_ar?: string;
  state?: string;
  state_ar?: string;
  country?: string;
  country_ar?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  tax_number?: string;
  commercial_register?: string;
  license_number?: string;
  is_active: boolean;
  social_links: SocialLink[];
  branches: Branch[];
  payment_methods: PaymentMethod[];
  shipping_methods: ShippingMethod[];
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  code: string;
  company: string;
  company_name: string;
  name: string;
  name_ar?: string;
  phone: string;
  phone2?: string;
  whatsapp?: string;
  email?: string;
  address: string;
  address_ar?: string;
  city: string;
  city_ar?: string;
  state?: string;
  state_ar?: string;
  latitude?: number;
  longitude?: number;
  opening_time?: string;
  closing_time?: string;
  is_24_hours: boolean;
  weekend_days?: string;
  is_active: boolean;
  is_main: boolean;
  manager?: string;
  manager_name?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  company: string;
  company_name: string;
  currency: string;
  currency_symbol: string;
  currency_position: 'before' | 'after';
  decimal_places: number;
  thousand_separator: string;
  default_tax_rate: number;
  include_tax_in_price: boolean;
  invoice_prefix: string;
  invoice_suffix?: string;
  invoice_footer?: string;
  invoice_terms?: string;
  enable_invoice_pdf: boolean;
  low_stock_threshold: number;
  enable_stock_alerts: boolean;
  allow_negative_stock: boolean;
  enable_batch_tracking: boolean;
  enable_serial_tracking: boolean;
  enable_customer_accounts: boolean;
  enable_supplier_accounts: boolean;
  auto_customer_code: boolean;
  auto_supplier_code: boolean;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  enable_push_notifications: boolean;
  enable_whatsapp_notifications: boolean;
  default_language: 'ar' | 'en';
  rtl_layout: boolean;
  date_format: string;
  time_format: string;
  session_timeout: number;
  max_login_attempts: number;
  enable_2fa: boolean;
  require_strong_password: boolean;
  enable_api_logging: boolean;
  enable_audit_log: boolean;
  enable_backup: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  enable_online_store: boolean;
  enable_mobile_app: boolean;
  enable_pos: boolean;
  updated_by?: string;
  updated_by_name?: string;
  updated_at: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  company: string;
  name: string;
  name_ar?: string;
  icon?: string;
  is_active: boolean;
  is_default: boolean;
  order: number;
}

export interface ShippingMethod {
  id: string;
  company: string;
  name: string;
  name_ar?: string;
  description?: string;
  cost: number;
  estimated_days: number;
  is_active: boolean;
  is_default: boolean;
}

export interface SocialLink {
  id: string;
  company: string;
  platform: string;
  platform_ar?: string;
  icon?: string;
  url: string;
  is_active: boolean;
  order: number;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  sales: {
    today: { count: number; total: number };
    week: { count: number; total: number };
    month: { count: number; total: number };
    last_month: { count: number; total: number };
    year: { count: number; total: number };
    month_change: number;
  };
  purchases: {
    today: { count: number; total: number };
    month: { count: number; total: number };
    last_month: { count: number; total: number };
    month_change: number;
  };
  finance: {
    month: { expenses: number; income: number; sales: number; profit: number };
    year: { expenses: number; income: number; sales: number; profit: number };
    receivables: number;
    payables: number;
    instalments_receivable: number;
    instalments_payable: number;
  };
  inventory: {
    total_products: number;
    low_stock: number;
    out_of_stock: number;
    stock_in: number;
    stock_out: number;
    stock_return: number;
    stock_damage: number;
    total_value: number;
  };
  customers: {
    total: number;
    vip: number;
    top_customers: Array<{
      id: string;
      name: string;
      phone: string;
      total_purchases: number;
      invoice_count: number;
      outstanding: number;
    }>;
  };
  suppliers: {
    total: number;
    top_suppliers: Array<{
      id: string;
      name: string;
      phone: string;
      total_purchases: number;
      order_count: number;
    }>;
  };
  overdue: {
    count: number;
    total: number;
    invoices: Array<{
      id: string;
      invoice_number: string;
      customer: string;
      remaining: number;
      due_date: string;
      days_overdue: number;
    }>;
  };
  returns: {
    month: { count: number; amount: number };
    damage: { count: number; quantity: number };
  };
  charts: {
    daily_sales: Array<{ date: string; sales: number }>;
    sales_by_category: Array<{ category: string; total: number }>;
    sales_by_brand: Array<{ brand: string; total: number }>;
  };
  products: {
    top: Array<{
      product_id: string;
      product_name: string;
      product_sku: string;
      total_quantity: number;
      total_revenue: number;
      avg_price: number;
    }>;
  };
  last_updated: string;
}

export interface SalesChartData {
  labels: string[];
  sales: number[];
  total: number;
  average: number;
  period: string;
}

export interface ComparisonData {
  categories: Array<{
    name: string;
    name_ar: string;
    total_sales: number;
    total_quantity: number;
    product_count: number;
    avg_price: number;
  }>;
  brands: Array<{
    name: string;
    name_ar: string;
    total_sales: number;
    total_quantity: number;
    product_count: number;
    avg_price: number;
  }>;
  price_ranges: Array<{
    range: string;
    product_count: number;
    total_sales: number;
    avg_price: number;
  }>;
  most_demanded: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    brand: string;
    quantity: number;
    revenue: number;
    avg_price: number;
  }>;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
