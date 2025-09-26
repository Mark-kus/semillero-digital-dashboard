'use client';

import { 
  HomeIcon, 
  UserGroupIcon, 
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { ClassroomStatus } from './ClassroomStatus';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  userRole: string;
}

export function Sidebar({ activeView, setActiveView, userRole }: SidebarProps) {
  const getMenuItems = () => {
    // MVP: Solo vistas esenciales para coordinadores y profesores
    if (userRole === 'coordinator') {
      return [
        { id: 'overview', name: 'Dashboard', icon: HomeIcon },
        { id: 'students', name: 'Lista de Alumnos', icon: UserGroupIcon },
        { id: 'teachers', name: 'Lista de Profesores', icon: AcademicCapIcon },
        { id: 'assignments', name: 'Estado de Entregas', icon: BookOpenIcon },
      ];
    } else if (userRole === 'teacher') {
      return [
        { id: 'overview', name: 'Dashboard', icon: HomeIcon },
        { id: 'students', name: 'Mis Alumnos', icon: UserGroupIcon },
        { id: 'assignments', name: 'Mis Entregas', icon: BookOpenIcon },
      ];
    } else {
      // Para estudiantes, redirigir a vista limitada
      return [
        { id: 'overview', name: 'Mi Progreso', icon: HomeIcon },
      ];
    }
  };

  const menuItems = getMenuItems();
  return (
    <div className="bg-blue-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-100">Semillero Digital</h1>
        <p className="text-blue-300 text-sm mt-1">Dashboard de Gestión</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeView === item.id
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-2 right-2">
        <ClassroomStatus />
      </div>
    </div>
  );
}
