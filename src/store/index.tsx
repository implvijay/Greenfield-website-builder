import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Project, User, Theme, Version, ExportJob } from '../types';
import { themes } from '../data/themes';
import { v4 as uuid } from 'uuid';

interface AppState {
  user: User | null;
  projects: Project[];
  currentProjectId: string | null;
  themes: Theme[];
  exportJobs: ExportJob[];
  loading: boolean;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
}

const initialState: AppState = {
  user: null,
  projects: [],
  currentProjectId: null,
  themes,
  exportJobs: [],
  loading: false,
  notification: null,
};

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_CURRENT_PROJECT'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NOTIFICATION'; payload: AppState['notification'] }
  | { type: 'ADD_VERSION'; payload: { projectId: string; version: Version } }
  | { type: 'RESTORE_VERSION'; payload: { projectId: string; versionId: string } }
  | { type: 'ADD_EXPORT_JOB'; payload: ExportJob }
  | { type: 'UPDATE_EXPORT_JOB'; payload: ExportJob };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return { ...state, projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter(p => p.id !== action.payload), currentProjectId: state.currentProjectId === action.payload ? null : state.currentProjectId };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProjectId: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'ADD_VERSION': {
      const projects = state.projects.map(p => {
        if (p.id === action.payload.projectId) {
          return { ...p, versions: [...p.versions, action.payload.version] };
        }
        return p;
      });
      return { ...state, projects };
    }
    case 'RESTORE_VERSION': {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (!project) return state;
      const version = project.versions.find(v => v.id === action.payload.versionId);
      if (!version) return state;
      try {
        const snapshot = JSON.parse(version.snapshot);
        const projects = state.projects.map(p => p.id === action.payload.projectId ? { ...snapshot, id: p.id, versions: p.versions } : p);
        return { ...state, projects };
      } catch { return state; }
    }
    case 'ADD_EXPORT_JOB':
      return { ...state, exportJobs: [...state.exportJobs, action.payload] };
    case 'UPDATE_EXPORT_JOB':
      return { ...state, exportJobs: state.exportJobs.map(j => j.id === action.payload.id ? action.payload : j) };
    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentProject: Project | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  createProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  notify: (type: 'success' | 'error' | 'info', message: string) => void;
  createVersion: (projectId: string, name: string, description: string) => void;
  restoreVersion: (projectId: string, versionId: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'greenfield_data';

function loadFromStorage(): Partial<AppState> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        user: parsed.user || null,
        projects: parsed.projects || [],
        currentProjectId: parsed.currentProjectId || null,
        exportJobs: parsed.exportJobs || [],
      };
    }
  } catch (e) { console.error('Failed to load from storage:', e); }
  return {};
}

function saveToStorage(state: AppState) {
  try {
    const data = {
      user: state.user,
      projects: state.projects,
      currentProjectId: state.currentProjectId,
      exportJobs: state.exportJobs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { console.error('Failed to save to storage:', e); }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage();
  const [state, dispatch] = useReducer(reducer, { ...initialState, ...stored });

  useEffect(() => {
    saveToStorage(state);
  }, [state.user, state.projects, state.exportJobs]);

  const currentProject = state.projects.find(p => p.id === state.currentProjectId) || null;

  const login = (email: string, _password: string): boolean => {
    const nameStr = email.split('@')[0].split(/[._]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const user: User = { id: uuid(), email, name: nameStr, role: 'admin' };
    dispatch({ type: 'SET_USER', payload: user });
    return true;
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
  };

  const createProject = (project: Project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project });
  };

  const updateProject = (project: Project) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { ...project, updatedAt: new Date().toISOString() } });
  };

  const deleteProject = (id: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
  };

  const setCurrentProject = (id: string | null) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: id });
  };

  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    dispatch({ type: 'SET_NOTIFICATION', payload: { type, message } });
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', payload: null }), 4000);
  };

  const createVersion = (projectId: string, name: string, description: string) => {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;
    const version: Version = {
      id: uuid(),
      name,
      description,
      snapshot: JSON.stringify(project),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_VERSION', payload: { projectId, version } });
    notify('success', `Version "${name}" created successfully`);
  };

  const restoreVersion = (projectId: string, versionId: string) => {
    dispatch({ type: 'RESTORE_VERSION', payload: { projectId, versionId } });
    notify('success', 'Version restored successfully');
  };

  return (
    <StoreContext.Provider value={{
      state, dispatch, currentProject,
      login, logout, createProject, updateProject, deleteProject,
      setCurrentProject, notify, createVersion, restoreVersion,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
