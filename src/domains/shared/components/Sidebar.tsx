"use client";

import {HomeIcon, UserGroupIcon, BookOpenIcon, AcademicCapIcon} from "@heroicons/react/24/outline";

import {ClassroomStatus} from "./ClassroomStatus";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  userRole: string;
}

export function Sidebar({activeView, setActiveView, userRole}: SidebarProps) {
  const getMenuItems = () => {
    // MVP: Solo vistas esenciales para coordinadores y profesores
    if (userRole === "coordinator") {
      return [
        {id: "overview", name: "Dashboard", icon: HomeIcon},
        {id: "students", name: "Lista de Alumnos", icon: UserGroupIcon},
        {id: "teachers", name: "Lista de Profesores", icon: AcademicCapIcon},
        {id: "assignments", name: "Estado de Entregas", icon: BookOpenIcon},
      ];
    } else if (userRole === "teacher") {
      return [
        {id: "overview", name: "Dashboard", icon: HomeIcon},
        {id: "students", name: "Mis Alumnos", icon: UserGroupIcon},
        {id: "assignments", name: "Mis Entregas", icon: BookOpenIcon},
      ];
    } else {
      // Para estudiantes, redirigir a vista limitada
      return [{id: "overview", name: "Mi Progreso", icon: HomeIcon}];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="absolute inset-y-0 left-0 w-64 -translate-x-full transform space-y-6 bg-blue-900 px-2 py-7 text-white transition duration-200 ease-in-out md:relative md:translate-x-0">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-100">Semillero Digital</h1>
        <p className="mt-1 text-sm text-blue-300">Dashboard de Gestión</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={`flex w-full cursor-pointer items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                activeView === item.id
                  ? "bg-blue-800 text-white"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute right-2 bottom-4 left-2">
        <ClassroomStatus />
      </div>
    </div>
  );
}
