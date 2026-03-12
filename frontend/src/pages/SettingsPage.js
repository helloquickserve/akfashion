import { useState, useEffect } from 'react';
import { Save, Building2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function SettingsPage({ user }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    business_name: 'AK Fashion House',
    business_type: 'Retail',
    gst_number: '',
    business_address: '',
    printer_name: 'EPSON TM-T82',
    paper_size: '80mm',
    auto_print: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`, getAuthHeader());
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, settings, getAuthHeader());
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (user.role !== 'admin') {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-slate-500">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-4xl tracking-tight text-slate-900">Settings</h1>
          <p className="font-body text-slate-600 mt-2">Manage business and printer settings</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Business Information */}
            <Card className="bg-white border border-slate-200 shadow-sm" data-testid="business-info-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-slate-800">
                  <Building2 className="w-5 h-5 mr-2" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-body text-slate-700 font-medium">Business Name</Label>
                  <Input
                    data-testid="business-name-input"
                    value={settings.business_name}
                    onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                    className="mt-2 border-slate-300"
                  />
                </div>
                <div>
                  <Label className="font-body text-slate-700 font-medium">Business Type</Label>
                  <Input
                    data-testid="business-type-input"
                    value={settings.business_type}
                    onChange={(e) => setSettings({ ...settings, business_type: e.target.value })}
                    className="mt-2 border-slate-300"
                  />
                </div>
                <div>
                  <Label className="font-body text-slate-700 font-medium">GST Number</Label>
                  <Input
                    data-testid="gst-number-input"
                    value={settings.gst_number}
                    onChange={(e) => setSettings({ ...settings, gst_number: e.target.value })}
                    placeholder="Enter GST number"
                    className="mt-2 border-slate-300"
                  />
                </div>
                <div>
                  <Label className="font-body text-slate-700 font-medium">Business Address</Label>
                  <Input
                    data-testid="business-address-input"
                    value={settings.business_address}
                    onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                    placeholder="Enter business address"
                    className="mt-2 border-slate-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Printer Settings */}
            <Card className="bg-white border border-slate-200 shadow-sm" data-testid="printer-settings-card">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center text-slate-800">
                  <Printer className="w-5 h-5 mr-2" />
                  Printer Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-body text-slate-700 font-medium">Printer Name</Label>
                  <Input
                    data-testid="printer-name-input"
                    value={settings.printer_name}
                    onChange={(e) => setSettings({ ...settings, printer_name: e.target.value })}
                    placeholder="e.g., EPSON TM-T82"
                    className="mt-2 border-slate-300"
                  />
                </div>
                <div>
                  <Label className="font-body text-slate-700 font-medium">Paper Size</Label>
                  <Select
                    value={settings.paper_size}
                    onValueChange={(value) => setSettings({ ...settings, paper_size: value })}
                  >
                    <SelectTrigger data-testid="paper-size-select" className="mt-2 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58mm">58mm</SelectItem>
                      <SelectItem value="80mm">80mm</SelectItem>
                      <SelectItem value="A4">A4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-body text-slate-700 font-medium">Auto-print Receipts</Label>
                    <p className="text-sm text-slate-500 mt-1">Automatically print receipts after each sale</p>
                  </div>
                  <Switch
                    data-testid="auto-print-toggle"
                    checked={settings.auto_print}
                    onCheckedChange={(checked) => setSettings({ ...settings, auto_print: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                data-testid="save-settings-button"
                disabled={saving}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-medium px-8"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}