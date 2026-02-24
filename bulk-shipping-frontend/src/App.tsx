import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import Login from './pages/Login';

// Placeholder pages — we'll build these next
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400 text-lg">{title} — Coming soon</p>
    </div>
  );
}

// ── Auth guard: redirects to login if not authenticated ──
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// ── Guest guard: redirects to app if already authenticated ──
function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/upload" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
            duration: 5000,
          },
        }}
      />

      <Routes>
        {/* Guest routes (login) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
          <Route path="/upload" element={<PlaceholderPage title="Upload Spreadsheet" />} />
          <Route path="/review/:batchId" element={<PlaceholderPage title="Review & Edit" />} />
          <Route path="/shipping/:batchId" element={<PlaceholderPage title="Select Shipping" />} />
          <Route path="/purchase/:batchId" element={<PlaceholderPage title="Purchase" />} />
          <Route path="/orders" element={<PlaceholderPage title="Order History" />} />
          <Route path="/billing" element={<PlaceholderPage title="Billing" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="*" element={<Navigate to="/upload" replace />} />
      </Routes>
    </BrowserRouter>
  );
}