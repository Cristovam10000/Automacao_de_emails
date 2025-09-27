import React, { useCallback, useMemo, useRef, useState } from "react";
import {Upload,Mail,Brain,CheckCircle,XCircle,Loader2,FileText,MessageSquare,Sparkles,}from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Features from "@/components/Features";
import heroImage from "@/assets/hero-ai-email.jpg";
import { useEmailClassifier } from "@/presentation/hooks/useEmailClassifier";

const heroSvg = '<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="2"/></g></g></svg>';
const heroPattern = `url("data:image/svg+xml,${encodeURIComponent(heroSvg)}")`;

function makeViewModel(apiResult, originalText, originalFilename) {
  return {
    id: String(Date.now() + Math.random()),
    content: originalText || (originalFilename ? `Arquivo: ${originalFilename}` : ""),
    category: apiResult?.classification?.label === "Produtivo" ? "productive" : "unproductive",
    confidence: Number(apiResult?.classification?.confidence ?? 0),
    suggestedResponse: apiResult?.reply?.body || "",
    processingTime: apiResult?.meta?.latency_ms ? apiResult.meta.latency_ms / 1000 : undefined,
    meta: apiResult?.meta || {},
  };
}

function formatConfidence(value) {
  if (!Number.isFinite(value)) return null;
  const pct = value <= 1 ? value * 100 : value;
  return `${pct.toFixed(1)}% de confianca`;
}

function normalizeError(message) {
  if (!message) return null;
  if (/failed to fetch/i.test(message)) {
    return "Nao foi possivel conectar ao servidor. Verifique se o backend em http://localhost:8000 esta ativo.";
  }
  return message;
}

