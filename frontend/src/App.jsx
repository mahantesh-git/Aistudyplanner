import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { PlanProvider } from './context/PlanContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SubjectsPage from './pages/SubjectsPage';
import TopicsPage from './pages/TopicsPage';
import PlanPage from './pages/PlanPage';
import TasksPage from './pages/TasksPage';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// PublicRoute component (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <TaskProvider>
          <PlanProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <div className="flex-grow">
                <Routes>
                  {/* Home redirect */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Public Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    }
                  />

                  {/* Private Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <DashboardPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/subjects"
                    element={
                      <PrivateRoute>
                        <SubjectsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/subjects/:subjectId/topics"
                    element={
                      <PrivateRoute>
                        <TopicsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/plan"
                    element={
                      <PrivateRoute>
                        <PlanPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <PrivateRoute>
                        <TasksPage />
                      </PrivateRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          </PlanProvider>
        </TaskProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
