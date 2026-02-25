import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Step1Upload from './pages/wizard/Step1Upload';
import Step2Review from './pages/wizard/Step2Review';
import Step3Shipping from './pages/wizard/Step3Shipping';
import Purchase from './pages/wizard/Purchase';
import OrderHistory from './pages/orders/OrderHistory';

function Placeholder({ title }: { title: string }) {
  return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-lg">{title} — Coming soon</p></div>;
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner fullScreen message="Loading..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner fullScreen message="Loading..." />;
  if (isAuthenticated) return <Navigate to="/upload" replace />;
  return <Outlet />;
}

export default function App() {
  const { initialize } = useAuthStore();
  useEffect(() => { initialize(); }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: '#1e293b', color: '#f1f5f9', fontSize: '14px', borderRadius: '10px', padding: '12px 16px' },
        success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' }, duration: 5000 },
      }} />
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
            <Route path="/upload" element={<Step1Upload />} />
            <Route path="/review/:batchId" element={<Step2Review />} />
            <Route path="/shipping/:batchId" element={<Step3Shipping />} />
            <Route path="/purchase/:batchId" element={<Purchase />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/billing" element={<Placeholder title="Billing" />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="*" element={<Navigate to="/upload" replace />} />
      </Routes>
    </BrowserRouter>
  );
}