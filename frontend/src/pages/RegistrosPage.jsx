import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, ConfirmModal } from "../components/ui/index.js";
import { useRegistro } from "../context/registroContex";
import { useAuth } from "../context/AuthContext";
import { PiTrashSimpleLight } from "react-icons/pi";
import { BiPencil } from "react-icons/bi";
import { formatDate } from "../utils/formatDate";

function RegistrosPage() {
  const navigate = useNavigate();
  const {
    registros,
    loadRegistros,
    deleteRegistro,
    errors,
    setErrors,
    unidades,
    loadUnidades,
  } = useRegistro();
  const { user } = useAuth();
  const [unidadFiltro, setUnidadFiltro] = useState("Todas");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // unidades ahora viene del provider; mostrar 'Todas' por defecto
  const opcionesUnidades = ["Todas", ...(unidades || [])];

  const registrosFiltrados = useMemo(() => {
    if (!user?.is_admin) return registros;
    if (!unidadFiltro || unidadFiltro === "Todas") return registros;
    return registros.filter((r) => r.unidad === unidadFiltro);
  }, [registros, unidadFiltro, user]);

  useEffect(() => {
    setErrors([]);
    loadRegistros();
    if (user?.is_admin && typeof loadUnidades === "function") loadUnidades();
  }, []);

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const executeDelete = async () => {
    await deleteRegistro(confirmDelete);
    setConfirmDelete(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Registros</h1>
        {user?.is_admin && (
          <div className="mb-4">
            <label className="mr-2 text-sm text-gray-200">
              Filtrar unidad:
            </label>
            <select
              value={unidadFiltro}
              onChange={(e) => setUnidadFiltro(e.target.value)}
              className="px-2 py-1 rounded bg-gray-700 text-white"
            >
              {opcionesUnidades.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        )}
        {errors.map((error, i) => (
          <p className="text-red-500 mb-4" key={i}>
            {error}
          </p>
        ))}
        <Button
          onClick={() => navigate("/scouts/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4"
        >
          ➕ Nuevo Registro
        </Button>
      </div>

      {/* Lista de registros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {registrosFiltrados.map((registro) => (
          <Card key={registro.id} className="px-7 py-4">
            <div>
              <h2 className="text-xl font-bold mb-2 text-white">
                Registro #{registro.id}
              </h2>

              <p className="text-sm text-white mb-1">
                <strong>Scout:</strong>{" "}
                {registro.scout_nombre && registro.scout_apellido
                  ? `${registro.scout_nombre} ${registro.scout_apellido}`
                  : `CI: ${registro.scout_ci}`}
              </p>
              {registro.unidad && (
                <p className="text-sm text-white">
                  <strong>Unidad:</strong> {registro.unidad}
                </p>
              )}
              {registro.etapa_progresion && (
                <p className="text-sm text-white">
                  <strong>Etapa:</strong> {registro.etapa_progresion}
                </p>
              )}
              {registro.colegio && (
                <p className="text-sm text-white">
                  <strong>Colegio:</strong> {registro.colegio}
                </p>
              )}
              {registro.curso && (
                <p className="text-sm text-white">
                  <strong>Curso:</strong> {registro.curso}
                </p>
              )}

              {(registro.numero_deposito || registro.monto) && (
                <div className="mt-2 p-2">
                  {registro.numero_deposito && (
                    <p className="text-sm text-white">
                      <strong>Depósito:</strong> {registro.numero_deposito}
                    </p>
                  )}
                  {registro.fecha_deposito && (
                    <p className="text-sm text-white">
                      <strong>Fecha:</strong>{" "}
                      {formatDate(registro.fecha_deposito)}
                    </p>
                  )}
                  {registro.hora_deposito && (
                    <p className="text-sm text-white">
                      <strong>Hora:</strong> {registro.hora_deposito}
                    </p>
                  )}
                  {registro.monto && (
                    <p className="text-sm text-white">
                      <strong>Monto:</strong> ${registro.monto}
                    </p>
                  )}
                </div>
              )}

              {registro.envio && (
                <p className="text-sm mt-2 text-white">
                  📦 <strong>Envío:</strong> {registro.envio}
                </p>
              )}

              {(registro.contacto_nombre ||
                registro.contacto_parentesco ||
                registro.contacto_celular) && (
                <div className="mt-2 p-2">
                  {registro.contacto_nombre && (
                    <p className="text-sm text-white">
                      <strong>Nombre:</strong> {registro.contacto_nombre}
                    </p>
                  )}
                  {registro.contacto_parentesco && (
                    <p className="text-sm text-white">
                      <strong>Parentesco:</strong>{" "}
                      {registro.contacto_parentesco}
                    </p>
                  )}
                  {registro.contacto_celular && (
                    <p className="text-sm text-white">
                      <strong>Celular:</strong> {registro.contacto_celular}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="my-2 flex justify-end gap-x-2">
              <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={() => handleDelete(registro.id)}
              >
                <PiTrashSimpleLight className="text-white" />
                Eliminar
              </Button>
              <Button
                onClick={() => navigate(`/scouts/${registro.scout_ci}/edit`)}
              >
                <BiPencil className="text-white" />
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {registros.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay registros. ¡Crea uno nuevo!
          </p>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Eliminar registro"
        message="¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer."
        variant="danger"
        confirmText="Eliminar"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default RegistrosPage;
