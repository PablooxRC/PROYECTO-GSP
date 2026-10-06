import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { ScoutProvides } from "./context/scoutContex.jsx";
import { RegistroProvider } from "./context/registroContex.jsx";
import Navbar from "./components/navbar/Navbar.jsx";
import { ProtectedRoute } from "./components/ProtecttedRoute.jsx";
import { Spinner } from "./components/ui";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ScoutsPage from "./pages/ScoutsPage";
import ScoutFormPage from "./pages/ScoutFormPage";
import RegistrosPage from "./pages/RegistrosPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import AdminCreatePage from "./pages/AdminCreatePage";
import AdminDirigenteCreate from "./pages/AdminDirigenteCreate";
import AdminDirigentesPage from "./pages/AdminDirigentesPage";
import AdminSendReport from "./pages/AdminSendReport";
import KralPage from "./pages/KralPage";

function App() {
  const { isAuth, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <Spinner size="lg" text="Cargando aplicación..." />
      </div>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Ir al contenido
      </a>
      <Navbar />
      <div id="main-content" className="app-shell" tabIndex={-1}>
        <Routes>
          <Route
            element={
              <ProtectedRoute isAllowed={!isAuth} redirectTo="/scouts" />
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route
            element={<ProtectedRoute isAllowed={isAuth} redirectTo="/login" />}
          >
            <Route
              element={
                <ScoutProvides>
                  <Outlet />
                </ScoutProvides>
              }
            >
              <Route
                element={
                  <ProtectedRoute
                    isAllowed={user?.unidad !== "Dirigente Institucional"}
                    redirectTo="/registros"
                  />
                }
              >
                <Route path="/scouts" element={<ScoutsPage />} />
              </Route>
              <Route path="/scouts/new" element={<ScoutFormPage />} />
              <Route path="/scouts/:ci/edit" element={<ScoutFormPage />} />
            </Route>

            <Route
              element={
                <RegistroProvider>
                  <Outlet />
                </RegistroProvider>
              }
            >
              <Route path="/registros" element={<RegistrosPage />} />
              <Route path="/admin/create" element={<AdminCreatePage />} />
              <Route
                path="/admin/dirigentes"
                element={<AdminDirigentesPage />}
              />
              <Route
                path="/admin/dirigentes/create"
                element={<AdminDirigenteCreate />}
              />
              <Route
                path="/admin/dirigentes/:ci/edit"
                element={<AdminDirigenteCreate />}
              />
              <Route path="/admin/send-report" element={<AdminSendReport />} />
            </Route>

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/kral" element={<KralPage key="inventory" />} />
            <Route
              path="/kral/solicitudes"
              element={<KralPage key="requests" requests />}
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
