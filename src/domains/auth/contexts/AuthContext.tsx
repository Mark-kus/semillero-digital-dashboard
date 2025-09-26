'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { AuthState, AuthAction, AuthContextType, UserProfile, UserRole } from '../types';
import { ROLE_PERMISSIONS, determineUserRole } from '../utils/permissions';

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      // Verificar si hay token antes de hacer la llamada
      const hasToken = document.cookie.includes('google_access_token');
      console.log(hasToken)
      if (!hasToken) {
        return null;
      }
      // Llamar a la API para obtener el perfil del usuario con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch('/api/auth/profile', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido o expirado
          return null;
        }
        throw new Error(`Error al obtener el perfil: ${response.status}`);
      }
      
      const result = await response.json();
      const profileData = result.data;
      
      // Obtener cursos para determinar el rol (opcional)
      let courses = [];
      try {
        const coursesController = new AbortController();
        const coursesTimeoutId = setTimeout(() => coursesController.abort(), 5000);
        
        const coursesResponse = await fetch('/api/classroom/courses', {
          signal: coursesController.signal
        });
        
        clearTimeout(coursesTimeoutId);
        
        if (coursesResponse.ok) {
          const coursesResult = await coursesResponse.json();
          courses = coursesResult.data || [];
        }
      } catch (error) {
        console.warn('No se pudieron obtener los cursos:', error);
      }
      
      const userRole = determineUserRole(profileData.emailAddress, courses);
      
      return {
        id: profileData.id,
        email: profileData.emailAddress,
        name: {
          givenName: profileData.name?.givenName || '',
          familyName: profileData.name?.familyName || '',
          fullName: profileData.name?.fullName || profileData.emailAddress,
        },
        photoUrl: profileData.photoUrl,
        role: userRole,
        permissions: [...ROLE_PERMISSIONS[userRole]]
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Timeout al obtener el perfil del usuario');
      } else {
        console.error('Error obteniendo perfil:', error);
      }
      return null;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (hasInitialized) {
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Timeout de seguridad para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      setHasInitialized(true);
    }, 15000); // 15 segundos máximo
    
    try {
      // Obtener perfil del usuario desde Google
      const userProfile = await fetchUserProfile();
      
      clearTimeout(safetyTimeout);
      
      if (userProfile) {
        dispatch({ type: 'SET_USER', payload: userProfile });
      } else {
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      
    } catch (error) {
      clearTimeout(safetyTimeout);
      console.error('Error verificando autenticación:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al verificar la autenticación' });
      dispatch({ type: 'SET_LOADING', payload: false });
    } finally {
      setHasInitialized(true);
    }
  }, [fetchUserProfile, hasInitialized]);

  // Verificar autenticación solo una vez al cargar
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(() => {
    // Redirigir a la API de autenticación de Google
    window.location.href = '/api/auth/google';
  }, []);
  
  const logout = useCallback(async () => {
    // Limpiar tokens y estado
    dispatch({ type: 'LOGOUT' });
    setHasInitialized(false);
    
    // Redirigir a logout de Google
    window.location.href = '/api/auth/logout';
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    return state.user?.permissions.includes(permission) || false;
  }, [state.user]);

  const hasRole = useCallback((role: UserRole): boolean => {
    return state.user?.role === role;
  }, [state.user]);

  const canAccess = useCallback((requiredRoles: UserRole[]): boolean => {
    return state.user ? requiredRoles.includes(state.user.role) : false;
  }, [state.user]);

  const value: AuthContextType = {
    state,
    login,
    logout,
    clearError,
    hasPermission,
    hasRole,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
