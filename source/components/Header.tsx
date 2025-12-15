import { useState } from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NotificationsPopover from './NotificationsPopover';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header = ({ title, onMenuClick }: HeaderProps) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-20 transition-all shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onMenuClick}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{title}</h2>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 w-64 focus:w-72 transition-all"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                <NotificationsPopover isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-gray-200 dark:border-zinc-800">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Restaurante Alpha</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Loja Aberta</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm cursor-pointer hover:shadow-md transition-all">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
