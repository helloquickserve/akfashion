import { useState, useEffect } from 'react';
import { Trash2, Receipt, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function SalesPage({ user }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [expandedSale, setExpandedSale] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API}/sales`, getAuthHeader());
      setSales(response.data);
    } catch (error) {
      toast.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/sales/${deleteDialog}`, getAuthHeader());
      toast.success('Sale deleted and stock restored');
      setDeleteDialog(null);
      fetchSales();
    } catch (error) {
      toast.error('Failed to delete sale');
    }
  };

  const handleExportCSV = async () => {
    try {
      let url = `${API}/sales/export-csv`;
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
      link.download = `sales_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Sales exported successfully');
    } catch (error) {
      toast.error('Failed to export sales');
    }
  };

  const filteredSales = sales.filter(sale => {
    if (!startDate || !endDate) return true;
    const saleDate = sale.created_at.split('T')[0];
    return saleDate >= startDate && saleDate <= endDate;
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading font-bold text-4xl tracking-tight text-slate-900">Sales History</h1>
            <p className="font-body text-slate-600 mt-2">View all transactions</p>
          </div>
          <Button
            onClick={handleExportCSV}
            data-testid="export-sales-button"
            className="bg-indigo-700 hover:bg-indigo-800 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Date Filter */}
        <div className="bg-white border border-slate-200 rounded-md p-4 mb-6 shadow-sm">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label className="font-body text-slate-700 font-medium mb-2 block flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Start Date
              </Label>
              <Input
                type="date"
                data-testid="sales-start-date-input"
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
                data-testid="sales-end-date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-slate-300"
              />
            </div>
            <Button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              data-testid="clear-sales-filter-button"
              variant="outline"
              className="border-slate-300"
            >
              Clear Filter
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredSales.length === 0 ? (
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="py-12">
              <div className="text-center text-slate-500">
                <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No sales {startDate && endDate ? 'found for selected date range' : 'recorded yet'}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <Card
                key={sale.id}
                className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                data-testid={`sale-${sale.id}`}
                onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="font-heading text-lg text-slate-900">
                        Sale #{sale.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        {format(new Date(sale.created_at), 'PPpp')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-2xl text-indigo-700" data-testid={`sale-total-${sale.id}`}>
                        ₹{sale.total_amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">by {sale.cashier_name}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Items</p>
                      <p className="text-lg font-medium text-slate-900" data-testid={`sale-items-${sale.id}`}>{sale.items.length}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subtotal</p>
                      <p className="text-lg font-medium text-slate-900">₹{sale.subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">GST</p>
                      <p className="text-lg font-medium text-slate-900">₹{sale.gst_amount.toFixed(2)}</p>
                    </div>
                  </div>

                  {expandedSale === sale.id && (
                    <div className="border-t border-slate-200 pt-4 mt-4">
                      <h4 className="font-heading font-semibold text-slate-900 mb-3">Items</h4>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="font-semibold text-slate-700">Product</TableHead>
                            <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
                            <TableHead className="font-semibold text-slate-700">Price</TableHead>
                            <TableHead className="font-semibold text-slate-700">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sale.items.map((item, index) => (
                            <TableRow key={index} className="hover:bg-slate-50">
                              <TableCell className="font-medium text-slate-900">{item.product_name}</TableCell>
                              <TableCell className="text-slate-700">{item.quantity}</TableCell>
                              <TableCell className="text-slate-700">₹{item.price.toFixed(2)}</TableCell>
                              <TableCell className="font-medium text-slate-900">₹{item.total.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`delete-sale-${sale.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog(sale.id);
                        }}
                        className="text-rose-600 hover:text-rose-700 border-rose-300 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Sale
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent data-testid="delete-sale-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sale?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the sale and restore the stock for all items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              data-testid="confirm-delete-sale-button"
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}