import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/papers/Dashboard";
import ChatPage from "./features/chat/ChatPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - no Navbar */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes - with Navbar */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Dashboard />
            </>
          </ProtectedRoute>
        } />

        <Route path="/paper/:id" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <ChatPage />
            </>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;