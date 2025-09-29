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
  const sanitized = text.toLowerCase().replace(/[^a-z0-9à-ú\s]/gi, ' ');
  const stopwords = new Set([
    'para',
    'como',
    'isso',
    'essa',
    'este',
    'dessa',
    'estar',
    'que',
    'dos',
    'das',
    'uma',
    'esteja',
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

export async function InvokeLLM(options) {
  const content = options?.content ?? extractContentFromPrompt(options?.prompt ?? '');
  if (!content) {
    throw new Error('Nenhum conteúdo fornecido para classificação.');
  }

  const response = await service.classifyText(content);
  if (!response || !response.classification) {
    throw new Error('Resposta inválida do serviço de classificação.');
  }

  const classificationLabel = response.classification.label ?? 'Improdutivo';
  const classification = classificationLabel.toLowerCase() === 'produtivo' ? 'produtivo' : 'improdutivo';
  const confidence = Number(response.classification.confidence ?? 0);

  return {
    classification,
    confidence_score: confidence,
    keywords_extracted: guessKeywords(content),
    suggested_response: response?.reply?.body ?? '',
    reasoning: 'Classificação fornecida pelo serviço remoto.',
  };
}
