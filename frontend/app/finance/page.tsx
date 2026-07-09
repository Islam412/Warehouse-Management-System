'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Loader2, RefreshCw, Printer, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function FinancePage() {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const accounts = [
    { id: 1, code: '1000', name: 'النقدية', type: 'asset', balance: 50000 },
    { id: 2, code: '1010', name: 'الصندوق', type: 'asset', balance: 15000 },
    { id: 3, code: '2000', name: 'الموردين', type: 'liability', balance: 20000 },
  ];

  const totalIncome = 100000;
  const totalExpenses = 40600;
  const netProfit = totalIncome - totalExpenses;

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.info('تم تحديث البيانات');
    }, 1000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">المالية</h1>
          <p className="text-gray-500 text-sm">إدارة الحسابات المالية</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">إجمالي الإيرادات</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">{totalIncome.toLocaleString()} ج.م</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500">إجمالي المصروفات</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">{totalExpenses.toLocaleString()} ج.م</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500">صافي الربح</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-2">{netProfit.toLocaleString()} ج.م</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="بحث عن حساب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-sm text-gray-500">{accounts.length} حساب</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الحسابات</CardTitle>
          <CardDescription>عرض جميع الحسابات المالية</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>اسم الحساب</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    لا توجد حسابات
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id} className="border-b">
                    <TableCell className="font-medium">{account.code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>
                      <Badge variant={account.type === 'asset' ? 'default' : 'secondary'}>
                        {account.type === 'asset' ? 'أصل' : 'خصم'}
                      </Badge>
                    </TableCell>
                    <TableCell className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {account.balance.toLocaleString()} ج.م
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-blue-500" title="عرض التفاصيل">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
