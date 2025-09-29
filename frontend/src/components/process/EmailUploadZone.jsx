import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Type, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function EmailUploadZone({ onFileSelect, onTextSubmit, isProcessing }) {
  const [dragActive, setDragActive] = useState(false);
  const [emailText, setEmailText] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    }
    if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
      ['text/plain', 'application/pdf'].includes(file.type) || /\.(txt|pdf)$/i.test(file.name),
    );
    if (files.length > 0 && typeof onFileSelect === 'function') {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];
    if (file && typeof onFileSelect === 'function') {
      onFileSelect(file);
    }
  };

  const handleSubmitText = () => {
    if (emailText.trim() && typeof onTextSubmit === 'function') {
      onTextSubmit(emailText);
      setEmailText('');
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
      <CardContent className="p-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload de Arquivo
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="w-4 h-4" /> Inserir Texto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileInput}
                className="hidden"
                disabled={isProcessing}
              />

              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Envie seu arquivo de email</h3>
                  <p className="text-slate-600 mb-4">Arraste e solte ou clique para selecionar</p>
                  <div className="flex gap-2 justify-center mb-4">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      .txt
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      .pdf
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" /> Selecionar Arquivo
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Conteúdo do Email</label>
                <Textarea
                  value={emailText}
                  onChange={(event) => setEmailText(event.target.value)}
                  placeholder="Cole aqui o conteúdo do email que deseja classificar..."
                  className="min-h-[200px] bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitText}
                  disabled={!emailText.trim() || isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
                    </>
                  ) : (
                    <>
                      <Type className="w-4 h-4 mr-2" /> Classificar Texto
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
