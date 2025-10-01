# Conteúdo extraído – Criar README excelente

_Arquivo de origem_: `Criar README excelente.pdf`

---

AutoU Mail Assistant – Classificação Inteligente
de Emails
Este projeto é uma prova de conceito completa  para automatizar a leitura, classificação e resposta de
e‑mails recebidos por uma grande empresa do setor financeiro. A solução tem como objetivo liberar
tempo da equipe de atendimento, triando o alto volume de mensagens automaticamente e oferecendo
sugestões de resposta de forma imediata.
 Visão geral
O sistema é composto por duas partes principais:
Camada Tecnologias utilizadas Responsabilidades principais
Backend
(API)Python, FastAPI, LangChain ,
Google Gemini 2.5‑Flash  e
scikit‑learn• Expor endpoints REST para classificar textos,
receber arquivos e treinar o modelo de fallback \ •
Orquestrar chamadas a modelos generativos
(Gemini) para classificar os e‑mails e sugerir
respostas \ • Caso a IA generativa falhe ou a chave da
API não esteja configurada, utilizar um modelo de
fallback baseado em machine learning  e heurísticas
FrontendReact 19, Vite, Tailwind CSS,
Framer Motion, Lucide Icons• Interface amigável para upload de PDFs, arquivos
.txt ou texto livre \ • Exibir a categoria (Produtivo/
Improdutivo), a confiança e a resposta sugerida \ •
Mostrar estatísticas em tempo real (dashboard) e
histórico de classificações, com possibilidade de
exportar CSV e treinar o modelo de fallback
Uma visão geral do fluxo:
Usuário envia texto ou arquivo (PDF/TXT)  pela interface.
O frontend envia a requisição para a API (endpoint /api/process  ou /api/upload ).
O backend aciona o modelo Gemini 2.5‑Flash  via LangChain para classificar e sugerir a resposta.
Se houver erro (por exemplo, falta de chave), utiliza‑se o modelo de fallback treinável.
A API retorna um JSON contendo a classificação, a confiança, o assunto e o corpo da resposta
sugerida.
O frontend grava a classificação no histórico local (Local Storage), exibe o resultado ao usuário e
atualiza o dashboard em tempo real.1.
2.
3.
4.
5.
1

Classificação e geração de respostas
Categorias
O modelo classifica cada email em uma destas categorias:
Produtivo  – O email contém uma solicitação ou demanda que requer uma ação concreta (ex.:
suporte técnico, atualização de status, dúvida sobre sistema). A resposta automática será
educada e neutra, solicitando eventuais informações (número de pedido, contrato, etc.) e
indicando os próximos passos.
Improdutivo  – O email não exige ação imediata (ex.: felicitações de aniversário ou natal,
comunicados informativos, agradecimentos). A resposta automática agradece o contato e
encerra cordialmente.
Modelo principal (Gemini)
O prompt enviado ao modelo generativo define claramente a tarefa de triagem e inclui critérios de
classificação e regras de resposta. O modelo retorna um JSON contendo:
{
"label":"Produtivo|Improdutivo" ,
"confidence" :0.0–1.0,
"reply_subject" :"Assunto sugerido" ,
"reply_body" :"Mensagem sugerida"
}
Esse JSON é estruturado por meio da integração do LangChain com o Google Generative AI. A função
classify_and_reply  em app/providers/gemini_client.py  encapsula a chamada ao Gemini;
em caso de erro, chama‐se automaticamente o fallback .
Fallback treinável
Se a chamada ao modelo Gemini falhar (por exemplo, por falta de internet ou chave da API), a API
utiliza  um  modelo  de  fallback .  Inicialmente,  esse  fallback  é  heurístico  (palavras‑chave  como  erro,
obrigado ,  etc.) .  Entretanto,  os  usuários  podem  treinar  um  classificador  de  machine   learning
(Logistic Regression + TF‑IDF) a partir das classificações salvas pelo frontend. Isso é feito via endpoint /
api/retrain , o qual salva um modelo no arquivo data/fallback_model.pkl . Após treinado,
o fallback utiliza o modelo de ML para classificar novos e‑mails com base no histórico .
📦 Estrutura do projeto
Automacao_de_emails/
├── app/                # Código do backend (FastAPI)
│   ├── main.py         # Inicializa a aplicação FastAPI e configura CORS
│   ├── api.py          # Define os endpoints: /health, /process, /upload e /
retrain
│   ├── config.py       # Configurações e variáveis de ambiente •
•
1
2
3
4
5
2

