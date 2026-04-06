import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./pages/Admin/AdminLayout";

// User pages
import Login from "./pages/Auth/login";
import Register from "./pages/Auth/register";
import Home from "./pages/Home/index";
import CreatePost from "./pages/Home/CreatePost";
import Profile from "./pages/Profile/index";
import Messages from "./pages/Messages/index";
import Friends from "./pages/Friends/index";
import Notifications from "./pages/Notifications/index";

// Admin pages
import Dashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminPosts from "./pages/Admin/AdminPosts";
import AdminReports from "./pages/Admin/AdminReports";
import AdminTags from "./pages/Admin/AdminTags";

// ── Route guards ──

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  // role === 1 là Admin. Nếu không phải admin -> về trang chủ
  if (user.role !== 1) return <Navigate to="/" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      <div className="w-10 h-10 rounded-full border-2 border-t-purple-500 animate-spin"
        style={{ borderColor: "#1f1f2e", borderTopColor: "#7c3aed" }} />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* User - cần đăng nhập */}
      <Route path="/"                         element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/create"                   element={<PrivateRoute><CreatePost /></PrivateRoute>} />
      <Route path="/profile/:userId"          element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/messages"                 element={<PrivateRoute><Messages /></PrivateRoute>} />
      <Route path="/messages/:conversationId" element={<PrivateRoute><Messages /></PrivateRoute>} />
      <Route path="/friends"                  element={<PrivateRoute><Friends /></PrivateRoute>} />
      <Route path="/notifications"            element={<PrivateRoute><Notifications /></PrivateRoute>} />

      {/* DEV - xem giao diện không cần login */}
      <Route path="/test"               element={<MainLayout><Home /></MainLayout>} />
      <Route path="/test/messages"      element={<MainLayout><Messages /></MainLayout>} />
      <Route path="/test/friends"       element={<MainLayout><Friends /></MainLayout>} />
      <Route path="/test/notifications" element={<MainLayout><Notifications /></MainLayout>} />

      {/* Admin - cần role = 1 */}
      <Route path="/admin"         element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/admin/users"   element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/posts"   element={<AdminRoute><AdminPosts /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
      <Route path="/admin/tags"    element={<AdminRoute><AdminTags /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
