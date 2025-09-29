import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, Download, Trash2, History as HistoryIcon } from 'lucide-react';
import { EmailClassification } from '@/entities/EmailClassification';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import HistoryTable from '@/components/history/HistoryTable';

export default function History() {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const loadEmails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await EmailClassification.list('-created_date');
      setEmails(data);
    } catch (error) {
      console.error('Erro ao carregar historico:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let result = emails;

    if (filter !== 'todos') {
      result = result.filter((email) => email.classification === filter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (email) =>
          email.content.toLowerCase().includes(term) ||
          (email.file_name && email.file_name.toLowerCase().includes(term)),
      );
    }

    setFilteredEmails(result);
  }, [emails, filter, searchTerm]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleDeleteEmail = useCallback(
    async (id) => {
      if (!id) return;
      const confirmed = window.confirm('Remover este registro do historico?');
      if (!confirmed) return;
      try {
        await EmailClassification.remove(id);
        await loadEmails();
      } catch (error) {
        console.error('Erro ao remover registro do historico:', error);
      }
    },
    [loadEmails],
  );

  const handleClearHistory = useCallback(
    async () => {
      if (!emails.length) return;
      const confirmed = window.confirm('Limpar todo o historico de classificacoes?');
      if (!confirmed) return;
      try {
        await EmailClassification.clear();
        await loadEmails();
      } catch (error) {
        console.error('Erro ao limpar historico:', error);
      }
    },
    [emails.length, loadEmails],
  );

  const exportToCSV = () => {
    if (!filteredEmails.length) return;

    const csvRows = filteredEmails.map((email) => ({
      'Data/Hora': new Date(email.created_date).toLocaleString('pt-BR'),
      Origem: email.file_name || 'Texto direto',
      'Classificacao': email.classification,
      'Confianca': `${Math.round(Number(email.confidence_score ?? 0) * 100)}%`,
      'Tempo (ms)': email.processing_time,
      'Conteudo': `${(email.content || '').replace(/"/g, '""').slice(0, 200)}...`,
    }));

    const headers = Object.keys(csvRows[0]);
    const csvContent = [
      headers.join(','),
      ...csvRows.map((row) => headers.map((header) => `"${row[header]}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historico_emails_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.history.back()}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                Historico de Classificacoes
              </h1>
              <p className="text-slate-600 mt-1">Visualize todos os emails processados e suas classificacoes</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleClearHistory}
                variant="outline"
                className="flex items-center gap-2"
                disabled={emails.length === 0 || isLoading}
              >
                <Trash2 className="w-4 h-4" /> Limpar Historico
              </Button>
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="flex items-center gap-2"
                disabled={filteredEmails.length === 0}
              >
                <Download className="w-4 h-4" /> Exportar CSV
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filtros:</span>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Classificacao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as classificacoes</SelectItem>
                  <SelectItem value="produtivo">Apenas Produtivos</SelectItem>
                  <SelectItem value="improdutivo">Apenas Improdutivos</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Buscar no conteudo..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-64"
              />
              <div className="text-sm text-slate-500 ml-auto">{filteredEmails.length} de {emails.length} registros</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <HistoryTable emails={filteredEmails} isLoading={isLoading} onDelete={handleDeleteEmail} />
        </motion.div>

        {!isLoading && filteredEmails.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-12">
            <HistoryIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              {emails.length === 0 ? 'Nenhum email processado ainda' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-slate-500">
              {emails.length === 0
                ? 'Comece processando alguns emails para ver o historico aqui'
                : 'Tente ajustar os filtros ou termos de busca'}
            </p>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
