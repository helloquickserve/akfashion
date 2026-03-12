import { useState, useEffect } from 'react';
import { Calendar, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function ItemSalesReport() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Load all-time data by default
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `${API}/reports/item-sales`;
      const params = [];
      if (startDate) params.push(`start_date=${startDate}`);
      if (endDate) params.push(`end_date=${endDate}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await axios.get(url, getAuthHeader());
      setItems(response.data.items);
    } catch (error) {
      toast.error('Failed to fetch item sales report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      let url = `${API}/reports/item-sales/export-csv`;
      const params = [];
      if (startDate) params.push(`start_date=${startDate}`);
      if (endDate) params.push(`end_date=${endDate}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await axios.get(url, {
        ...getAuthHeader(),
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `item_sales_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity_sold, 0);
  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading font-bold text-4xl tracking-tight text-slate-900">Item Sales Report</h1>
            <p className="font-body text-slate-600 mt-2">Track individual product performance</p>
          </div>
          <Button
            onClick={handleExportCSV}
            data-testid="export-item-report-button"
            className="bg-indigo-700 hover:bg-indigo-800 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Date Filter & Apply Button */}
        <div className="bg-white border border-slate-200 rounded-md p-4 mb-6 shadow-sm">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label className="font-body text-slate-700 font-medium mb-2 block flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Start Date
              </Label>
              <Input
                type="date"
                data-testid="item-report-start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-slate-300"
              />
            </div>
            <div className="flex-1">
              <Label className="font-body text-slate-700 font-medium mb-2 block flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                End Date
              </Label>
              <Input
                type="date"
                data-testid="item-report-end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-slate-300"
              />
            </div>
            <Button
              onClick={fetchReport}
              data-testid="apply-filter-button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Apply Filter
            </Button>
            <Button
              onClick={() => { 
                setStartDate(''); 
                setEndDate(''); 
                setTimeout(() => fetchReport(), 100);
              }}
              data-testid="clear-item-filter-button"
              variant="outline"
              className="border-slate-300"
            >
              Clear Filter
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-heading font-bold text-3xl text-slate-900">
                {items.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Quantity Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-heading font-bold text-3xl text-indigo-700">
                {totalQuantity.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-heading font-bold text-3xl text-emerald-600">
                ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-xl flex items-center text-slate-800">
              <FileText className="w-5 h-5 mr-2" />
              Item Sales Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No sales data available for the selected period
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Item</TableHead>
                      <TableHead className="font-semibold text-slate-700">Barcode</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Quantity Sold</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index} className="hover:bg-slate-50" data-testid={`item-row-${index}`}>
                        <TableCell className="font-medium text-slate-900">{item.item_name}</TableCell>
                        <TableCell className="font-mono text-slate-700">{item.barcode}</TableCell>
                        <TableCell className="text-right text-slate-900 font-medium">
                          {item.quantity_sold}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600">
                          ₹{item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
