# AutoU Mail Assistant

Este projeto é uma prova de conceito completa para automatizar a leitura, classificação e resposta de e‑mails recebidos por uma grande empresa do setor financeiro. A solução tem como objetivo liberar tempo da equipe de atendimento, triando o alto volume de mensagens automaticamente e oferecendo sugestões de resposta de forma imediata.

## 📨Visao Geral
O sistema é composto por duas partes principais:
| Camada            | Tecnologias utilizadas                                                                                                        | Responsabilidades principais                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend (API)** | Python, FastAPI, [LangChain](https://python.langchain.com/), [Google Gemini 2.5‑Flash](https://ai.google.dev/) e scikit‑learn | • Expor endpoints REST para classificar textos, receber arquivos e treinar o modelo de fallback  \  • Orquestrar chamadas a modelos generativos (Gemini) para classificar os e‑mails e sugerir respostas  \  • Caso a IA generativa falhe ou a chave da API não esteja configurada, utilizar um modelo de fallback baseado em *machine learning* e heurísticas |
| **Frontend**      | React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons                                                                     | • Interface amigável para upload de PDFs, arquivos `.txt` ou texto livre  \  • Exibir a categoria (Produtivo/Improdutivo), a confiança e a resposta sugerida  \  • Mostrar estatísticas em tempo real (dashboard) e histórico de classificações, com possibilidade de exportar CSV e treinar o modelo de fallback                                              |

Uma visão geral do fluxo:
- **1**: Usuário envia texto ou arquivo (PDF/TXT) pela interface.
- **2**: O frontend envia a requisição para a API (endpoint /api/process ou /api/upload).
- **3**: O backend aciona o modelo Gemini 2.5‑Flash via LangChain para classificar e sugerir a resposta. Se houver erro (por exemplo, falta de chave), utiliza‑se o modelo de fallback treinável.
- **4**: A API retorna um JSON contendo a classificação, a confiança, o assunto e o corpo da resposta sugerida.
- **5**: O frontend grava a classificação no histórico local (Local Storage), exibe o resultado ao usuário e atualiza o dashboard em tempo real.


## 🧠 Classificação e geração de respostas
Categorias
O modelo classifica cada email em uma destas categorias:

**Produtivo** – O email contém uma solicitação ou demanda que requer uma ação concreta (ex.: suporte técnico, atualização de status, dúvida sobre sistema). A resposta automática será educada e neutra, solicitando eventuais informações (número de pedido, contrato, etc.) e indicando os próximos passos.

**Improdutivo** – O email não exige ação imediata (ex.: felicitações de aniversário ou natal, comunicados informativos, agradecimentos). A resposta automática agradece o contato e encerra cordialmente.

## Modelo principal (Gemini)
O prompt enviado ao modelo generativo define claramente a tarefa de triagem e inclui critérios de classificação e regras de resposta. O modelo retorna um JSON contendo:
   ```bash
   {
  "label": "Produtivo|Improdutivo",
  "confidence": 0.0–1.0,
  "reply_subject": "Assunto sugerido",
  "reply_body": "Mensagem sugerida"
}

   ```
Esse JSON é estruturado por meio da integração do LangChain com o Google Generative AI. A função classify_and_reply em app/providers/gemini_client.py encapsula a chamada ao Gemini; em caso de erro, chama‐se automaticamente o fallback

Fallback treinável
Se a chamada ao modelo Gemini falhar (por exemplo, por falta de internet ou chave da API), a API utiliza um modelo de fallback. Inicialmente, esse fallback é heurístico (palavras‑chave como erro, obrigado, etc.). Entretanto, os usuários podem treinar um classificador de machine learning (Logistic Regression + TF‑IDF) a partir das classificações salvas pelo frontend. Isso é feito via endpoint `/api/retrain`, o qual salva um modelo no arquivo `data/fallback_model.pkl`. Após treinado, o fallback utiliza o modelo de ML para classificar novos e‑mails com base no histórico

## 📦 Estrutura do projeto

```bash
Automacao_de_emails/
├── app/                
│   ├── main.py         
│   ├── api.py          
│   ├── config.py     
│   ├── providers/
│   │   └── gemini_client.py  
│   └── utils/
│       ├── pdf.py     
│       └── fallback_model.py  
├── data/             
├── main.py            
├── requirements.txt    
├── dockerfile          
├── frontend/           
│   ├── index.html     
│   ├── package.json   
│   ├── vite.config.js  
│   └── src/
│       ├── main.jsx       
│       ├── App.jsx       
│       ├── Layout.jsx     
│       ├── pages/
│       ├── entities/      
│       ├── integrations/  
│       └── infrastructure/http/EmailClassifierHttpService.js 
└── ...


```

## ⚙️ Configuração e execução local
### Pré‑requisitos
- **Python** 3.11 ou superior
- **Node.js** 18 ou superior (para o frontend)
- Conta no Google Cloud com acesso ao **Gemini** e geração de **API Key**

### 1. Clonar o repositório
```bash
  git clone https://github.com/Cristovam10000/Automacao_de_emails.git
  cd Automacao_de_emails

```

### 2. Backend
**1**. Crie um ambiente virtual (opcional, mas recomendado):
```bash
  python -m venv .venv
  source .venv/bin/activate  # no Windows use .venv\Scripts\activate

```

**2**. Instale as dependências: 
```bash
  pip install --upgrade pip
  pip install -r requirements.txt

```

**3**. Configure as variáveis de ambiente: 
      Crie um arquivo `.env` na raiz do projeto ou exporte as variáveis no terminal:
```bash
  # Chave de API do Google Generative AI (obrigatória para o modelo principal)
  GOOGLE_API_KEY=SEU_TOKEN_DA_API

  # (opcional) Ajuste o número máximo de caracteres analisados e tamanho da resposta
  CLASS_THRESHOLD=0.65
  MAX_TEXT_CHARS=20000 
  MAX_REPLY_CHARS=1200

```

**4**. Inicie o servidor de desenvolvimento:
```bash
uvicorn main:app --reload --port 8000

```
Isso disponibilizará a API em `http://localhost:8000/`. Os endpoints principais são:

| Método & rota          | Descrição                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **GET /api/health**    | Verifica se a API está no ar (retorna `{"status": "ok"}`)                                                        |
| **POST /api/process**  | Recebe `{ "text": "..." }` e retorna classificação/ resposta                                                     |
| **POST /api/upload**   | Recebe arquivo `pdf` ou `txt` via multipart/form-data e retorna classificação                                    |
| **POST /api/retrain**  | Envia registros para treinar o fallback; requer JSON com `registros: [ { conteudo, classificacao, confianca } ]` |
| **GET /api/health/ai** | Checa a integração com o Gemini (retorna `ok` ou erro)                  

### 3. Frontend
**1**. Entre na pasta do frontend:
```bash
cd frontend

```

**2**. Instale as dependências: 
```bash
npm install

```

**3**. Defina a variável de ambiente VITE_API_BASE (opcional). Por padrão, a aplicação detecta o backend local quando executada em `localhost:5173`, usando `http://localhost:8000/api`. Em ambientes de produção (por exemplo, Vercel ou Render) define‑se esta variável para apontar para sua API pública:
```bash
  # em sistemas Unix
export VITE_API_BASE="https://sua-api-exemplo.onrender.com/api"
# ou crie um arquivo .env.local com VITE_API_BASE=https://...

```

**4**. Inicie o servidor de desenvolvimento:
```bash
 npm run dev

```
A interface estará disponível em `http://localhost:5173/`. Abra no navegador e navegue entre as páginas:
- **Dashboard** – mostra o total de e‑mails processados, quantidade de produtivos e improdutivos, confiança média e tempo médio de processamento.
- **Processar Emails** – permite colar texto ou fazer upload de arquivos `.txt`/`.pdf`. Ao processar, exibe a classificação, a confiança e a resposta sugerida. O resultado é salvo no histórico local.
- **Histórico** – lista todas as classificações realizadas no navegador. É possível filtrar por categoria, buscar por palavras, exportar para CSV, remover registros, limpar tudo ou treinar o modelo de fallback a partir dos dados coletados.

## 🧪 Testando a aplicação
Para facilitar a experimentação, seguem alguns exemplos de entrada:

**1**. **Email produtivo** (solicitação de suporte):
Assunto: “Problemas de acesso ao sistema” \
Corpo: “Olá, não consigo acessar o módulo financeiro, aparece um erro 503. Podem verificar?”
O sistema deve classificar como Produtivo e sugerir uma resposta solicitando detalhes (número de pedido, prints da tela etc.).

**2**. **Email improdutivo** (agradecimento):
“Bom dia! Apenas queria agradecer pelo suporte ontem. Tudo resolvido.”
O sistema deve classificar como Improdutivo e retornar uma resposta curta de agradecimento.

**3**. **Treinando o fallback**: Após processar vários emails no histórico, clique em Treinar IA na página de histórico. Caso haja pelo menos duas classes distintas, a API treinará um modelo de regressão logística e salvará em `data/fallback_model.pkl`.
. A partir de então, se o Gemini falhar, a API utilizará esse modelo automaticamente.

