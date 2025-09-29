import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Target, Clock, MessageSquare, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

export default function ClassificationResult({ result, onReset }) {
  const isProdutivo = result?.classification === 'produtivo';
  const confidencePercentage = Math.round((Number(result?.confidence_score) || 0) * 100);

  const copyToClipboard = (text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text ?? '');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60 overflow-hidden">
        <CardHeader className={isProdutivo ? 'pb-4 bg-green-50' : 'pb-4 bg-orange-50'}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              {isProdutivo ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-orange-600" />
              )}
              Email {isProdutivo ? 'Produtivo' : 'Improdutivo'}
            </CardTitle>
            <Badge className={isProdutivo ? 'bg-green-600 text-white border-0' : 'bg-orange-600 text-white border-0'}>
              {isProdutivo ? 'Requer Ação' : 'Informativo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Target className="w-4 h-4" />
                <span>Nível de Confiança</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{confidencePercentage}%</span>
                  <span className="text-slate-500">
                    {confidencePercentage >= 90
                      ? 'Muito Alto'
                      : confidencePercentage >= 75
                      ? 'Alto'
                      : confidencePercentage >= 60
                      ? 'Médio'
                      : 'Baixo'}
                  </span>
                </div>
                <Progress value={confidencePercentage} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>Tempo de Processamento</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{result?.processing_time ?? 0}ms</div>
              <div className="text-sm text-slate-500">Processado instantaneamente</div>
            </div>
          </div>

          {Array.isArray(result?.keywords_extracted) && result.keywords_extracted.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-700">Palavras-chave Identificadas</h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords_extracted.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="bg-slate-50 text-slate-700">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Resposta Automática Sugerida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={result?.suggested_response ?? ''}
            readOnly
            className="min-h-[120px] bg-slate-50 border-slate-200 text-slate-700 resize-none"
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(result?.suggested_response ?? '')}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copiar Resposta
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onReset} variant="outline" className="px-8 py-2 bg-white hover:bg-slate-50">
          Processar Novo Email
        </Button>
      </div>
    </motion.div>
  );
}
