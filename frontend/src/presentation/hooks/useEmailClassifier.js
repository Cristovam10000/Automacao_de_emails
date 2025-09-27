import { useMemo, useState } from 'react';
import { EmailClassifierHttpService } from '@/infrastructure/http/EmailClassifierHttpService';


export function useEmailClassifier() {
const service = useMemo(() => new EmailClassifierHttpService(), []);
const [isLoading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [result, setResult] = useState(null);


async function classifyText(text) {
setLoading(true); setError(null);
try { const res = await service.classifyText(text); setResult(res); return res; }
catch (e) { setError(e?.message || 'Falha ao classificar.'); throw e; }
finally { setLoading(false); }
}


async function uploadFile(file) {
setLoading(true); setError(null);
try { const res = await service.uploadFile(file); setResult(res); return res; }
catch (e) { setError(e?.message || 'Falha no upload.'); throw e; }
finally { setLoading(false); }
}


return { isLoading, error, result, classifyText, uploadFile };
}