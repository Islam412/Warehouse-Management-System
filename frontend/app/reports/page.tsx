'use client';

import { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<string>('sales');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const salesReport = useSalesReport();
  const purchasesReport = usePurchasesReport();
  const inventoryReport = useInventoryReport();
  const customersReport = useCustomersReport();
  const suppliersReport = useSuppliersReport();

  const generateReport = async (type: string) => {
    setLoading(true);
    setReportData(null);
    
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
      
      setReportData(data);
      toast.success('✅ تم إنشاء التقرير بنجاح');
    } catch (error) {
      console.error('❌ Error generating report:', error);
      toast.error('حدث خطأ في إنشاء التقرير');
    } finally {
      setLoading(false);
    }
  };

  const reportButtons = [
    { id: 'sales', label: 'المبيعات', icon: TrendingUp, color: 'bg-blue-500' },
    { id: 'purchases', label: 'المشتريات', icon: TrendingDown, color: 'bg-green-500' },
    { id: 'inventory', label: 'المخزون', icon: Package, color: 'bg-amber-500' },
    { id: 'customers', label: 'العملاء', icon: Users, color: 'bg-purple-500' },
    { id: 'suppliers', label: 'الموردين', icon: Truck, color: 'bg-indigo-500' },
  ];

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
    const customerSales = reportData.customer_sales || [];
    const productSales = reportData.product_sales || [];
    const topCustomers = reportData.top_customers || [];
    const topSuppliers = reportData.top_suppliers || [];
    const lowStock = reportData.low_stock || [];

    return (
      <div className="space-y-6">
        {/* الملخص */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(summary).map(([key, value]: [string, any]) => (
            <Card key={key}>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500">{key.replace(/_/g, ' ')}</p>
                <p className="text-xl font-bold">{typeof value === 'number' ? value.toFixed(2) : value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* العملاء */}
        {customerSales.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المبيعات حسب العميل</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>عدد الفواتير</TableHead>
                    <TableHead className="text-left">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerSales.map((item: any) => (
                    <TableRow key={item.customer__id}>
                      <TableCell>{item.customer__name}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell className="font-bold">{item.total.toFixed(2)} ج.م</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* المنتجات */}
        {productSales.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المبيعات حسب المنتج</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead className="text-left">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productSales.map((item: any) => (
                    <TableRow key={item.product__id}>
                      <TableCell>{item.product__name}</TableCell>
                      <TableCell>{item.total_quantity}</TableCell>
                      <TableCell className="font-bold">{item.total_amount.toFixed(2)} ج.م</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* أفضل العملاء */}
        {topCustomers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">أفضل العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead className="text-left">إجمالي المشتريات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.phone}</TableCell>
                      <TableCell className="font-bold">{item.total_spent.toFixed(2)} ج.م</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* أفضل الموردين */}
        {topSuppliers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">أفضل الموردين</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المورد</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead className="text-left">إجمالي المشتريات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSuppliers.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.phone}</TableCell>
                      <TableCell className="font-bold">{item.total_purchases.toFixed(2)} ج.م</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* المخزون المنخفض */}
        {lowStock.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">⚠️ المخزون المنخفض</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-left">الكمية</TableHead>
                    <TableHead className="text-left">الحد الأدنى</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((item: any) => (
                    <TableRow key={item.product__id} className="bg-red-50">
                      <TableCell>{item.product__name}</TableCell>
                      <TableCell>{item.product__sku}</TableCell>
                      <TableCell className="font-bold text-red-600">{item.quantity}</TableCell>
                      <TableCell>{item.min_quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
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