'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Printer, RefreshCw, TrendingUp, TrendingDown, Package, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const reports = [
    { id: 1, title: 'تقرير المبيعات', icon: TrendingUp, color: 'text-blue-500' },
    { id: 2, title: 'تقرير المشتريات', icon: Package, color: 'text-green-500' },
    { id: 3, title: 'تقرير المخزون', icon: Package, color: 'text-yellow-500' },
    { id: 4, title: 'تقرير الأرباح والخسائر', icon: TrendingDown, color: 'text-red-500' },
    { id: 5, title: 'تقرير العملاء', icon: Users, color: 'text-purple-500' },
    { id: 6, title: 'تقرير الموردين', icon: Users, color: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            التقارير
          </h1>
          <p className="text-gray-500 text-sm">جميع التقارير المتاحة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('جاري تحميل التقارير...')} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${report.color}`} />
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-gray-500">عرض التقرير الكامل</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-blue-500">
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Printer className="w-3 h-3" />
                    طباعة
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Download className="w-3 h-3" />
                    تحميل
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
