// Auth Domain - Barrel Exports
export * from './types';
export * from './contexts/AuthContext';
export * from './utils/permissions';
export { default as LoginPage } from './components/LoginPage';
export { default as RoleGuard } from './components/RoleGuard';
export { 
  CoordinatorOnly, 
  TeacherOnly, 
  StudentOnly, 
  TeacherAndCoordinator 
} from './components/RoleGuard';
export { withRoleGuard } from './components/withRoleGuard';
