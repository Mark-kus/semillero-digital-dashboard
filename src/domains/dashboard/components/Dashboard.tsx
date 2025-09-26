'use client';

import { useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import RoleGuard, { TeacherAndCoordinator } from '../../auth/components/RoleGuard';
import { Sidebar } from '../../shared/components/Sidebar';
import { Header } from '../../shared/components/Header';
import DashboardOverview from './DashboardOverview';
import { StudentProgress } from '../../student-management/components/StudentProgress';
import { TeachersList } from '../../student-management/components/TeachersList';
import { AssignmentStatus } from '../../student-management/components/AssignmentStatus';
import { ClassroomAuth } from '../../shared/components/ClassroomAuth';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('overview');
  const { state } = useAuth();

  // Obtener el rol del usuario autenticado
  const userRole = state.user?.role || 'student';

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <DashboardOverview userRole={userRole} />;
      case 'students':
        return (
          <TeacherAndCoordinator>
            <StudentProgress userRole={userRole} />
          </TeacherAndCoordinator>
        );
      case 'teachers':
        return (
          <RoleGuard allowedRoles={['coordinator']}>
            <TeachersList userRole={userRole} />
          </RoleGuard>
        );
      case 'assignments':
        return (
          <TeacherAndCoordinator>
            <AssignmentStatus userRole={userRole} />
          </TeacherAndCoordinator>
        );
      default:
        return <DashboardOverview userRole={userRole} />;
    }
  };

  return (
    <ClassroomAuth>
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          userRole={userRole}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={userRole} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </ClassroomAuth>
  );
}
