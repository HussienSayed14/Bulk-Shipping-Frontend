import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { ShipmentRecord } from '../../types';
import { shipmentsApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import toast from 'react-hot-toast';

interface Props { isOpen: boolean; onClose: () => void; onSaved: () => void; shipment: ShipmentRecord; }

export function EditPackageModal({ isOpen, onClose, onSaved, shipment }: Props) {
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({ length:'', width:'', height:'', weight_lb:'', weight_oz:'', order_number:'', item_sku:'' });

  useEffect(() => {
    if (!isOpen || !shipment) return;
    setF({ length: shipment.length?.toString()||'', width: shipment.width?.toString()||'',
      height: shipment.height?.toString()||'', weight_lb: shipment.weight_lb?.toString()||'',
      weight_oz: shipment.weight_oz?.toString()||'', order_number: shipment.order_number||'', item_sku: shipment.item_sku||'' });
  }, [isOpen, shipment]);

  const upd = (k: string, v: string) => setF((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setLoading(true);
    try {
      await shipmentsApi.update(shipment.id, {
        length: f.length ? parseFloat(f.length) : null, width: f.width ? parseFloat(f.width) : null,
        height: f.height ? parseFloat(f.height) : null, weight_lb: f.weight_lb ? parseInt(f.weight_lb) : null,
        weight_oz: f.weight_oz ? parseInt(f.weight_oz) : null, order_number: f.order_number, item_sku: f.item_sku,
      } as Partial<ShipmentRecord>);
      toast.success('Package updated'); onSaved(); onClose();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">Edit Package Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Length (in)*</Label><Input type="number" value={f.length} onChange={(e) => upd('length', e.target.value)} /></div>
            <div><Label>Width (in)*</Label><Input type="number" value={f.width} onChange={(e) => upd('width', e.target.value)} /></div>
            <div><Label>Height (in)*</Label><Input type="number" value={f.height} onChange={(e) => upd('height', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Weight (lbs)</Label><Input type="number" value={f.weight_lb} onChange={(e) => upd('weight_lb', e.target.value)} /></div>
            <div><Label>Weight (oz)</Label><Input type="number" value={f.weight_oz} onChange={(e) => upd('weight_oz', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Order #</Label><Input value={f.order_number} onChange={(e) => upd('order_number', e.target.value)} /></div>
            <div><Label>Item SKU</Label><Input value={f.item_sku} onChange={(e) => upd('item_sku', e.target.value)} /></div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={save} isLoading={loading}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}