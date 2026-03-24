import React from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card.jsx";
function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-8 w-full max-w-md shadow-lg rounded-xl ">
        <div className="flex flex-col items-center text-center">
          <img
            src={user?.gravatar}
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover mb-4"
          />
          {(user?.nombre || user?.apellido) && (
            <h2 className="text-2xl font-semibold text-white mb-2">
              {user?.nombre} {user?.apellido}
            </h2>
          )}
          <p className="text-white mb-2">Email: {user?.email}</p>
          <p className="text-white mb-2">Unidad: {user?.unidad}</p>
          <p className="text-sm text-gray-400 mt-4">
            Registrado desde:{" "}
            {new Date(user?.create_at).toLocaleDateString("es-ES")}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default ProfilePage;
