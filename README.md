
AutoU Mail Assistant — Classificação Inteligente de Emails

Solução web completa para ler, classificar e sugerir respostas de emails (Produtivo | Improdutivo) em um cenário de alto volume no setor financeiro. O objetivo é automatizar a triagem e economizar tempo da equipe, mantendo respostas claras e consistentes.

📨 Visão geral
Camada	Tecnologias	Responsabilidades
Backend (API)	Python + FastAPI · LangChain · Google Gemini 2.5-Flash · scikit-learn	• Endpoints REST para classificar texto, receber arquivos e treinar o modelo de fallback.
• Orquestração da IA generativa (Gemini) para classificar e sugerir respostas.
• Caso a IA falhe ou a chave não esteja configurada, ativa fallback (ML/heurísticas).
Frontend (Web)	React 19 · Vite · Tailwind CSS · Framer Motion · Lucide Icons	• Upload de PDF / TXT / texto livre.
• Exibir categoria, confiança e resposta sugerida.
• Dashboard em tempo real e histórico (exportar CSV, treinar fallback).
Fluxo resumido

Usuário envia texto ou arquivo (PDF/TXT) pela UI.

Frontend chama /api/process (texto) ou /api/upload (arquivo).

Backend aciona Gemini (ou fallback) e devolve JSON com classificação & resposta.

UI salva no LocalStorage, exibe resultado e atualiza dashboard.

🧠 Classificação & geração de respostas
Categorias

Produtivo — Solicita ação concreta (suporte, status etc.); resposta neutra solicitando dados complementares.

Improdutivo — Não requer ação (felicitações, agradecimentos); resposta cordial e breve.

Modelo principal (Gemini)
{
  "label": "Produtivo|Improdutivo",
  "confidence": 0.0–1.0,
  "reply_subject": "Assunto sugerido",
  "reply_body": "Mensagem sugerida"
}


Chamadas encapsuladas em app/providers/gemini_client.py; em erro ativa fallback.

Fallback treinável

Inicialmente heurístico (palavras-chave).

Endpoint /api/retrain treina TF-IDF + Logistic Regression e salva em data/fallback_model.pkl.

Usado automaticamente se o Gemini falhar.

📦 Estrutura do projeto
Automacao_de_emails/
├── app/
│   ├── main.py                # Inicializa FastAPI
│   ├── api.py                 # /health /process /upload /retrain /health/ai
│   ├── config.py              # Settings & .env
│   ├── providers/
│   │   └── gemini_client.py   # Integração Gemini
│   └── utils/
│       ├── pdf.py             # PDF → texto
│       └── fallback_model.py  # Heurística + ML fallback
├── data/                      # Modelo de fallback treinado
├── dockerfile                 # Container API
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/ …                 # React + Tailwind (Dashboard, ProcessEmails, History)
└── requirements.txt

⚙️ Instalação local
Pré-requisitos

Python 3.11+

Node.js 18+

GOOGLE_API_KEY (Gemini)

1. Clone
git clone https://github.com/Cristovam10000/Automacao_de_emails.git
cd Automacao_de_emails

2. Backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt


Crie .env:

GOOGLE_API_KEY=SEU_TOKEN
CLASS_THRESHOLD=0.65
MAX_TEXT_CHARS=20000
MAX_REPLY_CHARS=1200


Suba:

uvicorn main:app --reload --port 8000
# Docs: http://localhost:8000/docs

3. Frontend
cd frontend
npm install
# opcional: export VITE_API_BASE="https://sua-api.onrender.com/api"
npm run dev


UI em http://localhost:5173

🧩 Endpoints principais
Método	Rota	Descrição
GET	/api/health	Status da API
GET	/api/health/ai	Status integração Gemini
POST	/api/process	{ "text": "..." }
POST	/api/upload	Multipart file (pdf/txt)
POST	/api/retrain	Treina fallback com registros
🐳 Docker rápido
docker build -t automacao_emails_api .
docker run -e GOOGLE_API_KEY=SEU_TOKEN -p 10000:10000 automacao_emails_api

🚀 Deploy

Backend — Render/Heroku/Docker.

Frontend — Vercel/Netlify (npm run build).

Defina VITE_API_BASE=https://SEU_BACKEND/api.

🧪 Teste rápido

Produtivo: “Erro 503 no módulo financeiro” → Produtivo + resposta pedindo detalhes.

Improdutivo: “Obrigado pelo suporte!” → Improdutivo + resposta cordial.

Treinar fallback: após vários registros, clique Treinar IA no Histórico.

✅ Checklist de entrega
✔️	Item
Código organizado (backend / frontend)	
README completo & claro	
IA classifica corretamente + sugere resposta	
Interface intuitiva (dashboard, upload, histórico)	
Instruções de Deploy / Variáveis de ambiente	
Vídeo 3-5 min & links no formulário	
