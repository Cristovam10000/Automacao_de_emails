import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

const colorClasses = {
  slate: {
    icon: 'text-slate-600',
    bg: 'bg-slate-100',
    value: 'text-slate-800',
    trend: 'text-slate-500',
  },
  green: {
    icon: 'text-green-600',
    bg: 'bg-green-100',
    value: 'text-green-700',
    trend: 'text-green-500',
  },
  red: {
    icon: 'text-red-600',
    bg: 'bg-red-100',
    value: 'text-red-700',
    trend: 'text-red-500',
  },
  blue: {
    icon: 'text-blue-600',
    bg: 'bg-blue-100',
    value: 'text-blue-700',
    trend: 'text-blue-500',
  },
  purple: {
    icon: 'text-purple-600',
    bg: 'bg-purple-100',
    value: 'text-purple-700',
    trend: 'text-purple-500',
  },
};

export default function StatCard({ title, value, icon: Icon, color = 'slate', trend, delay = 0 }) {
  const palette = colorClasses[color] ?? colorClasses.slate;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
              <div className={cn('text-3xl font-bold mb-1', palette.value)}>{value}</div>
              {trend ? <p className={cn('text-sm', palette.trend)}>{trend}</p> : null}
            </div>
            <div className={cn('p-3 rounded-xl', palette.bg)}>
              {Icon ? <Icon className={cn('h-6 w-6', palette.icon)} /> : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
