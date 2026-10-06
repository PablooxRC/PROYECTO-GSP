import { useEffect, useState } from "react";
import usePaginatedList from "../hooks/usePaginatedList";
import Pagination from "../components/ui/Pagination";
import { useNavigate } from "react-router-dom";
import { Card, Button, ConfirmModal } from "../components/ui";
import { useRegistro } from "../context/registroContex";
import { useAuth } from "../context/AuthContext";
import { PiTrashSimpleLight } from "react-icons/pi";
import { BiPencil } from "react-icons/bi";
import { formatDate } from "../utils/formatDate";

function RegistrosPage() {
  const navigate = useNavigate();
  const { deleteRegistro, errors, setErrors, unidades, loadUnidades } =
    useRegistro();
  const { user } = useAuth();
  const [unidadFiltro, setUnidadFiltro] = useState("Todas");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [dates, setDates] = useState({});
  const paging = usePaginatedList("/registros", {
    ...dates,
    unidad: unidadFiltro,
  });
  const registros = paging.items;

  // unidades ahora viene del provider; mostrar 'Todas' por defecto
  const opcionesUnidades = ["Todas", ...(unidades || [])];

  const registrosFiltrados = registros;

  const handleFiltrar = () => {
    setErrors([]);
    setDates({ from: fechaDesde || undefined, to: fechaHasta || undefined });
  };

  const handleLimpiar = () => {
    setFechaDesde("");
    setFechaHasta("");
    setErrors([]);
    setDates({});
    setUnidadFiltro("Todas");
  };

  useEffect(() => {
    setErrors([]);
    if (user?.is_admin && typeof loadUnidades === "function") loadUnidades();
  }, [setErrors, loadUnidades, user?.is_admin]);

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const executeDelete = async () => {
    await deleteRegistro(confirmDelete);
    paging.refresh();
    setConfirmDelete(null);
  };

  return (
    <div className="page-shell">
      <div className="mb-8">
        <h1 className="page-title mb-4">Registros</h1>
        <p className="page-description mb-6">
          Consulta las inscripciones y filtra por fecha o unidad.
        </p>

        {/* Filtros */}
        <div className="filter-bar flex flex-wrap items-end gap-4 mb-5">
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:min-w-40 sm:flex-1">
            <label className="data-label">Fecha desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:min-w-40 sm:flex-1">
            <label className="data-label">Fecha hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="form-input"
            />
          </div>
          {user?.is_admin && (
            <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:min-w-40 sm:flex-1">
              <label className="data-label">Unidad</label>
              <select
                value={unidadFiltro}
                onChange={(e) => setUnidadFiltro(e.target.value)}
                className="form-input"
              >
                {opcionesUnidades.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button onClick={handleFiltrar} className="button-primary">
            Filtrar
          </button>
          {(fechaDesde || fechaHasta) && (
            <button onClick={handleLimpiar} className="button-secondary">
              Limpiar
            </button>
          )}
        </div>
        {errors.map((error, i) => (
          <p className="text-red-500 mb-4" key={i}>
            {error}
          </p>
        ))}
        <Button
          onClick={() => navigate("/scouts/new")}
          className="button-primary"
        >
          Nuevo registro
        </Button>
      </div>

      {/* Lista de registros */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {registrosFiltrados.map((registro) => (
          <Card key={registro.id} className="data-card flex flex-col">
            <div className="flex-1 pb-5 space-y-2 break-words">
              <h2 className="text-lg font-semibold mb-4 text-[#f1f3fa]">
                Registro #{registro.id}
              </h2>

              <p className="text-sm text-[#a5afc2] mb-1">
                <strong>Scout:</strong>{" "}
                {registro.scout_nombre && registro.scout_apellido
                  ? `${registro.scout_nombre} ${registro.scout_apellido}`
                  : `CI: ${registro.scout_ci}`}
              </p>
              {registro.unidad && (
                <p className="text-sm text-[#a5afc2]">
                  <strong>Unidad:</strong> {registro.unidad}
                </p>
              )}
              {registro.etapa_progresion && (
                <p className="text-sm text-[#a5afc2]">
                  <strong>Etapa:</strong> {registro.etapa_progresion}
                </p>
              )}
              {registro.colegio && (
                <p className="text-sm text-[#a5afc2]">
                  <strong>Colegio:</strong> {registro.colegio}
                </p>
              )}
              {registro.curso && (
                <p className="text-sm text-[#a5afc2]">
                  <strong>Curso:</strong> {registro.curso}
                </p>
              )}

              {(registro.numero_deposito || registro.monto) && (
                <div className="mt-4 pt-3 border-t border-[#303b50]">
                  {registro.numero_deposito && (
                    <p className="text-sm text-[#a5afc2]">
                      <strong>Depósito:</strong> {registro.numero_deposito}
                    </p>
                  )}
                  {registro.fecha_deposito && (
                    <p className="text-sm text-[#a5afc2]">
                      <strong>Fecha:</strong>{" "}
                      {formatDate(registro.fecha_deposito)}
                    </p>
                  )}
                  {registro.hora_deposito && (
                    <p className="text-sm text-[#a5afc2]">
                      <strong>Hora:</strong> {registro.hora_deposito}
                    </p>
                  )}
                  {registro.monto && (
                    <p className="text-sm text-[#a5afc2]">
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
                <div className="mt-4 pt-3 border-t border-[#303b50]">
                  {registro.contacto_nombre && (
                    <p className="text-sm text-[#a5afc2]">
                      <strong>Nombre:</strong> {registro.contacto_nombre}
                    </p>
                  )}
                  {registro.contacto_parentesco && (
                    <p className="text-sm text-[#a5afc2]">
                      <strong>Parentesco:</strong>{" "}
                      {registro.contacto_parentesco}
                    </p>
                  )}
                  {registro.contacto_celular && (
                    <p className="text-sm text-[#a5afc2]">
                      <strong>Celular:</strong> {registro.contacto_celular}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-auto pt-5 flex flex-wrap justify-end gap-2 border-t border-[#303b50]">
              <Button
                className="button-danger"
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
        <div className="empty-state">
          <p className="text-[#a5afc2] text-lg">
            No hay registros. ¡Crea uno nuevo!
          </p>
        </div>
      )}

      <Pagination {...paging} />

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
