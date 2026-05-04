import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardHome from './pages/DashboardHome';
import CustomersPage from './pages/CustomersPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import KanbanBoard from './pages/KanbanBoard';
import TimeTrackerPage from './pages/TimeTrackerPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index                        element={<DashboardHome />} />
                <Route path="clients"               element={<CustomersPage />} />
                <Route path="projects"              element={<ProjectsPage />} />
                <Route path="projects/:id"          element={<ProjectDetailPage />} />
                <Route path="projects/:id/kanban"   element={<KanbanBoard />} />
                <Route path="time-tracker"          element={<TimeTrackerPage />} />
                <Route path="invoices"              element={<InvoicesPage />} />
                <Route path="invoices/:id"          element={<InvoiceDetailPage />} />
                <Route path="settings"              element={<DashboardHome />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
