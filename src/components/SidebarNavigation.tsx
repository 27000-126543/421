import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Moon,
  Swords,
  ShoppingBag,
  Users,
  Trophy,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { cn } from '../lib/utils';

const menuItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/dreams', label: '我的梦境', icon: Moon },
  { path: '/arena', label: '竞技场', icon: Swords },
  { path: '/market', label: '交易市场', icon: ShoppingBag },
  { path: '/guild', label: '公会', icon: Users },
  { path: '/rankings', label: '排行榜', icon: Trophy },
];

const bottomItems = [
  { path: '/settings', label: '设置', icon: Settings },
  { path: '/help', label: '帮助', icon: HelpCircle },
];

interface SidebarNavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarNavigation({ isOpen, onClose }: SidebarNavigationProps) {
  const location = useLocation();
  const { sidebarOpen: storeSidebarOpen } = useUIStore();
  const sidebarOpen = isOpen !== undefined ? isOpen : storeSidebarOpen;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => onClose ? onClose() : useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 w-64 bg-dream-dark/90 backdrop-blur-lg border-r border-dream-purple/30 z-40 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full p-4">
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose ? onClose() : useUIStore.getState().setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-dream-purple/30 to-transparent text-white border-l-2 border-dream-purple'
                      : 'text-dream-light/60 hover:text-white hover:bg-dream-purple/20'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-dream-purple/20 pt-4 space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose ? onClose() : useUIStore.getState().setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-dream-purple/30 to-transparent text-white border-l-2 border-dream-purple'
                      : 'text-dream-light/60 hover:text-white hover:bg-dream-purple/20'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
