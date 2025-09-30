import React, { useEffect, useState } from 'react';
import { EmailClassification } from '@/entities/EmailClassification';
import { Mail, CheckCircle2, XCircle, Target, Clock, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@/components/dashboard/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    produtivos: 0,
    improdutivos: 0,
    avgConfidence: 0,
    avgProcessingTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setIsLoading(true);
      try {
        const emails = await EmailClassification.list('-created_date');
        if (!isMounted) return;

        const produtivos = emails.filter((email) => email.classification === 'produtivo').length;
        const improdutivos = emails.filter((email) => email.classification === 'improdutivo').length;
        const avgConfidence = emails.length
          ? (emails.reduce((sum, email) => sum + (Number(email.confidence_score) || 0), 0) / emails.length) * 100
          : 0;
        const avgProcessingTime = emails.length
          ? emails.reduce((sum, email) => sum + (Number(email.processing_time) || 0), 0) / emails.length
          : 0;

        setStats({
          total: emails.length,
          produtivos,
          improdutivos,
          avgConfidence,
          avgProcessingTime,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const produtividade = stats.total ? ((stats.produtivos / stats.total) * 100).toFixed(1) : '0.0';
  const improdutividade = stats.total ? (100 - Number(produtividade)).toFixed(1) : '0.0';

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Dashboard de Classificação
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Tempo Real
            </div>
          </div>
          <p className="text-slate-600">Monitoramento em tempo real do sistema de classificação inteligente de emails</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Emails Processados"
            value={isLoading ? '...' : stats.total}
            icon={Mail}
            color="slate"
            trend={`${stats.total} total processados`}
            delay={0}
          />
          <StatCard
            title="Produtivos"
            value={isLoading ? '...' : stats.produtivos}
            icon={CheckCircle2}
            color="green"
            trend={`${produtividade}% do total`}
            delay={0.1}
          />
          <StatCard
            title="Improdutivos"
            value={isLoading ? '...' : stats.improdutivos}
            icon={XCircle}
            color="red"
            trend={`${improdutividade}% do total`}
            delay={0.2}
          />

          <StatCard
            title="Taxa de Produtividade"
            value={isLoading ? '...' : `${produtividade}%`}
            icon={TrendingUp}
            color="blue"
            trend="Emails produtivos/total"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Confiança Média"
            value={isLoading ? '...' : `${stats.avgConfidence.toFixed(1)}%`}
            icon={Target}
            color="purple"
            trend="Precisão do sistema"
            delay={0.3}
          />

          <StatCard
            title="Tempo Médio"
            value={isLoading ? '...' : `${stats.avgProcessingTime.toFixed(0)}ms`}
            icon={Clock}
            color="slate"
            trend="Tempo de processamento"
            delay={0.5}
          />
          <StatCard
            title="Eficiência"
            value={isLoading ? '...' : `${Math.min(stats.avgConfidence * 1.2, 100).toFixed(1)}%`}
            icon={Activity}
            color="green"
            trend="Performance geral"
            delay={0.6}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-white/90 border border-slate-200/60 rounded-3xl p-8 shadow-lg h-full">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-green-100 text-green-600 rounded-2xl">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800">Produtivo</h2>
                  <p className="mt-2 text-slate-600">Emails que requerem uma ação ou resposta específica.</p>
                  <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                    Exemplos: solicitações de suporte técnico, atualizações sobre casos em aberto e dúvidas sobre o sistema.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-white/90 border border-slate-200/60 rounded-3xl p-8 shadow-lg h-full">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-red-100 text-red-600 rounded-2xl">
                  <XCircle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800">Improdutivo</h2>
                  <p className="mt-2 text-slate-600">Emails que não exigem uma ação imediata.</p>
                  <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                    Exemplos: mensagens de felicitações, comunicados informativos ou agradecimentos ocasionais.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
