import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CheckAuth({ children, protectedRoute }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const handleAuth = async () => {
      if (protectedRoute) {
        if (!token) {
          navigate("/login", { replace: true });
        } else {
          setLoading(false);
        }
      } else {
        if (token) {
          navigate("/", { replace: true });
        } else {
          setLoading(false);
        }
      }
    };

    handleAuth();

    // Safety timeout in case of unexpected issues
    const timeout = setTimeout(() => setLoading(false), 1500);

    return () => clearTimeout(timeout);
  }, [navigate, protectedRoute]);

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
}

export default CheckAuth;
