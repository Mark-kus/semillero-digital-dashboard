'use client';

import { UserCircleIcon, ChevronDownIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';

interface HeaderProps {
  userRole: string;
}

export function Header({ userRole }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { state, logout } = useAuth();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'coordinator': return 'Coordinador';
      case 'teacher': return 'Profesor';
      case 'student': return 'Estudiante';
      default: return 'Usuario';
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Dashboard Semillero Digital
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                {state.user?.photoUrl ? (
                  <img 
                    src={state.user.photoUrl} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {state.user?.name.fullName || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">{getRoleLabel(userRole)}</p>
                </div>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {state.user?.name.fullName}
                      </p>
                      <p className="text-xs text-gray-500">{state.user?.email}</p>
                      <p className="text-xs text-blue-600 font-medium">{getRoleLabel(userRole)}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
