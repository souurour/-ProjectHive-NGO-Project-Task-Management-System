
import React from 'react';
import { LayoutDashboard, FolderKanban, CalendarDays, BarChart3, Menu, X, Hexagon, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  onQuickTask?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onQuickTask }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <CalendarDays size={20} /> },
    { name: 'Impact', path: '/impact', icon: <BarChart3 size={20} /> },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-hive-dark text-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 text-hive-brand">
               <Hexagon strokeWidth={2.5} size={32} />
               <div className="absolute w-1.5 h-1.5 bg-hive-brand rounded-full"></div>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white">ProjectHive</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-hive-brand text-white font-semibold shadow-lg shadow-hive-brand/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span className={isActive ? 'font-heading' : 'font-sans'}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hive-brand to-cyan-500 flex items-center justify-center font-bold text-sm text-white shadow-md">
              SG
            </div>
            <div>
              <p className="text-sm font-semibold text-white font-heading">Sourour Ghanaya</p>
              <p className="text-xs text-gray-400">Program Director</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
             <button onClick={toggleSidebar} className="lg:hidden text-hive-dark p-2 -ml-2">
                <Menu size={24} />
             </button>
             <h1 className="text-2xl font-heading font-bold text-hive-dark">
                {navItems.find(i => location.pathname === i.path)?.name || 'Project Details'}
             </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onQuickTask}
              className="bg-hive-brand text-white px-5 py-2.5 rounded-full text-sm font-heading font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-hive-brand/20 flex items-center gap-2 active:transform active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} /> Quick Task
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
