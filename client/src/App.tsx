import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import InvoiceEditor from './pages/InvoiceEditor';
import InvoiceDetails from './pages/InvoiceDetails';
import Customers from './pages/Customers';
import BusinessPage from './pages/BusinessPage';
import AccountPage from './pages/AccountPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Landing page — no sidebar */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* App pages — with sidebar layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices" element={<InvoiceList />} />
              <Route path="/invoices/new" element={<InvoiceEditor mode="create" />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
              <Route path="/invoices/:id/edit" element={<InvoiceEditor mode="edit" />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/business" element={<BusinessPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
