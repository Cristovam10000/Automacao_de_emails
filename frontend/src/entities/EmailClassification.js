const STORAGE_KEY = 'email-classifications-v2';
const LEGACY_KEYS = ['email-classifications'];

function getStorage() {
  if (typeof window === 'undefined') {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  }
  return window.localStorage;
}

function clearLegacyData() {
  const storage = getStorage();
  LEGACY_KEYS.forEach((key) => {
    try {
      storage.removeItem(key);
    } catch (error) {
      console.warn('Nao foi possivel remover dados legados:', error);
    }
  });
}

function loadRecords() {
  const storage = getStorage();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Erro ao carregar classificacoes armazenadas:', error);
    return [];
  }
}

function saveRecords(records) {
  const storage = getStorage();
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Erro ao salvar classificacoes:', error);
  }
}

function buildEntry(data) {
  return {
    id: `ec-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    created_date: new Date().toISOString(),
    content: data.content ?? '',
    classification: data.classification ?? 'improdutivo',
    confidence_score: Number.isFinite(data.confidence_score) ? data.confidence_score : 0,
    suggested_response: data.suggested_response ?? '',
    processing_time: Number.isFinite(data.processing_time) ? data.processing_time : 0,
    file_name: data.file_name ?? null,
    keywords_extracted: Array.isArray(data.keywords_extracted) ? data.keywords_extracted : [],
  };
}

clearLegacyData();

export const EmailClassification = {
  async list(orderBy) {
    const records = loadRecords();
    if (orderBy === '-created_date') {
      return [...records].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
    if (orderBy === 'created_date') {
      return [...records].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    }
    return [...records];
  },

  async create(data) {
    const records = loadRecords();
    const entry = buildEntry(data ?? {});
    records.unshift(entry);
    saveRecords(records);
    return entry;
  },

  async clear() {
    saveRecords([]);
  },
};
