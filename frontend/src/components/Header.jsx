import React from "react";
import { Brain, BarChart3, Settings, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-corporate p-2 shadow-corporate">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">EmailAI</h1>
              <p className="text-xs text-muted-foreground">Classificação Inteligente</p>
            </div>
          </div>
          <Badge variant="outline" className="status-processing">
            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-ai" /> IA Ativa
          </Badge>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Button variant="ghost" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="mr-2 h-4 w-4" /> Configurações
          </Button>
          <Button variant="ghost" size="sm">
            <HelpCircle className="mr-2 h-4 w-4" /> Ajuda
          </Button>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <User className="mr-2 h-4 w-4" /> AutoU Admin
          </Button>
        </div>
      </div>
    </header>
  );
}