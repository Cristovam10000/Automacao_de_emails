import React from "react";
import { Brain, Zap, Shield, BarChart, Clock, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const featureCards = [
  { icon: Brain, title: "IA Avançada", description: "NLP ajustado para contexto corporativo.", gradient: "bg-ai-gradient", badge: "Core AI" },
  { icon: Zap, title: "Processamento Rápido", description: "Classificação em tempo quase real.", gradient: "bg-gradient-to-br from-warning to-warning-light", badge: "Performance" },
  { icon: Shield, title: "Segurança", description: "Criptografia e auditoria end-to-end.", gradient: "bg-gradient-to-br from-success to-success-light", badge: "Segurança" },
  { icon: BarChart, title: "Analytics", description: "Métricas e padrões em tempo real.", gradient: "bg-corporate", badge: "Insights" },
  { icon: Clock, title: "Disponibilidade", description: "SLA elevado e monitoramento.", gradient: "bg-gradient-to-br from-primary to-primary-light", badge: "Uptime" },
  { icon: MessageCircle, title: "Respostas", description: "Geração de respostas contextuais.", gradient: "bg-ai-gradient", badge: "Smart Reply" },
];

const stats = [
  { value: "95%", label: "Precisão", sublabel: "média reportada" },
  { value: "~1s", label: "Tempo Médio", sublabel: "processamento" },
  { value: "10M+", label: "Emails", sublabel: "processados" },
  { value: "99.9%", label: "Uptime", sublabel: "garantido" },
];

export default function Features() {
  return (
    <section className="bg-glass py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 space-y-4 text-center">
          <Badge variant="outline" className="status-processing mb-4">
            <Brain className="mr-2 h-4 w-4" /> Tecnologia de Ponta
          </Badge>
          <h2 className="text-4xl font-bold">
            Recursos Avançados de <span className="bg-gradient-to-r from-ai to-ai-light bg-clip-text text-transparent">IA</span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            Combina inovação em IA com boas práticas de produto para resultados previsíveis.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feature, index) => (
            <Card
              key={feature.title}
              className="glass-card group animate-slide-up transition-all duration-300 hover:shadow-ai"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="space-y-6 p-8">
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl p-4 shadow-lg transition-transform duration-300 group-hover:scale-110 ${feature.gradient}`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-ai">{feature.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-24 grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="space-y-2 text-center animate-fade-in"
              style={{ animationDelay: `${(index + 6) * 0.1}s` }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-ai bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-lg font-semibold">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}