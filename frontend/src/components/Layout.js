import { Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import DashboardPage from '@/pages/DashboardPage';
import BillingPage from '@/pages/BillingPage';
import ProductsPage from '@/pages/ProductsPage';
import SalesPage from '@/pages/SalesPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';

export default function Layout({ user, onLogout }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardPage user={user} />} />
          <Route path="/billing" element={<BillingPage user={user} />} />
          <Route path="/products" element={<ProductsPage user={user} />} />
          <Route path="/sales" element={<SalesPage user={user} />} />
          <Route path="/analytics" element={<AnalyticsPage user={user} />} />
          {user.role === 'admin' && (
            <Route path="/settings" element={<SettingsPage user={user} />} />
          )}
        </Routes>
      </main>
    </div>
  );
}