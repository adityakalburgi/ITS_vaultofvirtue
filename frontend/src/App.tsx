
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import Layout from "./components/Layout";
import TabSwitchWarning from "./components/TabSwitchWarning";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Challenges from "./pages/Challenges";
import ChallengePage from "./pages/ChallengePage"; 
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import Guidelines from "./pages/Guidelines";
import ProtectedRoute from "./components/ProtectedRoute";
import FirstLoginRoute from "./components/FirstLoginRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <TabSwitchWarning />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="challenges" element={
                  <ProtectedRoute>
                    <Challenges />
                  </ProtectedRoute>
                } />
                <Route path="challenge/:id" element={
                  <ProtectedRoute>
                    <ChallengePage />
                  </ProtectedRoute>
                } />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="admin" element={<Admin />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/guidelines" element={
                <FirstLoginRoute>
                  <Guidelines />
                </FirstLoginRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
