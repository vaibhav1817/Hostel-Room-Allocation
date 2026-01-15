import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  User,
  Home,
  Building2,
  FileText,
  CreditCard
} from 'lucide-react';


interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      {user && (
        <aside className="hidden md:flex w-64 flex-col bg-card border-r shadow-sm overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-primary">MG Hostel System</h2>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start nav-link"
              onClick={() => navigate('/')}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </Button>

            {user?.role === 'admin' && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start nav-link"
                  onClick={() => navigate('/rooms')}
                >
                  <Building2 size={18} />
                  <span>Rooms</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start nav-link"
                  onClick={() => navigate('/payments')}
                >
                  <CreditCard size={18} />
                  <span>Payments</span>
                </Button>
              </>
            )}

            {user?.role === 'student' && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start nav-link"
                  onClick={() => navigate('/applications')}
                >
                  <FileText size={18} />
                  <span>Apply for Room</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start nav-link"
                  onClick={() => navigate('/my-room')}
                >
                  <Building2 size={18} />
                  <span>My Room</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start nav-link"
                  onClick={() => navigate('/payments')}
                >
                  <CreditCard size={18} />
                  <span>Payments</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start nav-link"
                  onClick={() => navigate('/maintenance')}
                >
                  <FileText size={18} />
                  <span>Report Issue</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start nav-link"
                  onClick={() => navigate('/room-change')}
                >
                  <Building2 size={18} />
                  <span>Request Room Change</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start nav-link"
                  onClick={() => navigate('/rules')}
                >
                  <FileText size={18} />
                  <span>Hostel Rules</span>
                </Button>
              </>
            )}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <User size={20} />
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {user && (
          <header className="hidden md:flex h-16 border-b items-center justify-end px-6 bg-card">
            <div className="flex items-center gap-4">
            </div>
          </header>
        )}

        {user && (
          <header className="h-16 border-b flex items-center justify-between px-6 bg-card md:hidden">
            <div className="md:hidden">
              <h2 className="text-xl font-bold text-primary">MG Hostel System</h2>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="md:hidden">
                  <Button size="sm" variant="outline" onClick={handleLogout}>
                    <LogOut size={16} />
                  </Button>
                </div>
              )}
            </div>
          </header>
        )}

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
