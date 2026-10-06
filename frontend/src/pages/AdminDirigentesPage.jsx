import React, { useEffect, useState } from "react";
import { Card, Button, ConfirmModal, Alert } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { PiTrashSimpleLight } from "react-icons/pi";
import { BiPencil } from "react-icons/bi";
import adminApi from "../api/admin.api";
import { formatDate } from "../utils/formatDate";
import { getErrorMessage } from "../utils/getErrorMessage";
import usePaginatedList from "../hooks/usePaginatedList";
import Pagination from "../components/ui/Pagination";

function AdminDirigentesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const paging = usePaginatedList(
    "/admin/dirigentes-list",
    {},
    Boolean(user?.is_admin),
  );
  const { items: dirigentes, loading, error } = paging;
  const { refresh } = paging;
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    refresh();
  }, [location, refresh]);

  const loadDirigentes = async () => {
    paging.refresh();
  };

  const handleDelete = (ci) => {
    setConfirmDelete(ci);
  };

  const executeDelete = async () => {
    try {
      await adminApi.deleteDirigente(confirmDelete);
      setConfirmDelete(null);
      setAlert({
        type: "success",
        message: "Dirigente eliminado correctamente",
      });
      await loadDirigentes();
    } catch (err) {
      setConfirmDelete(null);
      setAlert({
        type: "error",
        message: getErrorMessage(err, "Error eliminando dirigente"),
      });
    }
  };

  if (!user?.is_admin) {
    return <p className="text-red-500 text-center mt-4">No autorizado</p>;
  }

  return (
    <div className="page-shell">
      <div className="page-header mb-8">
        <h1 className="page-title mb-2">Dirigentes Registrados</h1>
        <p className="page-description mb-4">
          Total: {paging.pagination.total} dirigentes
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-400/30 text-red-300 rounded-xl">
            {error}
          </div>
        )}

        <Button
          className="button-primary"
          onClick={() => navigate("/admin/dirigentes/create")}
        >
          Crear dirigente
        </Button>
      </div>

      {loading ? (
        <div className="empty-state">
          <p className="text-[#a5afc2]">Cargando dirigentes...</p>
        </div>
      ) : dirigentes.length === 0 ? (
        <Card className="empty-state">
          <p className="page-description mb-4">
            No hay dirigentes registrados aún
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {dirigentes.map((dirigente) => (
            <Card key={dirigente.ci} className="data-card flex flex-col">
              <div className="flex-1 pb-5 break-words">
                <h2 className="text-xl font-semibold mb-3 break-words">
                  {[
                    dirigente.primer_nombre,
                    dirigente.segundo_nombre,
                    dirigente.primer_apellido,
                    dirigente.segundo_apellido,
                  ]
                    .filter(Boolean)
                    .join(" ") || dirigente.nombre}
                </h2>
                <p className="text-sm text-[#a5afc2] mb-3">
                  C.I.: {dirigente.ci}
                </p>

                {dirigente.email && (
                  <p className="text-sm text-[#c1b2f3] mb-1">
                    <strong>Email:</strong> {dirigente.email}
                  </p>
                )}

                {dirigente.unidad && (
                  <p className="text-sm text-[#a5afc2] mb-1">
                    <strong>Unidad:</strong> {dirigente.unidad}
                  </p>
                )}

                {dirigente.nivel_formacion && (
                  <p className="text-sm text-[#a5afc2] mb-1">
                    <strong>Nivel de Formación:</strong>{" "}
                    {dirigente.nivel_formacion}
                  </p>
                )}

                <div className="mt-4 py-3 border-t border-[#303b50]">
                  <p className="text-sm">
                    <strong>Envío:</strong>{" "}
                    <span className="text-[#a5afc2] ml-1">
                      {dirigente.envio || "Sin especificar"}
                    </span>
                  </p>
                </div>

                <p className="text-sm mt-2">
                  <strong>Colaborador:</strong>{" "}
                  <span
                    className={
                      dirigente.es_colaborador
                        ? "text-[#91d1b8]"
                        : "text-[#a5afc2]"
                    }
                  >
                    {dirigente.es_colaborador ? "✓ Sí" : "✗ No"}
                  </span>
                </p>

                <p className="data-label mt-2">
                  Registrado:{" "}
                  {formatDate(dirigente.fecha_deposito || dirigente.create_at)}
                </p>
              </div>

              <div className="mt-auto pt-5 flex flex-wrap justify-end gap-2 border-t border-[#303b50]">
                <Button
                  className="button-danger"
                  onClick={() => handleDelete(dirigente.ci)}
                >
                  <PiTrashSimpleLight className="text-white" />
                  Eliminar
                </Button>
                <Button
                  className="button-secondary"
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

      <Pagination {...paging} />

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Eliminar dirigente"
        message="¿Estás seguro de eliminar este dirigente? Esta acción no se puede deshacer."
        variant="danger"
        confirmText="Eliminar"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
}

export default AdminDirigentesPage;
