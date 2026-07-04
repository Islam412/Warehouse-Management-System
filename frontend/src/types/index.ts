// ============================================
// Auth Types
// ============================================
export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
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
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  name_ar?: string;
  logo?: string;
  description?: string;
  is_active: boolean;
  products_count: number;
  created_at: string;
  updated_at: string;
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
  category_name: string;
  brand: string;
  brand_name: string;
  unit: string;
  unit_name: string;
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
  created_by?: string;
}

// ============================================
// Customer Types
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
  credit_limit: number;
  outstanding_balance: number;
  total_invoices: number;
  total_purchases: number;
  total_paid: number;
  tax_number?: string;
  notes?: string;
  is_active: boolean;
  is_vip: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Supplier Types
// ============================================
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
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Invoice Types
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
  customer_phone?: string;
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
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardSummary {
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
  charts: {
    daily_sales: Array<{ date: string; sales: number }>;
    sales_by_category: Array<{ category__name: string; total: number }>;
    sales_by_brand: Array<{ brand__name: string; total: number }>;
  };
  last_updated: string;
}

// ============================================
// Pagination
// ============================================
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================
// API Response
// ============================================
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// Store Settings Types
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
  address?: string;
  address_ar?: string;
  city?: string;
  city_ar?: string;
  state?: string;
  state_ar?: string;
  country?: string;
  country_ar?: string;
  postal_code?: string;
  tax_number?: string;
  commercial_register?: string;
  license_number?: string;
  is_active: boolean;
  social_links: SocialLink[];
  branches: Branch[];
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
  opening_time?: string;
  closing_time?: string;
  is_24_hours: boolean;
  is_active: boolean;
  is_main: boolean;
  manager?: string;
  manager_name?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  platform_ar?: string;
  icon?: string;
  url: string;
  is_active: boolean;
  order: number;
}

export interface StoreSettings {
  id: string;
  company: string;
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
  default_language: 'ar' | 'en';
  rtl_layout: boolean;
}