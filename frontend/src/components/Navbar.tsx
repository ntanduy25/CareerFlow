import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, LogOut, Plus, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-slate-900 tracking-tight">CareerFlow</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                Job Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Personal Application Tracker & Analytics</p>
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm đơn mới</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {user && (
            <div className="flex items-center gap-3 pl-1">
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-xs leading-none text-slate-900">{user.full_name}</p>
                  <p className="text-[11px] text-slate-500 leading-none mt-1">{user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
