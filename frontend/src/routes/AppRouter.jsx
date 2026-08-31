import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import NewScan from "../pages/NewScan";
import History from "../pages/History";
import Analytics from "../pages/Analytics";
import AIRemediation from "../pages/AIRemediation";
import Settings from "../pages/Settings";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function AppRouter() {
  return (
      <Routes>

        {/* ============================= */}
        {/* Public Authentication Routes */}
        {/* ============================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ============================= */}
        {/* Main Application Routes */}
        {/* ============================= */}

        <Route element={<ProtectedRoute />}>

        <Route element={<MainLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/scan"
            element={<NewScan />}
          />

          <Route
            path="/scan/:scanId"
            element={<NewScan />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/analytics/:scanId"
            element={<Analytics />}
          />

          <Route
            path="/ai"
            element={<AIRemediation />}
          />

          <Route
            path="/ai/:scanId"
            element={<AIRemediation />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/settings/:scanId"
            element={<Settings />}
          />

        </Route>

      </Route>

      </Routes>
  );
}