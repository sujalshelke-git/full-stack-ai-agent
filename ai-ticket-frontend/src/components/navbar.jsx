import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar bg-white dark:bg-base-200 shadow-md px-4">
      <div className="flex-1">
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
          🎟️ Ticket AI
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {!token ? (
          <>
            <Link to="/signup" className="btn btn-sm btn-secondary">
              Sign Up
            </Link>
            <Link to="/login" className="btn btn-sm btn-primary">
              Login
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Hi, <span className="font-medium">{user?.email}</span>
            </span>

            {user?.role === "admin" && (
              <Link to="/admin" className="btn btn-sm btn-secondary">
                Admin
              </Link>
            )}

            <button onClick={logout} className="btn btn-sm btn-error text-white">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
