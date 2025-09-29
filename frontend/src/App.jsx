import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/Layout';
import Dashboard from '@/pages/Dashboard';
import ProcessEmails from '@/pages/ProcessEmails';
import History from '@/pages/History';
import { createPageUrl } from '@/utils';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path={createPageUrl('Dashboard')} element={<Dashboard />} />
        <Route path={createPageUrl('ProcessEmails')} element={<ProcessEmails />} />
        <Route path={createPageUrl('History')} element={<History />} />
        <Route path="*" element={<Navigate to={createPageUrl('Dashboard')} replace />} />
      </Routes>
    </Layout>
  );
}
