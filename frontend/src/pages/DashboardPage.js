import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ total_sales: 0, monthly_sales: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/metrics`, getAuthHeader());
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-4xl tracking-tight text-slate-900">Dashboard</h1>
          <p className="font-body text-slate-600 mt-2">Overview of your store performance</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow" data-testid="total-sales-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Total Sales (All Time)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-heading font-bold text-4xl text-slate-900" data-testid="total-sales-amount">
                  ₹{metrics.total_sales.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow" data-testid="monthly-sales-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Monthly Sales (Current Month)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-heading font-bold text-4xl text-slate-900" data-testid="monthly-sales-amount">
                  ₹{metrics.monthly_sales.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}