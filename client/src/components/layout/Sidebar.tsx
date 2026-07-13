import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Menu,
  X,
  User,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/business', label: 'Business', icon: Building2 },
  { to: '/warranty', label: 'Warranty', icon: ShieldCheck },
];

interface User {
  name: string;
  email: string;
}

export const Sidebar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('smartbill_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-brand-dark border-b-2 border-black flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2 text-white">
          <span className="font-extrabold text-base tracking-tight">SMARTBILL</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-1 cursor-pointer"
        >
          {mobileOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 bottom-0 w-[240px] bg-brand-dark text-white flex flex-col z-50 transition-transform duration-200 border-r-2 border-black',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header with name */}
        <div className="px-6 py-7 border-b border-neutral-800 cursor-pointer hover:bg-neutral-800 transition-colors" onClick={() => {
          navigate('/account');
          setMobileOpen(false);
        }}>
          <div className="flex flex-col gap-1">
            <span className="font-extrabold text-lg tracking-tight">SMARTBILL</span>
            {user && (
              <span className="text-xs font-medium text-neutral-400 truncate hover:text-neutral-300">{user.name}</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-wide uppercase transition-all duration-100',
                  isActive
                    ? 'bg-brand-green text-black border-2 border-black shadow-brutal-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                )
              }
            >
              <item.icon size={18} strokeWidth={2.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Account button at bottom */}
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={() => {
              navigate('/account');
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-purple text-white font-bold text-xs uppercase tracking-widest border-2 border-black shadow-brutal-sm cursor-pointer transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <User size={16} strokeWidth={2.5} />
            Account
          </button>
        </div>
      </aside>
    </>
  );
};
