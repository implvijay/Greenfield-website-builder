import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, FolderOpen, Palette, LogOut, User, ChevronRight, ChevronLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  const { state, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('greenfield_sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('greenfield_sidebar_collapsed', collapsed.toString());
  }, [collapsed]);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/projects', icon: FolderOpen, label: 'Projects' },
    { path: '/themes', icon: Palette, label: 'Themes' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 relative`}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 z-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={14} className="text-slate-600" /> : <PanelLeftClose size={14} className="text-slate-600" />}
        </button>

        <div className={`p-6 border-b border-slate-100 ${collapsed ? 'px-4' : ''}`}>
          <Link to="/" className={`flex ${collapsed ? 'justify-center' : 'items-center gap-3'}`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🏗️</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-slate-900 text-lg leading-tight">GREENFIELD</h1>
                <p className="text-xs text-slate-500">Website Factory</p>
              </div>
            )}
          </Link>
        </div>

        <nav className={`flex-1 ${collapsed ? 'p-2' : 'p-4'} space-y-1`}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex ${collapsed ? 'justify-center px-2' : 'items-center gap-3 px-4'} py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-slate-100 ${collapsed ? 'px-2' : ''}`}>
          <div className={`flex ${collapsed ? 'justify-center' : 'items-center gap-3'} px-4 py-2`}>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-indigo-600" />
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{state.user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{state.user?.role}</p>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
          {collapsed && (
            <button onClick={() => { logout(); navigate('/'); }} className="w-full mt-2 p-1.5 text-slate-400 hover:text-red-500 transition-colors flex justify-center" title="Logout">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; path?: string }[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} />}
          {item.path ? (
            <Link to={item.path} className="hover:text-indigo-600 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
