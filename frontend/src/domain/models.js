/** @typedef {('Produtivo'|'Improdutivo')} ClassificationLabel */


/**
* @typedef {Object} ProcessResponse
* @property {{label: ClassificationLabel, confidence: number}} classification
* @property {{subject: string, body: string}} reply
* @property {{provider: string, filename?: (string|null), tokens: number, latency_ms?: number}} meta
*/

export {};