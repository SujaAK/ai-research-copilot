import { useState, useEffect } from "react";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setUser({ token }); // later can decode JWT if needed
    }

    setLoading(false);
  }, []);

  // Login
  const login = (token) => {
    localStorage.setItem("token", token);
    setUser({ token });
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};

export default useAuth;