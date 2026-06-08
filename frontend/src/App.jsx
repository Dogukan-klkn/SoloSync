import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import ClientPortalLayout from './layouts/ClientPortalLayout';
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
import RequestsPage from './pages/RequestsPage';
import ClientHomePage from './pages/client-portal/ClientHomePage';
import ClientProjectsPage from './pages/client-portal/ClientProjectsPage';
import ClientProjectDetailPage from './pages/client-portal/ClientProjectDetailPage';
import ClientInvoicesPage from './pages/client-portal/ClientInvoicesPage';
import ClientInvoiceDetailPage from './pages/client-portal/ClientInvoiceDetailPage';
import ClientMessagesPage from './pages/client-portal/ClientMessagesPage';
import ClientRequestsPage from './pages/client-portal/ClientRequestsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

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
                <Route path="requests"              element={<RequestsPage />} />
                <Route path="settings"              element={<DashboardHome />} />
                <Route path="profile"               element={<ProfileSettingsPage />} />
              </Route>
            </Route>

            {/* Client Portal — sadece Client rolü */}
            <Route element={<ProtectedRoute allowedRoles={['Client']} />}>
              <Route path="/client-portal" element={<ClientPortalLayout />}>
                <Route index                         element={<ClientHomePage />} />
                <Route path="projects"               element={<ClientProjectsPage />} />
                <Route path="projects/:id"           element={<ClientProjectDetailPage />} />
                <Route path="invoices"               element={<ClientInvoicesPage />} />
                <Route path="invoices/:id"           element={<ClientInvoiceDetailPage />} />
                <Route path="requests"               element={<ClientRequestsPage />} />
                <Route path="messages"               element={<ClientMessagesPage />} />
                <Route path="profile"                element={<ProfileSettingsPage />} />
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
