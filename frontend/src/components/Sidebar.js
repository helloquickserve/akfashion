import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Receipt, BarChart3, Settings, LogOut, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/billing', label: 'Billing', icon: ShoppingCart },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/sales', label: 'Sales History', icon: Receipt },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (user.role === 'admin') {
    navItems.push({ path: '/settings', label: 'Settings', icon: Settings });
  }

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col" data-testid="sidebar">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-700 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-900">AK Fashion</h2>
            <p className="text-xs text-slate-500">Retail POS</p>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-200" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <Button
                variant="ghost"
                className={`w-full justify-start font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-slate-200" />

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-medium text-sm text-slate-900">{user.username}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>
        <Button
          onClick={onLogout}
          data-testid="logout-button"
          variant="outline"
          className="w-full justify-start border-slate-300 hover:bg-slate-100 text-slate-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}