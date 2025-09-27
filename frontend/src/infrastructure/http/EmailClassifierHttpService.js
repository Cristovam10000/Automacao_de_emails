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
}