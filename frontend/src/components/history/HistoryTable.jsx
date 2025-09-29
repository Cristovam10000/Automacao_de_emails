import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Eye, FileText, Type } from 'lucide-react';

function formatDate(value) {
  try {
    return {
      date: format(new Date(value), 'dd/MM/yyyy', { locale: ptBR }),
      time: format(new Date(value), 'HH:mm:ss'),
    };
  } catch (error) {
    return { date: '—', time: '' };
  }
}

export default function HistoryTable({ emails = [], isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando histórico...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-600" /> Histórico de Classificações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email) => {
                const { date, time } = formatDate(email.created_date);
                const isProdutivo = email.classification === 'produtivo';
                const confidence = Math.round(Number(email.confidence_score ?? 0) * 100);

                return (
                  <TableRow key={email.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{date}</div>
                        <div className="text-slate-500">{time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {email.file_name ? (
                          <>
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{email.file_name}</span>
                          </>
                        ) : (
                          <>
                            <Type className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-slate-500">Texto direto</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          isProdutivo
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                        }
                      >
                        {isProdutivo ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {isProdutivo ? 'Produtivo' : 'Improdutivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{confidence}%</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">{email.processing_time}ms</div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" /> Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Classificação</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-slate-600">Conteúdo Original</label>
                              <div className="mt-1 p-3 bg-slate-50 rounded-lg text-sm max-h-32 overflow-y-auto">
                                {email.content}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">Resposta Sugerida</label>
                              <div className="mt-1 p-3 bg-blue-50 rounded-lg text-sm">
                                {email.suggested_response}
                              </div>
                            </div>
                            {Array.isArray(email.keywords_extracted) && email.keywords_extracted.length > 0 ? (
                              <div>
                                <label className="text-sm font-medium text-slate-600">Palavras-chave</label>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {email.keywords_extracted.map((keyword, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
