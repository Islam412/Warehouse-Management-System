'use client';

import { useState, useEffect } from 'react';
import { 
  useSalesReport, 
  usePurchasesReport, 
  useInventoryReport,
  useCustomersReport,
  useSuppliersReport
} from '@/hooks/useReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  Truck, 
  DollarSign, 
  Loader2,
  FileText,
  Printer,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  ShoppingCart,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  Wallet,
  CreditCard,
  Coins,
  LineChart,
  CircleDollarSign,
  Award,  // ✅ تمت الإضافة
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<string>('inventory');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const salesReport = useSalesReport();
  const purchasesReport = usePurchasesReport();
  const inventoryReport = useInventoryReport();
  const customersReport = useCustomersReport();
  const suppliersReport = useSuppliersReport();

  // تشغيل التقرير الافتراضي عند تحميل الصفحة
  useEffect(() => {
    generateReport('inventory');
  }, []);

  const generateReport = async (type: string) => {
    setLoading(true);
    setReportData(null);
    setShowDetails(true);
    
    try {
      let data;
      const filters = {
        date_from: '2026-01-01',
        date_to: new Date().toISOString().split('T')[0]
      };
      
      switch (type) {
        case 'sales':
          data = await salesReport.mutateAsync(filters);
          break;
        case 'purchases':
          data = await purchasesReport.mutateAsync(filters);
          break;
        case 'inventory':
          data = await inventoryReport.mutateAsync({});
          break;
        case 'customers':
          data = await customersReport.mutateAsync({});
          break;
        case 'suppliers':
          data = await suppliersReport.mutateAsync({});
          break;
        default:
          data = null;
      }
      
      console.log('📊 بيانات التقرير:', data);
      setReportData(data);
      toast.success('✅ تم إنشاء التقرير بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء التقرير:', error);
      toast.error('حدث خطأ في إنشاء التقرير');
    } finally {
      setLoading(false);
    }
  };

  const reportButtons = [
    { id: 'inventory', label: 'المخزون', icon: Package, color: 'bg-amber-500' },
    { id: 'purchases', label: 'المشتريات', icon: TrendingDown, color: 'bg-green-500' },
    { id: 'sales', label: 'المبيعات', icon: TrendingUp, color: 'bg-blue-500' },
    { id: 'customers', label: 'العملاء', icon: Users, color: 'bg-purple-500' },
    { id: 'suppliers', label: 'الموردين', icon: Truck, color: 'bg-indigo-500' },
  ];

  // ============================================
  // عرض تفاصيل المخزون
  // ============================================
  const renderInventoryDetails = () => {
    if (!reportData) return null;
    
    const { stock_details, low_stock, category_distribution, brand_distribution } = reportData;
    
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </Button>

        {showDetails && (
          <>
            {/* المنتجات منخفضة المخزون */}
            {low_stock && low_stock.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    ⚠️ المنتجات منخفضة المخزون
                  </CardTitle>
                  <CardDescription>المنتجات التي وصلت للحد الأدنى أو أقل</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الرمز</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-center">الحد الأدنى</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {low_stock.map((item: any, index: number) => (
                        <TableRow key={`low-stock-${index}-${item.product__id || ''}`} className="bg-red-50 dark:bg-red-950/20">
                          <TableCell className="font-medium">{item.product__name}</TableCell>
                          <TableCell>{item.product__sku}</TableCell>
                          <TableCell className="text-center font-bold text-red-600">{item.quantity}</TableCell>
                          <TableCell className="text-center">{item.min_quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* قائمة المنتجات */}
            {stock_details && stock_details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    قائمة المنتجات
                  </CardTitle>
                  <CardDescription>عرض جميع المنتجات في المخزون</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المنتج</TableHead>
                          <TableHead>الرمز</TableHead>
                          <TableHead>الفئة</TableHead>
                          <TableHead className="text-center">الكمية</TableHead>
                          <TableHead className="text-center">سعر الشراء</TableHead>
                          <TableHead className="text-center">سعر البيع</TableHead>
                          <TableHead className="text-center">القيمة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stock_details.slice(0, 20).map((item: any, index: number) => (
                          <TableRow key={`stock-${index}-${item.product_id || ''}`}>
                            <TableCell className="font-medium">{item.product_name}</TableCell>
                            <TableCell>{item.product_sku}</TableCell>
                            <TableCell>{item.category || '-'}</TableCell>
                            <TableCell className="text-center font-bold">{item.quantity}</TableCell>
                            <TableCell className="text-center">{item.purchase_price} ج.م</TableCell>
                            <TableCell className="text-center text-green-600">{item.selling_price} ج.م</TableCell>
                            <TableCell className="text-center font-bold text-blue-600">{item.total_value.toFixed(2)} ج.م</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {stock_details.length > 20 && (
                    <p className="text-sm text-gray-400 mt-2 text-center">... وعرض {stock_details.length - 20} منتج آخر</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* توزيع حسب الفئة */}
            {category_distribution && category_distribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    توزيع المخزون حسب الفئة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الفئة</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-center">القيمة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category_distribution.map((item: any, index: number) => (
                        <TableRow key={`category-${index}`}>
                          <TableCell className="font-medium">{item.product__category__name || 'غير مصنف'}</TableCell>
                          <TableCell className="text-center">{item.total_quantity}</TableCell>
                          <TableCell className="text-center font-bold">{item.total_value.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* توزيع حسب العلامة التجارية */}
            {brand_distribution && brand_distribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    توزيع المخزون حسب العلامة التجارية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العلامة التجارية</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-center">القيمة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brand_distribution.map((item: any, index: number) => (
                        <TableRow key={`brand-${index}`}>
                          <TableCell className="font-medium">{item.product__brand__name || 'غير مصنف'}</TableCell>
                          <TableCell className="text-center">{item.total_quantity}</TableCell>
                          <TableCell className="text-center font-bold">{item.total_value.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  // ============================================
  // عرض تفاصيل المشتريات
  // ============================================
  const renderPurchasesDetails = () => {
    if (!reportData) return null;
    
    const { order_details, item_details, supplier_purchases, product_purchases, monthly_purchases } = reportData;
    
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </Button>

        {showDetails && (
          <>
            {/* أوامر الشراء */}
            {order_details && order_details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    أوامر الشراء
                  </CardTitle>
                  <CardDescription>عرض جميع أوامر الشراء</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الأمر</TableHead>
                        <TableHead>المورد</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="text-center">الحالة</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order_details.map((order: any, index: number) => (
                        <TableRow key={order.id || `order-${index}`}>
                          <TableCell className="font-medium">{order.order_number || 'غير محدد'}</TableCell>
                          <TableCell>{order.supplier}</TableCell>
                          <TableCell>{new Date(order.order_date).toLocaleDateString('ar-EG')}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={
                              order.status === 'received' ? 'bg-green-500' :
                              order.status === 'ordered' ? 'bg-blue-500' :
                              order.status === 'cancelled' ? 'bg-red-500' :
                              'bg-gray-500'
                            }>
                              {order.status_display}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-bold">{order.total.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* بنود المشتريات */}
            {item_details && item_details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    بنود المشتريات
                  </CardTitle>
                  <CardDescription>عرض تفاصيل المنتجات المشتراة</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الرمز</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-center">السعر</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                        <TableHead className="text-center">المستلم</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item_details.slice(0, 20).map((item: any, index: number) => (
                        <TableRow key={`purchase-item-${index}`}>
                          <TableCell className="font-medium">{item.product}</TableCell>
                          <TableCell>{item.product_sku}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-center">{item.unit_price} ج.م</TableCell>
                          <TableCell className="text-center font-bold">{item.total.toFixed(2)} ج.م</TableCell>
                          <TableCell className="text-center">{item.received_quantity || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* المشتريات حسب المورد */}
            {supplier_purchases && supplier_purchases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    المشتريات حسب المورد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المورد</TableHead>
                        <TableHead className="text-center">عدد الطلبات</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplier_purchases.map((item: any, index: number) => (
                        <TableRow key={item.supplier__id || `supplier-purchase-${index}`}>
                          <TableCell className="font-medium">{item.supplier__name}</TableCell>
                          <TableCell className="text-center">{item.count}</TableCell>
                          <TableCell className="text-center font-bold">{item.total.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* المشتريات حسب المنتج */}
            {product_purchases && product_purchases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    المشتريات حسب المنتج
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product_purchases.map((item: any, index: number) => (
                        <TableRow key={item.product__id || `product-purchase-${index}`}>
                          <TableCell className="font-medium">{item.product__name}</TableCell>
                          <TableCell className="text-center">{item.total_quantity}</TableCell>
                          <TableCell className="text-center font-bold">{item.total_amount.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* المشتريات حسب الشهر */}
            {monthly_purchases && monthly_purchases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    المشتريات حسب الشهر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الشهر</TableHead>
                        <TableHead className="text-center">عدد الطلبات</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthly_purchases.map((item: any, index: number) => (
                        <TableRow key={item.month || `month-${index}`}>
                          <TableCell className="font-medium">{item.month}</TableCell>
                          <TableCell className="text-center">{item.count}</TableCell>
                          <TableCell className="text-center font-bold">{item.total.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  // ============================================
  // عرض تفاصيل المبيعات
  // ============================================
  const renderSalesDetails = () => {
    if (!reportData) return null;
    
    const { invoice_details, item_details, customer_sales, product_sales, daily_sales, monthly_sales } = reportData;
    
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </Button>

        {showDetails && (
          <>
            {/* الفواتير */}
            {invoice_details && invoice_details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    الفواتير
                  </CardTitle>
                  <CardDescription>عرض جميع فواتير المبيعات</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الفاتورة</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="text-center">الحالة</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                        <TableHead className="text-center">المدفوع</TableHead>
                        <TableHead className="text-center">المتبقي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice_details.slice(0, 20).map((invoice: any, index: number) => (
                        <TableRow key={invoice.id || `invoice-${index}`}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.customer}</TableCell>
                          <TableCell>{new Date(invoice.date).toLocaleDateString('ar-EG')}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={
                              invoice.status === 'paid' ? 'bg-green-500' :
                              invoice.status === 'confirmed' ? 'bg-blue-500' :
                              invoice.status === 'partially_paid' ? 'bg-yellow-500' :
                              invoice.status === 'cancelled' ? 'bg-red-500' :
                              'bg-gray-500'
                            }>
                              {invoice.status_display}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-bold">{invoice.total.toFixed(2)} ج.م</TableCell>
                          <TableCell className="text-center text-green-600">{invoice.paid_amount.toFixed(2)} ج.م</TableCell>
                          <TableCell className="text-center text-red-600">{invoice.remaining.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* بنود الفواتير */}
            {item_details && item_details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    بنود الفواتير
                  </CardTitle>
                  <CardDescription>عرض تفاصيل المنتجات المباعة</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الرمز</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-center">السعر</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item_details.slice(0, 20).map((item: any, index: number) => (
                        <TableRow key={`sale-item-${index}`}>
                          <TableCell className="font-medium">{item.product}</TableCell>
                          <TableCell>{item.product_sku}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-center">{item.unit_price} ج.م</TableCell>
                          <TableCell className="text-center font-bold">{item.total.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* المبيعات حسب العميل */}
            {customer_sales && customer_sales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    المبيعات حسب العميل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العميل</TableHead>
                        <TableHead className="text-center">عدد الفواتير</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer_sales.map((item: any, index: number) => (
                        <TableRow key={item.customer__id || `customer-sale-${index}`}>
                          <TableCell className="font-medium">{item.customer__name}</TableCell>
                          <TableCell className="text-center">{item.count}</TableCell>
                          <TableCell className="text-center font-bold">{item.total.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* المبيعات حسب المنتج */}
            {product_sales && product_sales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    المبيعات حسب المنتج
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product_sales.map((item: any, index: number) => (
                        <TableRow key={item.product__id || `product-sale-${index}`}>
                          <TableCell className="font-medium">{item.product__name}</TableCell>
                          <TableCell className="text-center">{item.total_quantity}</TableCell>
                          <TableCell className="text-center font-bold">{item.total_amount.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* المبيعات اليومية */}
            {daily_sales && daily_sales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    المبيعات اليومية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="text-center">عدد الفواتير</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {daily_sales.map((item: any, index: number) => (
                        <TableRow key={item.date || `daily-${index}`}>
                          <TableCell className="font-medium">{new Date(item.date).toLocaleDateString('ar-EG')}</TableCell>
                          <TableCell className="text-center">{item.count}</TableCell>
                          <TableCell className="text-center font-bold">{item.total.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* المبيعات حسب الشهر */}
            {monthly_sales && monthly_sales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    المبيعات حسب الشهر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الشهر</TableHead>
                        <TableHead className="text-center">عدد الفواتير</TableHead>
                        <TableHead className="text-center">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthly_sales.map((item: any, index: number) => (
                        <TableRow key={item.month || `monthly-${index}`}>
                          <TableCell className="font-medium">{item.month}</TableCell>
                          <TableCell className="text-center">{item.count}</TableCell>
                          <TableCell className="text-center font-bold">{item.total.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  // ============================================
  // عرض تفاصيل العملاء
  // ============================================
  const renderCustomersDetails = () => {
    if (!reportData) return null;
    
    const { customer_details, top_customers } = reportData;
    
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </Button>

        {showDetails && (
          <>
            {/* قائمة العملاء */}
            {customer_details && customer_details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    قائمة العملاء
                  </CardTitle>
                  <CardDescription>عرض جميع العملاء المسجلين</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>الهاتف</TableHead>
                        <TableHead>البريد</TableHead>
                        <TableHead className="text-center">المشتريات</TableHead>
                        <TableHead className="text-center">الفواتير</TableHead>
                        <TableHead className="text-center">المستحق</TableHead>
                        <TableHead className="text-center">مميز</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer_details.slice(0, 20).map((customer: any, index: number) => (
                        <TableRow key={customer.id || `customer-${index}`}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.email || '-'}</TableCell>
                          <TableCell className="text-center">{customer.total_purchases.toFixed(2)} ج.م</TableCell>
                          <TableCell className="text-center">{customer.total_invoices}</TableCell>
                          <TableCell className="text-center text-red-600">{customer.outstanding_balance.toFixed(2)} ج.م</TableCell>
                          <TableCell className="text-center">
                            {customer.is_vip ? (
                              <Star className="w-5 h-5 text-yellow-500 inline" />
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* أفضل العملاء */}
            {top_customers && top_customers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    أفضل العملاء
                  </CardTitle>
                  <CardDescription>العملاء الأكثر إنفاقاً</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead className="text-center">إجمالي المشتريات</TableHead>
                        <TableHead className="text-center">عدد الفواتير</TableHead>
                        <TableHead className="text-center">المستحق</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {top_customers.map((customer: any, index: number) => (
                        <TableRow key={customer.id || `top-customer-${index}`}>
                          <TableCell className="text-center font-bold">{index + 1}</TableCell>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell className="text-center font-bold text-green-600">{customer.total_spent.toFixed(2)} ج.م</TableCell>
                          <TableCell className="text-center">{customer.total_invoices}</TableCell>
                          <TableCell className="text-center text-red-600">{customer.outstanding_balance.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  // ============================================
  // عرض تفاصيل الموردين
  // ============================================
  const renderSuppliersDetails = () => {
    if (!reportData) return null;
    
    const { supplier_details, top_suppliers } = reportData;
    
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </Button>

        {showDetails && (
          <>
            {/* قائمة الموردين */}
            {supplier_details && supplier_details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    قائمة الموردين
                  </CardTitle>
                  <CardDescription>عرض جميع الموردين المسجلين</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>الهاتف</TableHead>
                        <TableHead>البريد</TableHead>
                        <TableHead className="text-center">المشتريات</TableHead>
                        <TableHead className="text-center">الطلبات</TableHead>
                        <TableHead className="text-center">الرصيد</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplier_details.slice(0, 20).map((supplier: any, index: number) => (
                        <TableRow key={supplier.id || `supplier-${index}`}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.phone}</TableCell>
                          <TableCell>{supplier.email || '-'}</TableCell>
                          <TableCell className="text-center">{supplier.total_purchases.toFixed(2)} ج.م</TableCell>
                          <TableCell className="text-center">{supplier.order_count}</TableCell>
                          <TableCell className="text-center text-green-600">{supplier.balance.toFixed(2)} ج.م</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* أفضل الموردين */}
            {top_suppliers && top_suppliers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    أفضل الموردين
                  </CardTitle>
                  <CardDescription>الموردين الأكثر تعاملاً</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>المورد</TableHead>
                        <TableHead className="text-center">إجمالي المشتريات</TableHead>
                        <TableHead className="text-center">عدد الطلبات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {top_suppliers.map((supplier: any, index: number) => (
                        <TableRow key={supplier.id || `top-supplier-${index}`}>
                          <TableCell className="text-center font-bold">{index + 1}</TableCell>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell className="text-center font-bold text-blue-600">{supplier.total_purchases.toFixed(2)} ج.م</TableCell>
                          <TableCell className="text-center">{supplier.order_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  // ============================================
  // عرض محتوى التقرير حسب النوع
  // ============================================
  const renderReportContent = () => {
    if (!reportData) {
      return (
        <div className="text-center py-16 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">اختر تقريراً من الأعلى</p>
          <p className="text-sm">اضغط على أحد الأزرار لعرض التقرير</p>
        </div>
      );
    }

    const summary = reportData.summary || {};

    return (
      <div className="space-y-6">
        {/* الملخص */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(summary).map(([key, value]: [string, any], index: number) => (
            <Card key={`summary-${index}`}>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500">{key.replace(/_/g, ' ')}</p>
                <p className="text-xl font-bold">{typeof value === 'number' ? value.toFixed(2) : value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التفاصيل حسب نوع التقرير */}
        {activeReport === 'inventory' && renderInventoryDetails()}
        {activeReport === 'purchases' && renderPurchasesDetails()}
        {activeReport === 'sales' && renderSalesDetails()}
        {activeReport === 'customers' && renderCustomersDetails()}
        {activeReport === 'suppliers' && renderSuppliersDetails()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            التقارير
          </h1>
          <p className="text-gray-500 text-sm">إنشاء وعرض التقارير المختلفة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* أزرار التقارير */}
      <div className="flex flex-wrap gap-3">
        {reportButtons.map((report) => {
          const Icon = report.icon;
          const isActive = activeReport === report.id;
          const isLoading = loading && isActive;
          
          return (
            <Button
              key={report.id}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => {
                setActiveReport(report.id);
                generateReport(report.id);
              }}
              className="gap-2 min-w-[120px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {report.label}
            </Button>
          );
        })}
      </div>

      {/* محتوى التقرير */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="mr-3 text-gray-500">جاري إنشاء التقرير...</span>
            </div>
          ) : (
            renderReportContent()
          )}
        </CardContent>
      </Card>
    </div>
  );
}