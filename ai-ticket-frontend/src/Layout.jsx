// src/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="p-4">
        <Outlet /> {/* This renders the child route */}
      </main>
    </>
  );
}
