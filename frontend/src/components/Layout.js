import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardPage from '../pages/DashboardPage';
import BillingPage from '../pages/BillingPage';
import ProductsPage from '../pages/ProductsPage';
import SalesPage from '../pages/SalesPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import SettingsPage from '../pages/SettingsPage';

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
          <Route 
            path="/settings" 
            element={
              user.role === 'admin' ? (
                <SettingsPage user={user} />
              ) : (
                <div className="p-8">
                  <div className="max-w-2xl mx-auto text-center py-12">
                    <h2 className="font-heading font-bold text-2xl text-slate-900 mb-4">Access Denied</h2>
                    <p className="text-slate-600">You don't have permission to access this page.</p>
                  </div>
                </div>
              )
            } 
          />
        </Routes>
      </main>
    </div>
  );
}