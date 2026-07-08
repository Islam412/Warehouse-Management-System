'use client';

import { Heart } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background py-4 text-center text-sm text-muted-foreground">
      <div className="container mx-auto flex items-center justify-center gap-1">
        <span>© {year} DUKA</span>
        <span>•</span>
        <span>نظام إدارة المتاجر المتكامل</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          صنع بـ
          <Heart className="h-3 w-3 text-red-500" />
        </span>
      </div>
    </footer>
  );
}
