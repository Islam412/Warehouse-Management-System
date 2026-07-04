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
