import { useAuthStore } from '../../store/authStore';
import { Wallet, User } from 'lucide-react';

export default function Header() {
  const { user } = useAuthStore();
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-30">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-lg border border-emerald-200">
          <Wallet className="h-4 w-4" />
          <span className="text-sm font-semibold">${user?.profile?.balance?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
            <User className="h-4 w-4 text-brand-700" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.first_name || user?.username}</p>
            <p className="text-xs text-gray-500">{user?.profile?.company_name || 'Account'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}