import React, { useEffect, useState } from "react";
import { Card, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PiTrashSimpleLight } from "react-icons/pi";
import { BiPencil } from "react-icons/bi";
import adminApi from "../api/admin.api";

function AdminDirigentesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dirigentes, setDirigentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDirigentes();
  }, []);

  const loadDirigentes = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDirigentes();
      setDirigentes(response.data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Error cargando dirigentes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ci) => {
    if (window.confirm("¿Estás seguro de eliminar este dirigente?")) {
      try {
        await adminApi.deleteDirigente(ci);
        await loadDirigentes();
      } catch (err) {
        alert(err?.response?.data?.message || "Error eliminando dirigente");
      }
    }
  };

  if (!user?.is_admin) {
    return <p className="text-red-500 text-center mt-4">No autorizado</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dirigentes Registrados</h1>
        <p className="text-gray-400 mb-4">
          Total: {dirigentes.length} dirigentes
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4"
          onClick={() => navigate("/admin/dirigentes/create")}
        >
          ➕ Crear Dirigente
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando dirigentes...</p>
        </div>
      ) : dirigentes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No hay dirigentes registrados aún
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dirigentes.map((dirigente) => (
            <Card key={dirigente.ci} className="px-7 py-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {dirigente.nombre} {dirigente.apellido}
                </h2>
                <p className="text-sm text-gray-400 mb-3">
                  C.I.: {dirigente.ci}
                </p>

                {dirigente.email && (
                  <p className="text-sm text-blue-400 mb-1">
                    <strong>Email:</strong> {dirigente.email}
                  </p>
                )}

                {dirigente.unidad && (
                  <p className="text-sm text-gray-300 mb-1">
                    <strong>Unidad:</strong> {dirigente.unidad}
                  </p>
                )}

                {dirigente.nivel_formacion && (
                  <p className="text-sm text-gray-300 mb-1">
                    <strong>Nivel de Formación:</strong>{" "}
                    {dirigente.nivel_formacion}
                  </p>
                )}

                <div className="mt-3 p-2 bg-gray-700 rounded">
                  <p className="text-sm">
                    <strong>Envío:</strong>{" "}
                    <span className="text-gray-300 ml-1">
                      {dirigente.envio || "Sin especificar"}
                    </span>
                  </p>
                </div>

                <p className="text-sm mt-2">
                  <strong>Colaborador:</strong>{" "}
                  <span
                    className={
                      dirigente.es_colaborador
                        ? "text-green-400"
                        : "text-gray-400"
                    }
                  >
                    {dirigente.es_colaborador ? "✓ Sí" : "✗ No"}
                  </span>
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Registrado:{" "}
                  {new Date(dirigente.create_at).toLocaleDateString("es-ES")}
                </p>
              </div>

              <div className="my-4 flex justify-end gap-x-2">
                <Button
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => handleDelete(dirigente.ci)}
                >
                  <PiTrashSimpleLight className="text-white" />
                  Eliminar
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    navigate(`/admin/dirigentes/${dirigente.ci}/edit`)
                  }
                >
                  <BiPencil className="text-white" />
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDirigentesPage;
