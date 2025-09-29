import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Activity, Clock, Zap } from 'lucide-react';

function resolveHealth(availability) {
  if (availability >= 99) return { status: 'Excelente', color: 'bg-green-500' };
  if (availability >= 95) return { status: 'Bom', color: 'bg-yellow-500' };
  return { status: 'Atenção', color: 'bg-red-500' };
}

export default function SystemHealth({ availability = 99.9, responseTime = 245, throughput = 156 }) {
  const health = resolveHealth(availability);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-700 text-lg">Performance do Sistema</CardTitle>
            <Badge variant="secondary" className={`${health.color} text-white border-0`}>
              {health.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-slate-600">Disponibilidade</span>
              </div>
              <span className="font-semibold text-slate-800">{availability}%</span>
            </div>
            <Progress value={availability} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Tempo Resposta</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{responseTime}ms</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Throughput</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{throughput}/min</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
