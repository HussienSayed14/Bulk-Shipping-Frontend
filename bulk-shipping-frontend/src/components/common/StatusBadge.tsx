import { cn } from '../../lib/utils';
import { CheckCircle2, XCircle, Clock, ShieldCheck, ShieldX } from 'lucide-react';

type Variant = 'valid' | 'invalid' | 'verified' | 'failed' | 'unverified';

const cfg: Record<Variant, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  valid:      { icon: CheckCircle2, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Valid' },
  invalid:    { icon: XCircle,      bg: 'bg-red-50 border-red-200',         text: 'text-red-700',     label: 'Invalid' },
  verified:   { icon: ShieldCheck,  bg: 'bg-blue-50 border-blue-200',       text: 'text-blue-700',    label: 'Verified' },
  failed:     { icon: ShieldX,      bg: 'bg-orange-50 border-orange-200',   text: 'text-orange-700',  label: 'Failed' },
  unverified: { icon: Clock,        bg: 'bg-gray-50 border-gray-200',       text: 'text-gray-500',    label: 'Unverified' },
};

export function StatusBadge({ variant, label, className }: { variant: Variant; label?: string; className?: string }) {
  const c = cfg[variant]; const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', c.bg, c.text, className)}>
      <Icon className="h-3.5 w-3.5" />{label || c.label}
    </span>
  );
}