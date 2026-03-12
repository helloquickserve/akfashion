import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ total_sales: 0, monthly_sales: 0 });
  const [lastFourMonths, setLastFourMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsResponse, monthsResponse] = await Promise.all([
        axios.get(`${API}/dashboard/metrics`, getAuthHeader()),
        axios.get(`${API}/analytics/last-four-months`, getAuthHeader())
      ]);
      setMetrics(metricsResponse.data);
      setLastFourMonths(monthsResponse.data.last_four_months);
    } catch (error) {
      console.error('Error fetching data:', error);
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
          <div className="space-y-6">
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

            {/* Last 4 Months Sales - NEW */}
            <Card className="bg-white border border-slate-200 shadow-sm" data-testid="last-four-months-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-slate-800">
                  <Calendar className="w-5 h-5 mr-2" />
                  Last 4 Months Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lastFourMonths.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">No sales data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={lastFourMonths}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px'
                        }}
                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                      />
                      <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}