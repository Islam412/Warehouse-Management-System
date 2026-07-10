// frontend/components/dashboard/StatsCard.tsx
'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  change?: number;
  changeLabel?: string;
  currency?: boolean;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  change,
  changeLabel,
  currency = false,
  loading = false,
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  if (loading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
      </div>
    );
  }

  const displayValue = typeof value === 'number' ? (
    currency ? (
      <CountUp end={value} prefix="ج.م " decimals={0} separator="," duration={1.5} />
    ) : (
      <CountUp end={value} separator="," duration={1.5} />
    )
  ) : (
    value
  );

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-all border border-border p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground mt-1 truncate">
            {displayValue}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : isNegative ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : null}
              <span
                className={`text-xs font-medium ${
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' : ''
                } ${isNegative ? 'text-red-600 dark:text-red-400' : ''} ${
                  change === 0 ? 'text-muted-foreground' : ''
                }`}
              >
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-muted-foreground">
                {changeLabel || 'من الشهر الماضي'}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}