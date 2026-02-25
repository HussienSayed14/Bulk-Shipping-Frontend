import { AlertTriangle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface Props {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string;
  confirmLabel?: string; variant?: 'danger' | 'warning' | 'info'; isLoading?: boolean;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', isLoading = false }: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-scale-in">
        <div className="flex items-start gap-4">
          <div className={cn('flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
            variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-amber-100' : 'bg-brand-100')}>
            {variant === 'info' ? <Info className="h-6 w-6 text-brand-600" />
              : <AlertTriangle className={cn('h-6 w-6', variant === 'danger' ? 'text-red-600' : 'text-amber-500')} />}
          </div>
          <div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm text-gray-600">{message}</p></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant={variant === 'danger' ? 'destructive' : 'default'} onClick={onConfirm} isLoading={isLoading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}