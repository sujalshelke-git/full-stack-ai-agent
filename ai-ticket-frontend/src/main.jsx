import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CheckAuth from "./components/check-auth.jsx";
import Tickets from "./pages/tickets.jsx";
import TicketDetailsPage from "./pages/ticket.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Admin from "./pages/admin.jsx";
import Layout from "./Layout.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Root layout wrapper */}
        <Route element={<Layout />}>
          {/* Home page (Tickets list) */}
          <Route
            path="/"
            element={
              <CheckAuth protectedRoute={true}>
                <Tickets />
              </CheckAuth>
            }
          />

          {/* Ticket Details Page */}
          <Route
            path="/tickets/:id"
            element={
              <CheckAuth protectedRoute={true}>
                <TicketDetailsPage />
              </CheckAuth>
            }
          />

          {/* Admin Page */}
          <Route
            path="/admin"
            element={
              <CheckAuth protectedRoute={true}>
                <Admin />
              </CheckAuth>
            }
          />

          {/* Login Page */}
          <Route
            path="/login"
            element={
              <CheckAuth protectedRoute={false}>
                <Login />
              </CheckAuth>
            }
          />

          {/* Signup Page */}
          <Route
            path="/signup"
            element={
              <CheckAuth protectedRoute={false}>
                <Signup />
              </CheckAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);