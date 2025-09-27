/**
* @interface EmailClassifierPort
* @typedef {Object} EmailClassifierPort
* @property {(text: string) => Promise<import('../../domain/models').ProcessResponse>} classifyText
* @property {(file: File) => Promise<import('../../domain/models').ProcessResponse>} uploadFile
*/