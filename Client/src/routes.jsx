import { BrowserRouter , Routes, Route } from "react-router-dom";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from  "./features/papers/Dashboard";
import ChatPage from "./features/chat/ChatPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";


const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path = '/' element= {<Login/>} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                    }/>
                <Route path="/paper/:id" element={
                    <ProtectedRoute>
                        <ChatPage />
                    </ProtectedRoute>
                    }/>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;