(GOOGLE_API_KEY, limites de caracteres)
│   ├── providers/
│   │   └── gemini_client.py  # Integração com Google Generative AI e função
classify_and_reply
│   └── utils/
│       ├── pdf.py       # Conversão de PDFs para texto usando pdfminer
│       └── fallback_model.py  # Implementação do fallback heurístico e
treinável
├── data/               # Diretório para armazenar o modelo de fallback
treinado
├── main.py             # Importa e expõe a aplicação (ponto de entrada para
Uvicorn/Gunicorn)
├── requirements.txt    # Dependências Python do backend
├── dockerfile          # Dockerfile para containerizar a API
├── frontend/           # Código do frontend (React + Vite)
│   ├── index.html      # Template base
│   ├── package.json    # Dependências e scripts npm
│   ├── vite.config.js  # Configurações do Vite
│   └── src/
│       ├── main.jsx       # Ponto de entrada da aplicação React
│       ├── App.jsx        # Configura as rotas e páginas
│       ├── Layout.jsx     # Layout com navegação lateral
│       ├── pages/         # Páginas: Dashboard, ProcessEmails e History
│       ├── entities/      # Modelos de dados no frontend (Local Storage)
│       ├── integrations/  # Integração com a API e análise de texto
│       └── infrastructure/http/EmailClassifierHttpService.js  # Serviço HTTP
que chama a API
└── ...
⚙ Configuração e execução local
Pré‑requisitos
Python 3.11  ou superior
Node.js 18  ou superior (para o frontend)
Conta no Google Cloud com acesso ao Gemini  e geração de API Key
1. Clonar o repositório
gitclonehttps://github.com/Cristovam10000/Automacao_de_emails.git
cdAutomacao_de_emails
2. Backend
Crie um ambiente virtual (opcional, mas recomendado):6
1
7
8
9
10
11
12
13
14
15
16
17
1819
20
21
22
•
•
•
1.
3

python-mvenv.venv
source.venv/bin/activate # no Windows use .venv\Scripts\activate
Instale as dependências:
pipinstall --upgrade pip
pipinstall -rrequirements.txt
Configure as variáveis de ambiente:
Crie um arquivo .env na raiz do projeto ou exporte as variáveis no terminal:
# Chave de API do Google Generative AI (obrigatória para o modelo principal)
GOOGLE_API_KEY=SEU_TOKEN_DA_API
# (opcional) Ajuste o número máximo de caracteres analisados e tamanho da
resposta
CLASS_THRESHOLD=0.65
MAX_TEXT_CHARS=20000
MAX_REPLY_CHARS=1200
Inicie o servidor de desenvolvimento:
uvicorn main:app --reload --port8000
Isso disponibilizará a API em http://localhost:8000/ . Os endpoints principais são:
Método &
rotaDescrição
GET /api/
healthVerifica se a API está no ar (retorna {"status": "ok"} )
POST /api/
processRecebe { "text": "..." }  e retorna classificação/ resposta
POST /api/
uploadRecebe arquivo pdf ou txt via multipart/form-data e retorna classificação
POST /api/
retrainEnvia registros para treinar o fallback; requer JSON com registros:
[ { conteudo, classificacao, confianca } ]
GET /api/
health/aiCheca a integração com o Gemini (retorna ok ou erro)
Dica:  É possível executar a API em produção usando gunicorn  ou uvicorn  sem --
reload, ou ainda utilizando o  dockerfile  fornecido. Basta construir a imagem e
expor a porta 10000:1.
1.
1.
23
24
25
26
27
4

dockerbuild-tautomacao_emails_api .
dockerrun-p10000:10000automacao_emails_api
3. Frontend
Entre na pasta do frontend:
cdfrontend
Instale as dependências:
npminstall
Defina a variável de ambiente VITE_API_BASE  (opcional). Por padrão, a aplicação detecta o
backend local quando executada em localhost:5173 , usando http://localhost:8000/
api. Em ambientes de produção (por exemplo, Vercel ou Render) define‑se esta variável
para apontar para sua API pública:
# em sistemas Unix
exportVITE_API_BASE ="https://sua-api-exemplo.onrender.com/api"
# ou crie um arquivo .env.local com VITE_API_BASE=https://...
Inicie o servidor de desenvolvimento:
npmrundev
A interface estará disponível em http://localhost:5173/ . Abra no navegador e navegue entre as
páginas:
Dashboard  – mostra o total de e‑mails processados, quantidade de produtivos e improdutivos,
confiança média e tempo médio de processamento.
Processar Emails  – permite colar texto ou fazer upload de arquivos .txt/.pdf. Ao
processar , exibe a classificação, a confiança e a resposta sugerida. O resultado é salvo no
histórico local.
Histórico  – lista todas as classificações realizadas no navegador . É possível filtrar por categoria,
buscar por palavras, exportar para CSV, remover registros, limpar tudo ou treinar o modelo de
fallback a partir dos dados coletados.
 Deploy na nuvem
