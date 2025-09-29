import { EmailClassifierHttpService } from '@/infrastructure/http/EmailClassifierHttpService';

const service = new EmailClassifierHttpService();

function extractContentFromPrompt(prompt) {
  if (!prompt) return '';
  const marker = 'Email para análise:';
  const idx = prompt.indexOf(marker);
  if (idx === -1) return prompt.trim();

  const afterMarker = prompt.slice(idx + marker.length).trim();
  if (!afterMarker) return '';

  let content = afterMarker;
  if (content.startsWith('"')) {
    content = content.slice(1);
  }

  const closing = content.lastIndexOf('"');
  if (closing > 0) {
    content = content.slice(0, closing);
  }

  return content.trim();
}

function guessKeywords(text) {
  if (!text) return [];
  const sanitized = text.toLowerCase().replace(/[^a-zà-ú0-9\s]/gi, ' ');
  const stopwords = new Set([
    'para',
    'com',
    'isso',
    'essa',
    'este',
    'dessa',
    'esteja',
    'estar',
    'que',
    'dos',
    'das',
    'uma',
    'esta',
    'esta',
    'sobre',
    'desde',
    'preciso',
    'precisa',
    'gostaria',
    'favor',
    'olá',
    'ola',
    'bom',
    'boa',
    'dia',
    'tarde',
    'noite',
  ]);

  const words = sanitized
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 4 && !stopwords.has(word));

  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

const PRODUCTIVE_KEYWORDS = [
  'atualização',
  'status',
  'solicitação',
  'urgente',
  'prazo',
  'problema',
  'erro',
  'falha',
  'suporte',
  'acesso',
  'chamado',
  'processo',
  'credito',
  'relatorio',
  'documento',
  'retorno',
  'reunião',
  'analise',
];

const IMPRODUCTIVE_KEYWORDS = [
  'parabéns',
  'feliz',
  'comemor',
  'agradeço',
  'celebração',
  'natal',
  'ano novo',
  'elogio',
  'sucesso',
  'abraços',
  'felicidades',
];

function fallbackClassification(content) {
  const text = content || '';
  const lowered = text.toLowerCase();
  const prodMatches = PRODUCTIVE_KEYWORDS.filter((keyword) => lowered.includes(keyword));
  const improdMatches = IMPRODUCTIVE_KEYWORDS.filter((keyword) => lowered.includes(keyword));

  const classification = prodMatches.length >= improdMatches.length ? 'produtivo' : 'improdutivo';
  const strongestMatch = Math.max(prodMatches.length, improdMatches.length);
  const confidence = Math.min(0.95, 0.55 + strongestMatch * 0.1);
  const keywords = guessKeywords(text);

  const suggested_response = classification === 'produtivo'
    ? 'Olá, obrigado pelo contato. Sua solicitação está sendo analisada e retornaremos em breve com os próximos passos.'
    : 'Olá! Muito obrigado pela mensagem carinhosa. Permanecemos à disposição sempre que precisar.';

  return {
    classification,
    confidence_score: Number(confidence.toFixed(2)),
    keywords_extracted: keywords,
    suggested_response,
    reasoning: 'Classificação gerada localmente via heurística de palavras-chave.',
  };
}

export async function InvokeLLM(options) {
  const content = options?.content ?? extractContentFromPrompt(options?.prompt ?? '');
  if (!content) {
    throw new Error('Nenhum conteúdo fornecido para classificação.');
  }

  try {
    const response = await service.classifyText(content);
    const classificationLabel = response?.classification?.label ?? 'Improdutivo';
    const classification = classificationLabel.toLowerCase() === 'produtivo' ? 'produtivo' : 'improdutivo';
    const confidence = Number(response?.classification?.confidence ?? 0);

    return {
      classification,
      confidence_score: confidence,
      keywords_extracted: guessKeywords(content),
      suggested_response: response?.reply?.body ?? '',
      reasoning: 'Classificação fornecida pelo serviço remoto.',
    };
  } catch (error) {
    console.warn('Classificação remota indisponível, usando fallback local.', error);
    return fallbackClassification(content);
  }
}
