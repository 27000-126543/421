import { Link, useLocation } from 'react-router-dom';
import { Bell, Moon, Sun, Menu, X } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useUIStore } from '../store/useUIStore';
import { cn } from '../lib/utils';
import PlayerAvatar from './PlayerAvatar';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/dreams', label: '梦境' },
  { path: '/arena', label: '竞技场' },
  { path: '/market', label: '市场' },
  { path: '/guild', label: '公会' },
  { path: '/rankings', label: '排行' },
];

interface TopNavigationProps {
  onMenuClick?: () => void;
}

export default function TopNavigation({ onMenuClick }: TopNavigationProps) {
  const location = useLocation();
  const { currentPlayer, isLoggedIn, unreadCount, logout } = usePlayerStore();
  const { theme, toggleTheme, toggleSidebar, sidebarOpen, showToast, openModal } = useUIStore();

  const handleLogout = () => {
    logout();
    showToast({ type: 'info', title: '已退出登录' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dream-dark/80 backdrop-blur-lg border-b border-dream-purple/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick || toggleSidebar}
            className="p-2 rounded-lg hover:bg-dream-purple/20 transition-colors lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dream-purple to-dream-blue flex items-center justify-center">
              <span className="text-2xl">🌙</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="gradient-text text-xl font-bold">梦境编织</h1>
              <p className="text-xs text-dream-light/60">Dream Weaver</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  location.pathname === item.path
                    ? 'bg-dream-purple/30 text-white'
                    : 'text-dream-light/70 hover:text-white hover:bg-dream-purple/20'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-dream-purple/20 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            className="relative p-2 rounded-lg hover:bg-dream-purple/20 transition-colors"
            onClick={() => openModal('notifications')}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-dream-red text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isLoggedIn && currentPlayer ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{currentPlayer.nickname}</p>
                <p className="text-xs text-dream-light/60">
                  Lv.{currentPlayer.level}
                </p>
              </div>
              <PlayerAvatar player={currentPlayer} size="md" showLevel />
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1 rounded-lg bg-dream-red/20 text-dream-red hover:bg-dream-red/30 transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-dream-purple to-dream-blue text-sm font-medium hover:opacity-90 transition-opacity"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
