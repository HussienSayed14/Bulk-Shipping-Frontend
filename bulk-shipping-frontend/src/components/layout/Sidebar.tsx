import { NavLink, useLocation } from 'react-router-dom';
import { Package, Upload, LayoutDashboard, FileText, CreditCard, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'New Shipment', icon: Upload },
  { to: '/orders', label: 'Order History', icon: FileText },
  { to: '/billing', label: 'Billing', icon: CreditCard },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();
  const isWizard = ['/upload', '/review', '/shipping', '/purchase'].some((p) => location.pathname.startsWith(p));

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col z-40">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-600">
          <Package className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-display font-bold text-white">ShipFlow</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to || (item.to === '/upload' && isWizard);
          return (
            <NavLink key={item.to} to={item.to} className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
              active ? 'bg-sidebar-active text-white' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
            )}>
              <Icon className={cn('h-[18px] w-[18px]', active && 'text-brand-400')} />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-text hover:bg-sidebar-hover hover:text-red-400 transition-all w-full">
          <LogOut className="h-[18px] w-[18px]" /><span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}