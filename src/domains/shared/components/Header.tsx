"use client";

import {
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {useState} from "react";

import {useAuth} from "../../auth/contexts/AuthContext";

interface HeaderProps {
  userRole: string;
}

export function Header({userRole}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const {state, logout} = useAuth();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "coordinator":
        return "Coordinador";
      case "teacher":
        return "Profesor";
      case "student":
        return "Estudiante";
      default:
        return "Usuario";
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Semillero Digital</h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Profile Menu */}
            <div className="relative">
              <button
                className="flex cursor-pointer items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {state.user?.photoUrl ? (
                  <img alt="Profile" className="h-8 w-8 rounded-full" src={state.user.photoUrl} />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {state.user?.name.fullName || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500">{getRoleLabel(userRole)}</p>
                </div>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                  <div className="py-1">
                    <div className="border-b border-gray-100 px-4 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {state.user?.name.fullName}
                      </p>
                      <p className="text-xs text-gray-500">{state.user?.email}</p>
                      <p className="text-xs font-medium text-blue-600">{getRoleLabel(userRole)}</p>
                    </div>
                    <button
                      className="flex w-full cursor-pointer items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
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
