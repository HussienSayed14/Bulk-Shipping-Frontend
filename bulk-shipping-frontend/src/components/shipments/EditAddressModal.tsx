import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { ShipmentRecord } from '../../types';
import { shipmentsApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import toast from 'react-hot-toast';

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC','PR'];

interface Props { isOpen: boolean; onClose: () => void; onSaved: () => void; shipment: ShipmentRecord; addressType: 'from' | 'to'; }

export function EditAddressModal({ isOpen, onClose, onSaved, shipment, addressType }: Props) {
  const p = addressType;
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({ first_name:'', last_name:'', address1:'', address2:'', city:'', state:'', zip:'', phone:'' });

  useEffect(() => {
    if (!isOpen || !shipment) return;
    const r = shipment as unknown as Record<string, string>;
    setF({ first_name: r[`${p}_first_name`]||'', last_name: r[`${p}_last_name`]||'',
      address1: r[`${p}_address1`]||'', address2: r[`${p}_address2`]||'',
      city: r[`${p}_city`]||'', state: r[`${p}_state`]||'',
      zip: r[`${p}_zip`]||'', phone: r[`${p}_phone`]||'' });
  }, [isOpen, shipment, p]);

  const upd = (k: string, v: string) => setF((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setLoading(true);
    try {
      const data: Record<string, string> = {};
      Object.entries(f).forEach(([k, v]) => { data[`${p}_${k}`] = k === 'state' ? v.toUpperCase() : v; });
      await shipmentsApi.update(shipment.id, data);
      toast.success('Address updated'); onSaved(); onClose();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">Edit {p === 'from' ? 'Ship From' : 'Ship To'} Address</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>First Name *</Label><Input value={f.first_name} onChange={(e) => upd('first_name', e.target.value)} /></div>
            <div><Label>Last Name</Label><Input value={f.last_name} onChange={(e) => upd('last_name', e.target.value)} /></div>
          </div>
          <div><Label>Address Line 1 *</Label><Input value={f.address1} onChange={(e) => upd('address1', e.target.value)} /></div>
          <div><Label>Address Line 2</Label><Input value={f.address2} onChange={(e) => upd('address2', e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>City *</Label><Input value={f.city} onChange={(e) => upd('city', e.target.value)} /></div>
            <div><Label>State *</Label>
              <select value={f.state} onChange={(e) => upd('state', e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select</option>{STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><Label>ZIP *</Label><Input value={f.zip} onChange={(e) => upd('zip', e.target.value)} /></div>
          </div>
          <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => upd('phone', e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={save} isLoading={loading}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}