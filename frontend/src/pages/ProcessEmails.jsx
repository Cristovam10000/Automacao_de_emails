import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EmailUploadZone from '@/components/process/EmailUploadZone';
import ClassificationResult from '@/components/process/ClassificationResult';
import { EmailClassification } from '@/entities/EmailClassification';
import { InvokeLLM } from '@/integrations/Core';

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result ?? '');
    reader.onerror = () => reject(new Error('file-read-error'));
    reader.readAsText(file);
  });
}

export default function ProcessEmails() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const processTextContent = async (content, fileName = null) => {
    setIsProcessing(true);
    setError(null);
    const startTime = performance.now();

    try {
      const aiResponse = await InvokeLLM({ content });
      const processingTime = Math.round(performance.now() - startTime);

      const savedEmail = await EmailClassification.create({
        content,
        classification: aiResponse.classification,
        confidence_score: aiResponse.confidence_score,
        suggested_response: aiResponse.suggested_response,
        processing_time: processingTime,
        file_name: fileName,
        keywords_extracted: aiResponse.keywords_extracted,
      });

      setResult({
        ...aiResponse,
        processing_time: processingTime,
        id: savedEmail.id,
      });
    } catch (processingError) {
      console.error('Erro ao processar email:', processingError);
      setError('Erro ao processar o email. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const extension = (file.name?.split('.').pop() || '').toLowerCase();
      if (extension === 'pdf') {
        throw new Error('pdf-not-supported-offline');
      }

      const text = await readFileAsText(file);
      await processTextContent(text, file.name);
    } catch (fileError) {
      if (fileError?.message === 'pdf-not-supported-offline') {
        setError('A classificação de PDFs exige o backend ativo. Converta o arquivo para .txt ou cole o conteúdo do email.');
      } else if (fileError?.message === 'file-read-error') {
        setError('Não foi possível ler o arquivo selecionado.');
      } else {
        console.error('Erro ao processar arquivo:', fileError);
        setError('Erro ao processar o arquivo. Verifique o formato e tente novamente.');
      }
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (text) => {
    if (!text.trim()) return;
    processTextContent(text);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
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
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                Classificação de Emails
              </h1>
              <p className="text-slate-600 mt-1">Sistema inteligente de análise e classificação automática</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg w-fit">
            <Sparkles className="w-4 h-4" /> Powered by AI • Classificação automática em tempo real
          </div>
        </motion.div>

        {error ? (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        ) : null}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {!result ? (
            <EmailUploadZone onFileSelect={handleFileSelect} onTextSubmit={handleTextSubmit} isProcessing={isProcessing} />
          ) : (
            <ClassificationResult result={result} onReset={handleReset} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
