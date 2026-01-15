
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import { NotificationProvider } from "@/contexts/NotificationContext";
// Pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Rooms from "@/pages/Rooms";
import RoomDetails from "@/pages/RoomDetails";
import MyRoom from "@/pages/MyRoom";
import RoomApplication from "@/pages/RoomApplication";
import AssignRoom from "@/pages/AssignRoom";
import MaintenanceRequest from "@/pages/MaintenanceRequest";
import PaymentPage from "@/pages/PaymentPage";
import HostelRules from "@/pages/HostelRules";
import RoomChange from "@/pages/RoomChange";
import StudentDirectory from "@/pages/StudentDirectory";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserDataProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/rooms"
                  element={
                    <ProtectedRoute>
                      <Rooms />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/rooms/:id"
                  element={
                    <ProtectedRoute>
                      <RoomDetails />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-room"
                  element={
                    <ProtectedRoute>
                      <MyRoom />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute>
                      <RoomApplication />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/applications/:id"
                  element={
                    <ProtectedRoute>
                      <RoomApplication />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/assign-room"
                  element={
                    <ProtectedRoute>
                      <AssignRoom />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/maintenance"
                  element={
                    <ProtectedRoute>
                      <MaintenanceRequest />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/room-change"
                  element={
                    <ProtectedRoute>
                      <RoomChange />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/rules"
                  element={
                    <ProtectedRoute>
                      <HostelRules />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/students"
                  element={
                    <ProtectedRoute>
                      <StudentDirectory />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </UserDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
