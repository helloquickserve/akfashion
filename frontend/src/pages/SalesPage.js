import { useState, useEffect } from 'react';
import { Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-4xl tracking-tight text-slate-900">Sales History</h1>
          <p className="font-body text-slate-600 mt-2">View all transactions</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : sales.length === 0 ? (
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="py-12">
              <div className="text-center text-slate-500">
                <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No sales recorded yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
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