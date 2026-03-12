import { useState } from 'react';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password
      });
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Image */}
      <div 
        className="hidden lg:block relative bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1769107805412-90d9191d53e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBmYXNoaW9uJTIwYm91dGlxdWUlMjBpbnRlcmlvciUyMHN0b3JlfGVufDB8fHx8MTc3MzI5ODkyNXww&ixlib=rb-4.1.0&q=85)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40" />
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md border-slate-200 shadow-lg" data-testid="login-card">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-indigo-700 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">AK Fashion House</h1>
              <p className="font-body text-slate-600 mt-2">Retail Management System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" data-testid="login-error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="font-body text-slate-700 font-medium">Username</Label>
                <Input
                  id="username"
                  data-testid="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-body text-slate-700 font-medium">Password</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter password"
                />
              </div>

              <Button
                type="submit"
                data-testid="login-button"
                disabled={loading}
                className="w-full h-11 bg-indigo-700 hover:bg-indigo-800 text-white font-medium shadow-sm transition-all active:scale-95"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Cashier Credentials */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Demo Credentials (Cashier)</p>
              <div className="space-y-2 text-sm font-body text-slate-600">
                <div className="flex justify-between">
                  <span>Cashier 1:</span>
                  <span className="font-mono">cashier1 / cashier123</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier 2:</span>
                  <span className="font-mono">cashier2 / cashier234</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}