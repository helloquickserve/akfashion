import { useState, useEffect } from 'react';
import { Plus, Download, Upload, Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function ProductsPage({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: '',
    price: '',
    purchase_price: '',
    stock: ''
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`, getAuthHeader());
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode,
        category: product.category,
        price: product.price.toString(),
        purchase_price: product.purchase_price.toString(),
        stock: product.stock.toString()
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        barcode: '',
        category: '',
        price: '',
        purchase_price: '',
        stock: ''
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        purchase_price: parseFloat(formData.purchase_price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, data, getAuthHeader());
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/products`, data, getAuthHeader());
        toast.success('Product created successfully');
      }

      setShowDialog(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/products/${deleteDialog}`, getAuthHeader());
      toast.success('Product deleted successfully');
      setDeleteDialog(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleExport = async () => {
    try {
      let url = `${API}/products/export-csv`;
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
      link.download = 'products_export.csv';
      link.click();
      toast.success('Products exported successfully');
    } catch (error) {
      toast.error('Failed to export products');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/products/import-csv`, formData, {
        ...getAuthHeader(),
        headers: {
          ...getAuthHeader().headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(response.data.message);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to import products');
    }
    e.target.value = '';
  };

  const downloadTemplate = () => {
    const csv = 'Product Name,Barcode,Category,Price,Purchase Price,Stock\nSample Product,12345678,Clothing,999.00,500.00,50';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_import_template.csv';
    link.click();
  };

  const filteredProducts = products.filter(product => {
    if (!startDate || !endDate) return true;
    const productDate = product.created_at.split('T')[0];
    return productDate >= startDate && productDate <= endDate;
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading font-bold text-4xl tracking-tight text-slate-900">Products</h1>
            <p className="font-body text-slate-600 mt-2">Manage your inventory</p>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <>
                <Button
                  onClick={downloadTemplate}
                  data-testid="download-template-button"
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Template
                </Button>
                <Button
                  onClick={() => document.getElementById('csv-upload').click()}
                  data-testid="import-csv-button"
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  onClick={handleExport}
                  data-testid="export-csv-button"
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={() => handleOpenDialog()}
                  data-testid="add-product-button"
                  className="bg-indigo-700 hover:bg-indigo-800 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Date Filter */}
        {isAdmin && (
          <div className="bg-white border border-slate-200 rounded-md p-4 mb-6 shadow-sm">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label className="font-body text-slate-700 font-medium mb-2 block">Start Date</Label>
                <Input
                  type="date"
                  data-testid="start-date-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-slate-300"
                />
              </div>
              <div className="flex-1">
                <Label className="font-body text-slate-700 font-medium mb-2 block">End Date</Label>
                <Input
                  type="date"
                  data-testid="end-date-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-slate-300"
                />
              </div>
              <Button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                data-testid="clear-filter-button"
                variant="outline"
                className="border-slate-300"
              >
                Clear Filter
              </Button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No products found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Product Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Barcode</TableHead>
                  <TableHead className="font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="font-semibold text-slate-700">Price</TableHead>
                  {isAdmin && <TableHead className="font-semibold text-slate-700">Purchase Price</TableHead>}
                  <TableHead className="font-semibold text-slate-700">Stock</TableHead>
                  {isAdmin && <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50" data-testid={`product-row-${product.id}`}>
                    <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                    <TableCell className="font-mono text-slate-700">{product.barcode}</TableCell>
                    <TableCell className="text-slate-700">{product.category}</TableCell>
                    <TableCell className="text-slate-700">₹{product.price.toFixed(2)}</TableCell>
                    {isAdmin && <TableCell className="text-slate-700">₹{product.purchase_price.toFixed(2)}</TableCell>}
                    <TableCell className="text-slate-700">{product.stock}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`edit-product-${product.id}`}
                            onClick={() => handleOpenDialog(product)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`delete-product-${product.id}`}
                            onClick={() => setDeleteDialog(product.id)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md" data-testid="product-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-body text-slate-700 font-medium">Product Name</Label>
              <Input
                data-testid="product-name-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div>
              <Label className="font-body text-slate-700 font-medium">Barcode</Label>
              <Input
                data-testid="product-barcode-input"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div>
              <Label className="font-body text-slate-700 font-medium">Category</Label>
              <Input
                data-testid="product-category-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-slate-700 font-medium">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  data-testid="product-price-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="border-slate-300"
                />
              </div>
              <div>
                <Label className="font-body text-slate-700 font-medium">Purchase Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  data-testid="product-purchase-price-input"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  required
                  className="border-slate-300"
                />
              </div>
            </div>
            <div>
              <Label className="font-body text-slate-700 font-medium">Stock</Label>
              <Input
                type="number"
                data-testid="product-stock-input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                className="border-slate-300"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="border-slate-300">
                Cancel
              </Button>
              <Button type="submit" data-testid="save-product-button" className="bg-indigo-700 hover:bg-indigo-800 text-white">
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent data-testid="delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              data-testid="confirm-delete-button"
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