import React from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui";
function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <h1 className="page-title">Mi perfil</h1>
          <p className="page-description">
            Tu información de cuenta y unidad scout.
          </p>
        </div>
      </header>
      <Card className="w-full max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-[#303b50] pb-6 mb-6">
          <img
            src={user?.gravatar}
            alt="Foto de perfil"
            className="w-20 h-20 rounded-full object-cover border border-[#303b50]"
          />
          {(user?.nombre || user?.apellido) && (
            <h2 className="text-2xl font-semibold">
              {user?.nombre} {user?.apellido}
            </h2>
          )}
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <dt className="data-label">Email</dt>
            <dd className="data-value break-all">{user?.email}</dd>
          </div>
          <div>
            <dt className="data-label">Unidad</dt>
            <dd className="data-value">{user?.unidad}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="data-label">Registrado desde</dt>
            <dd className="data-value">
              {new Date(user?.create_at).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

export default ProfilePage;
