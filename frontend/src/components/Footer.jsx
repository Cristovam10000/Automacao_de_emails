import React from "react";
import { Brain, Github, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">EmailAI</h3>
                <p className="text-sm text-primary-foreground/80">by AutoU</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/80">
              IA para classificação automática de emails corporativos.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Produto</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Button variant="link" className="h-auto p-0 text-primary-foreground/80 hover:text-white">
                  Funcionalidades
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-primary-foreground/80 hover:text-white">
                  Documentação
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-primary-foreground/80 hover:text-white">
                  API
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-primary-foreground/80 hover:text-white">
                  Integrações
                </Button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Suporte</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Button variant="link" className="h-auto p-0 text-primary-foreground/80 hover:text-white">
                  Central de Ajuda
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-primary-foreground/80 hover:text-white">
                  Contato
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-primary-foreground/80 hover:text-white">
                  Status
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-primary-foreground/80 hover:text-white">
                  Termos
                </Button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Contato</h4>
            <div className="space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>contato@autou.com.br</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>+55 (11) 9999-8888</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP</span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" size="sm" className="bg-transparent border-white/20 hover:bg-white/10">
                  <Github className="mr-2 h-4 w-4" /> GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/20 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-primary-foreground/60 md:flex-row">
            <p>© {currentYear} AutoU. Todos os direitos reservados.</p>
            <p>Feito com ❤️ para times que recebem muitos emails</p>
          </div>
        </div>
      </div>
    </footer>
  );
}