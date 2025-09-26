// Authentication Domain Types
export type UserRole = 'coordinator' | 'teacher' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  name: {
    givenName: string;
    familyName: string;
    fullName: string;
  };
  photoUrl?: string;
  role: UserRole;
  permissions: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOGOUT' };

export interface AuthContextType {
  state: AuthState;
  
  // Actions
  login: () => void;
  logout: () => void;
  clearError: () => void;
  
  // Utilities
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
}
