import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  User,
  Home,
  Building2,
  FileText,
  CreditCard,
  Wrench,
  BookOpen,
  Users,
  ArrowLeftRight,
  UserCog,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({
    icon: Icon,
    label,
    path,
  }: {
    icon: React.ElementType;
    label: string;
    path: string;
  }) => (
    <button
      onClick={() => navigate(path)}
      className={`nav-link w-full text-left ${isActive(path) ? 'active' : ''}`}
    >
      <Icon size={17} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(220, 30%, 97%)' }}>
      {/* ── Sidebar ── */}
      {user && (
        <aside className="hidden md:flex w-64 flex-col sidebar-frosted overflow-y-auto flex-shrink-0 z-10">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-white/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-200">
                <Building2 size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-800">MG Hostel</h2>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 pt-3 pb-2">
              Main
            </p>

            <NavItem icon={Home} label="Dashboard" path="/" />

            {user?.role === 'admin' && (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 pt-4 pb-2">
                  Administration
                </p>
                <NavItem icon={Building2} label="Rooms" path="/rooms" />
                <NavItem icon={UserCog} label="Assign Room" path="/assign-room" />
                <NavItem icon={FileText} label="Applications" path="/applications" />
                <NavItem icon={Users} label="Student Directory" path="/students" />
                <NavItem icon={CreditCard} label="Payments" path="/payments" />
              </>
            )}

            {user?.role === 'student' && (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 pt-4 pb-2">
                  My Hostel
                </p>
                <NavItem icon={FileText} label="Apply for Room" path="/applications" />
                <NavItem icon={Building2} label="My Room" path="/my-room" />
                <NavItem icon={CreditCard} label="Payments" path="/payments" />
                <NavItem icon={Wrench} label="Report Issue" path="/maintenance" />
                <NavItem icon={ArrowLeftRight} label="Room Change" path="/room-change" />
                <NavItem icon={BookOpen} label="Hostel Rules" path="/rules" />
              </>
            )}
          </nav>

          {/* User Footer */}
          <div className="p-3 border-t border-white/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm mb-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0">
                <User size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-red-500 py-2 px-3 rounded-xl hover:bg-red-50 transition-all duration-200 font-medium"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </aside>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Mobile Header */}
        {user && (
          <header className="h-14 flex items-center justify-between px-5 md:hidden header-frosted sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm shadow-indigo-200">
                <Building2 size={13} className="text-white" />
              </div>
              <span className="font-bold text-slate-800 text-sm">MG Hostel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <Button size="sm" variant="ghost" onClick={handleLogout} className="text-slate-500 h-8 px-2">
                <LogOut size={15} />
              </Button>
            </div>
          </header>
        )}



        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
