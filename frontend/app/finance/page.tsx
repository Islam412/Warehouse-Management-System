// frontend/app/finance/page.tsx
'use client';

import { useState } from 'react';
import { useAccounts, useExpenses, useIncomes, useDailyClosing } from '@/hooks/useFinance';
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
import { Search, Eye, Loader2, RefreshCw, Printer, DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function FinancePage() {
  const [search, setSearch] = useState('');
  const { data: accountsData, isLoading, error, refetch } = useAccounts({ search });
  const { data: expensesData } = useExpenses();
  const { data: incomesData } = useIncomes();

  const accounts = Array.isArray(accountsData) ? accountsData : 
                    accountsData?.results ? accountsData.results : [];

  const totalExpenses = Array.isArray(expensesData) 
    ? expensesData.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) 
    : 0;
    
  const totalIncomes = Array.isArray(incomesData) 
    ? incomesData.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0) 
    : 0;

  const netProfit = totalIncomes - totalExpenses;

  const handleRefresh = async () => {
    await refetch();
    toast.info('تم تحديث البيانات');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600">حدث خطأ في تحميل الحسابات</h3>
        <Button onClick={handleRefresh} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">المالية</h1>
          <p className="text-gray-500 text-sm">إدارة الحسابات المالية</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
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
            <p className="text-2xl font-bold text-green-600 mt-2">{totalIncomes.toFixed(2)} ج.م</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500">إجمالي المصروفات</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">{totalExpenses.toFixed(2)} ج.م</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500">صافي الربح</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-2">{netProfit.toFixed(2)} ج.م</p>
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
                accounts.map((account: any) => (
                  <TableRow key={account.id} className="border-b">
                    <TableCell className="font-medium">{account.code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>
                      <Badge variant={account.account_type === 'asset' ? 'default' : 'secondary'}>
                        {account.account_type_display}
                      </Badge>
                    </TableCell>
                    <TableCell className={parseFloat(account.balance) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {parseFloat(account.balance).toFixed(2)} ج.م
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