import { useState, useEffect, useRef } from 'react';
import { Scan, Plus, Trash2, ShoppingCart } from 'lucide-react';
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

export default function BillingPage() {
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [processing, setProcessing] = useState(false);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    // Auto-focus barcode input
    barcodeInputRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    try {
      const response = await axios.get(`${API}/products/barcode/${barcode}`, getAuthHeader());
      const product = response.data;

      if (product.stock <= 0) {
        toast.error('Product out of stock');
        setBarcode('');
        return;
      }

      // Check if product already in cart
      const existingIndex = cart.findIndex(item => item.product_id === product.id);
      if (existingIndex >= 0) {
        const newCart = [...cart];
        if (newCart[existingIndex].quantity < product.stock) {
          newCart[existingIndex].quantity += 1;
          newCart[existingIndex].total = newCart[existingIndex].quantity * product.price;
          setCart(newCart);
          toast.success('Quantity updated');
        } else {
          toast.error('Cannot exceed available stock');
        }
      } else {
        setCart([...cart, {
          product_id: product.id,
          product_name: product.name,
          barcode: product.barcode,
          quantity: 1,
          price: product.price,
          total: product.price,
          maxStock: product.stock
        }]);
        toast.success('Product added to cart');
      }

      setBarcode('');
      barcodeInputRef.current?.focus();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Product not found');
      setBarcode('');
    }
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cart[index];
    if (newQuantity > item.maxStock) {
      toast.error('Cannot exceed available stock');
      return;
    }
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    newCart[index].total = newQuantity * newCart[index].price;
    setCart(newCart);
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
    toast.info('Item removed from cart');
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setProcessing(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          barcode: item.barcode,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
      };

      await axios.post(`${API}/sales`, saleData, getAuthHeader());
      toast.success('Sale completed successfully!');
      setCart([]);
      barcodeInputRef.current?.focus();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process sale');
    } finally {
      setProcessing(false);
    }
  };

  const { subtotal, gst, total } = calculateTotals();

  return (
    <div className="h-full p-6 bg-slate-50">
      <div className="h-full max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-4xl tracking-tight text-slate-900">Billing</h1>
          <p className="font-body text-slate-600 mt-2">Scan or enter product barcodes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
          {/* Left: Product Scanner & Cart */}
          <div className="lg:col-span-8 space-y-6">
            {/* Barcode Scanner */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-slate-800">
                  <Scan className="w-5 h-5 mr-2" />
                  Scan Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBarcodeSubmit} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      ref={barcodeInputRef}
                      data-testid="barcode-input"
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Scan or enter barcode"
                      className="h-12 text-lg barcode-input border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    data-testid="add-product-button"
                    className="h-12 bg-indigo-700 hover:bg-indigo-800 text-white font-medium px-6"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Cart Items */}
            <Card className="bg-white border border-slate-200 shadow-sm flex-1">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-slate-800">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart Items ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No items in cart. Scan a product to begin.</p>
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold text-slate-700">Product</TableHead>
                          <TableHead className="font-semibold text-slate-700">Price</TableHead>
                          <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
                          <TableHead className="font-semibold text-slate-700">Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map((item, index) => (
                          <TableRow key={index} className="hover:bg-slate-50" data-testid={`cart-item-${index}`}>
                            <TableCell className="font-medium text-slate-900">{item.product_name}</TableCell>
                            <TableCell className="text-slate-700">₹{item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                data-testid={`quantity-input-${index}`}
                                value={item.quantity}
                                onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                min="1"
                                max={item.maxStock}
                                className="w-20 h-9 border-slate-300"
                              />
                            </TableCell>
                            <TableCell className="font-medium text-slate-900">₹{item.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`remove-item-${index}`}
                                onClick={() => removeItem(index)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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

          {/* Right: Bill Summary */}
          <div className="lg:col-span-4">
            <Card className="bg-white border border-slate-200 shadow-sm sticky top-6">
              <CardHeader className="bg-slate-50">
                <CardTitle className="font-heading text-xl text-slate-900">Bill Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-slate-700" data-testid="subtotal-row">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700" data-testid="gst-row">
                    <span className="font-medium">GST (18%)</span>
                    <span className="font-mono">₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between" data-testid="total-row">
                      <span className="font-heading font-semibold text-xl text-slate-900">Total</span>
                      <span className="font-heading font-bold text-2xl text-indigo-700">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={processSale}
                  data-testid="process-sale-button"
                  disabled={cart.length === 0 || processing}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg shadow-sm transition-all active:scale-95"
                >
                  {processing ? 'Processing...' : 'Process Sale'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}