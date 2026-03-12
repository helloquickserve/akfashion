import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function AnalyticsPage() {
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [salesResponse, productsResponse] = await Promise.all([
        axios.get(`${API}/analytics/sales-overview`, getAuthHeader()),
        axios.get(`${API}/analytics/top-products`, getAuthHeader())
      ]);
      setSalesData(salesResponse.data.daily_sales);
      setTopProducts(productsResponse.data.top_products);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-4xl tracking-tight text-slate-900">Analytics</h1>
          <p className="font-body text-slate-600 mt-2">Sales insights and trends</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Sales Trend */}
            <Card className="bg-white border border-slate-200 shadow-sm" data-testid="sales-chart-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-slate-800">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Sales Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#4338ca"
                      strokeWidth={2}
                      dot={{ fill: '#4338ca', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="bg-white border border-slate-200 shadow-sm" data-testid="top-products-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-slate-800">
                  <Package className="w-5 h-5 mr-2" />
                  Top 5 Products by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topProducts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No sales data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProducts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top Products Table */}
            {topProducts.length > 0 && (
              <Card className="bg-white border border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-xl text-slate-800">Detailed Product Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-4 bg-slate-50 rounded-md"
                        data-testid={`top-product-${index}`}
                      >
                        <div>
                          <p className="font-heading font-semibold text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-600">Sold: {product.quantity} units</p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading font-bold text-xl text-emerald-600">
                            ₹{product.revenue.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">Total Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}