Esta  prova  de  conceito  pode  ser  hospedada  gratuitamente  em  plataformas  como  Render ,  Vercel ,
Hugging Face Spaces  ou Heroku . Uma estratégia simples:
Backend  – publique a imagem Docker gerada a partir do dockerfile  ou deploy no Render/
Heroku. Garanta que a variável GOOGLE_API_KEY  esteja configurada no ambiente.1.
1.
1.
28
1.
•
•
•
1.
5

Frontend  – faça deploy de uma build estática ( npm run build ) em serviços como Vercel.
Configure a variável VITE_API_BASE  apontando para a URL pública da API, por exemplo:
VITE_API_BASE=https://seu-backend-api.onrender.com/api
Forneça aos avaliadores os links da aplicação e do repositório conforme solicitado no formulário
de entrega.
 Testando a aplicação
Para facilitar a experimentação, seguem alguns exemplos de entrada:
Email produtivo  (solicitação de suporte):
Assunto: “Problemas de acesso ao sistema” \
Corpo: “Olá,  não  consigo  acessar  o  módulo  financeiro,  aparece  um  erro  503.  Podem
verificar?”
O sistema deve classificar como  Produtivo  e sugerir uma resposta solicitando detalhes (número de
pedido, prints da tela etc.) .
Email improdutivo  (agradecimento):
“Bom dia! Apenas queria agradecer pelo suporte ontem. Tudo resolvido.”
O sistema deve classificar como Improdutivo  e retornar uma resposta curta de agradecimento .
Treinando o fallback : Após processar vários emails no histórico, clique em Treinar IA  na página
de histórico. Caso haja pelo menos duas classes distintas, a API treinará um modelo de
regressão logística e salvará em data/fallback_model.pkl . A partir de então, se o
Gemini falhar , a API utilizará esse modelo automaticamente .
🗂 Material extra
Vídeo demonstrativo (3–5 minutos)  – apresente brevemente o problema, mostre a interface
processando e‑mails, comente a arquitetura e conclua com aprendizados. Publique em YouTube
(modo não listado) e inclua o link no formulário.
.csv de exemplo  – para testar o treinamento do fallback, exporte o histórico de classificações via
interface e importe no backend utilizando o endpoint /api/retrain  ou a interface de
histórico.
Documentação da API  – por ser uma API FastAPI, você pode acessar a documentação interativa
no endereço /docs após iniciar o backend ( http://localhost:8000/docs ).2.
1.
1.
29
1.
30
1.
31
4
•
•
•
6

Checklist de entrega
Para garantir que sua submissão atenda aos critérios do desafio, verifique:
Item Descrição
✔ Código fonte
organizadoDiretórios app/ (backend) e frontend/  estruturados, dependências
listadas em requirements.txt  e package.json
✔ Instruções clarasEste README explica como instalar , configurar e rodar a aplicação
localmente, além de sugestões de deploy
✔ Classificação
corretaO modelo distingue entre emails produtivos e improdutivos conforme os
critérios fornecidos
✔ Sugestões de
respostaA API retorna assunto e corpo da resposta automática em PT‑BR
✔ Interface intuitivaFrontend responsivo com dashboard, upload e histórico, incluindo
exportação CSV e treinamento do fallback
✔ HospedagemInstruções para publicar a solução em nuvem e configurar variáveis de
ambiente
✔ Vídeo e
formulárioGrave um vídeo demonstrativo e preencha o formulário de entrega com os
links necessários
 Dica final : Explore possibilidades de melhoria, como integrar autenticação, aprimorar o design da UI
ou ampliar o conjunto de categorias. Essa prova de conceito foi pensada para ser extensível e serve
como base para diversas aplicações de triagem inteligente de e‑mails.32
33
7

gemini_client.py
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/app/providers/gemini_client.py
fallback_model.py
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/app/utils/fallback_model.py
api.py
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/app/api.py
config.py
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/app/config.py
pdf.py
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/app/utils/pdf.py
requirements.txt
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/requirements.txt
dockerfile
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/dockerfile
index.html
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/index.html
package.json
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/package.json
vite.config.js
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/vite.config.js
main.jsx
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/src/main.jsx
App.jsx
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/src/App.jsx
Layout.jsx
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/src/Layout.jsx
Dashboard.jsx
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/src/pages/Dashboard.jsx
ProcessEmails.jsx
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/src/pages/ProcessEmails.jsx
History.jsx
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/src/pages/History.jsx
EmailClassification.js
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/src/entities/EmailClassification.js
Core.js
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/src/integrations/Core.js
EmailClassifierHttpService.js
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/src/infrastructure/http/
EmailClassifierHttpService.js
env.js
https://github.com/Cristovam10000/Automacao_de_emails/blob/main/frontend/src/infrastructure/config/env.js133
2 3 4 829 30 31 32
523 24 25 26 27
6
7
9
10
11
12
13
14
15
16
17
18
19
20
21
22
28
8
