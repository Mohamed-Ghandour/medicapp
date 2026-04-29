import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="md:hidden">
        {/* Mobile menu toggle could go here */}
        <span className="text-xl font-bold text-primary-600">MedicAPP</span>
      </div>
      
      <div className="flex-1"></div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm font-medium text-slate-700">
          <User className="h-4 w-4 mr-2 text-slate-500" />
          <span className="hidden sm:inline-block">{user?.username || 'User'}</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500">
            {user?.role}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500 hover:text-red-600">
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Log out</span>
        </Button>
      </div>
    </header>
  );
};
