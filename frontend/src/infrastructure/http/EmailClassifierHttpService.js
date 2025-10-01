import { API_BASE } from '../config/env';

export class EmailClassifierHttpService {
  /** @param {string} text */
  async classifyText(text) {
    const r = await fetch(`${API_BASE}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  /** @param {File} file */
  async uploadFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  /**
   * Envia registros para treinar o modelo de fallback no backend.
   * @param {Array<{conteudo: string, classificacao: string, confianca: number}>} registros
   */
  async treinarComRegistros(registros) {
    const r = await fetch(`${API_BASE}/retrain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registros }),
    });
    const payloadText = await r.text();
    let data = null;
    try {
      data = payloadText ? JSON.parse(payloadText) : null;
    } catch (error) {
      // Conteudo nao era JSON, segue com texto puro
      print(error)
    }
    if (!r.ok) {
      const detail = data && typeof data === 'object' ? data.detail ?? payloadText : payloadText;
      throw new Error(detail || 'Erro ao treinar modelo.');
    }
    return data ?? { status: 'ok' };
  }
}
