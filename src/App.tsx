import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { ProjectsPage } from './pages/Projects';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { ThemesPage } from './pages/Themes';
import { Notification } from './components/Notification';

function AppRoutes() {
  const { state } = useStore();

  if (!state.user) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectId/*" element={<ProjectWorkspace />} />
      <Route path="/themes" element={<ThemesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppRoutes />
        <Notification />
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