export default function EmailClassifier() {
  const { isLoading, error, classifyText, uploadFile } = useEmailClassifier();
  const [emailText, setEmailText] = useState("");
  const [results, setResults] = useState([]);
  const [isDragOver, setDragOver] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const fileInputRef = useRef(null);

  const friendlyError = useMemo(() => normalizeError(error), [error]);

  const processedCount = results.length;
  const prodCount = results.filter((item) => item.category === "productive").length;
  const unprodCount = processedCount - prodCount;
  const avgConfidence = useMemo(() => {
    if (!processedCount) return "0";
    const total = results.reduce((sum, item) => sum + (Number.isFinite(item.confidence) ? item.confidence : 0), 0);
    const normalized = total / processedCount;
    const pct = normalized <= 1 ? normalized * 100 : normalized;
    return pct.toFixed(1);
  }, [processedCount, results]);

  const handleEmailSubmit = useCallback(async () => {
    const text = emailText.trim();
    if (!text) return;

    setActiveRequest("text");
    try {
      const apiRes = await classifyText(text);
      const viewModel = makeViewModel(apiRes, text);
      setResults((prev) => [viewModel, ...prev]);
      setEmailText("");
    } catch {
      /* error already handled inside hook */
    } finally {
      setActiveRequest(null);
    }
  }, [emailText, classifyText]);

  const handleFileSelected = useCallback(
    async (file) => {
      if (!file) return;

      setActiveRequest("file");
      setSelectedFileName(file.name);
      try {
        const apiRes = await uploadFile(file);
        const viewModel = makeViewModel(apiRes, "", file.name);
        setResults((prev) => [viewModel, ...prev]);
        setSelectedFileName(null);
      } catch {
        /* error already handled inside hook */
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setDragOver(false);
        setActiveRequest(null);
      }
    },
    [uploadFile],
  );

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const file = event.dataTransfer?.files?.[0] || null;
      handleFileSelected(file);
    },
    [handleFileSelected],
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const isSubmittingText = isLoading && activeRequest === "text";
  const isUploadingFile = isLoading && activeRequest === "file";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden bg-corporate text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-ai/80" />
        <div className="absolute inset-0 opacity-30 animate-pulse" style={{ backgroundImage: heroPattern }} />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Sparkles className="mr-2 h-4 w-4" /> Powered by AI
              </Badge>
              <h1 className="text-5xl font-bold leading-tight">
                Classificacao Inteligente de
                <span className="bg-gradient-to-r from-ai-light to-white bg-clip-text text-transparent"> Emails</span>
              </h1>
              <p className="text-xl leading-relaxed text-primary-foreground/80">
                Automatize a triagem e resposta de emails corporativos com inteligencia artificial avancada. Maximize a
                eficiencia da sua equipe.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-primary-foreground/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success-light" />
                <span>Classificacao Automatica</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-ai-light" />
                <span>Respostas Inteligentes</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-warning-light" />
                <span>Alta Precisao</span>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-up">
            <img src={heroImage} alt="AI Email Classification" className="h-auto w-full rounded-xl shadow-ai" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-ai/20 to-transparent" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="shadow-corporate">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Mail className="h-6 w-6 text-primary" />
                  Analise de Email
                </CardTitle>
                <CardDescription>
                  Insira o conteudo do email ou envie um arquivo para classificacao automatica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`upload-area cursor-pointer p-8 text-center transition ${isDragOver ? "dragover" : ""}`}
                  onClick={handleChooseFileClick}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".txt,.pdf,.eml"
                    onChange={(event) => handleFileSelected(event.target.files?.[0] ?? null)}
                  />

                  {isUploadingFile ? (
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary/60" />
                  ) : (
                    <Upload className="mx-auto mb-4 h-12 w-12 text-primary/60" />
                  )}
                  <h3 className="mb-2 text-lg font-semibold">Upload de Arquivo</h3>
                  <p className="mb-4 text-muted-foreground">Arraste arquivos .txt, .pdf ou .eml aqui ou clique para selecionar</p>
                  <Button variant="outline" className="btn-corporate" disabled={isLoading}>
                    <FileText className="mr-2 h-4 w-4" /> Selecionar Arquivo
                  </Button>
                  {selectedFileName && (
                    <p className="mt-3 text-xs text-muted-foreground">Arquivo selecionado: {selectedFileName}</p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium" htmlFor="email-content">
                    Conteudo do Email
                  </label>
                  <Textarea
                    id="email-content"
                    placeholder="Cole aqui o texto do email para analise..."
                    value={emailText}
                    onChange={(event) => setEmailText(event.target.value)}
                    className="min-h-[200px] resize-none"
                    disabled={isLoading}
                  />

                  <Button
                    onClick={handleEmailSubmit}
                    disabled={isLoading || !emailText.trim()}
                    className="btn-ai w-full"
                    size="lg"
                  >
                    {isSubmittingText ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando com IA...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-5 w-5" /> Classificar Email
                      </>
                    )}
                  </Button>

                  {friendlyError && (
                    <p className="mt-2 text-sm text-destructive" role="alert">
                      {friendlyError}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Estatisticas em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Emails processados</span>
                    <span className="text-lg font-bold">{processedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Produtivos</span>
                    <span className="text-lg font-bold text-success">{prodCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Improdutivos</span>
                    <span className="text-lg font-bold text-muted-foreground">{unprodCount}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Confianca media</span>
                      <span className="text-lg font-bold text-ai">{avgConfidence}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isLoading && (
              <Card className="animate-pulse-glow border-ai/20 bg-ai/5">
                <CardContent className="pt-6">
                  <div className="space-y-4 text-center">
                    <div className="relative">
                      <Brain className="mx-auto h-16 w-16 animate-processing text-ai" />
                      <div className="animate-shimmer absolute inset-0 rounded-full bg-gradient-to-r from-ai/20 via-ai-light/20 to-ai/20" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ai">IA processando</h3>
                      <p className="text-sm text-muted-foreground">Analisando padroes e classificando conteudo...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-center text-2xl font-bold">Resultados da classificacao</h2>
            <div className="grid gap-6">
              {results.map((item, index) => (
                <Card
                  key={item.id}
                  className={`animate-slide-up shadow-glass ${index === 0 ? "ring-2 ring-ai/20" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${item.category === "productive" ? "bg-success/10" : "bg-muted/50"}`}>
                          {item.category === "productive" ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {item.category === "productive" ? "Email produtivo" : "Email improdutivo"}
                          </CardTitle>
                          <CardDescription className="space-x-1 text-muted-foreground">
                            {item.processingTime ? <span>{item.processingTime.toFixed(1)}s</span> : null}
                            {formatConfidence(item.confidence) ? <span>{formatConfidence(item.confidence)}</span> : null}
                            {item.meta?.provider ? <span>• prov: {item.meta.provider}</span> : null}
                            {Number.isFinite(item.meta?.tokens) ? <span>• tokens: {item.meta.tokens}</span> : null}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={item.category === "productive" ? "status-productive" : "status-unproductive"}>
                        {item.category === "productive" ? "Produtivo" : "Improdutivo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 font-medium">
                        <Mail className="h-4 w-4" /> Conteudo original
                      </h4>
                      <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                        {item.content && item.content.length > 220
                          ? `${item.content.slice(0, 220)}...`
                          : item.content || "(sem conteudo registrado)"}
                      </p>
                    </div>

                    {item.suggestedResponse && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-medium">
                          <MessageSquare className="h-4 w-4" /> Resposta sugerida
                        </h4>
                        <div className="rounded-r-lg border-l-4 border-l-ai bg-card p-3">
                          <p className="whitespace-pre-line text-sm">{item.suggestedResponse}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>

      <Features />
      <Footer />
    </div>
  );
}
