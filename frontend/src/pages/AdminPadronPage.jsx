import React, { useState } from "react";
import FormCloseButton from "../components/ui/FormCloseButton";
import {
  Card,
  Button,
  Input,
  Label,
  ConfirmModal,
  Alert,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useForm } from "react-hook-form";
import usePaginatedList from "../hooks/usePaginatedList";
import Pagination from "../components/ui/Pagination";
import { createPadron, updatePadron, deletePadron } from "../api/padron.api";

const UNIDADES = [
  "Hathi",
  "Jacala",
  "Castores",
  "Halcones",
  "Tiburones",
  "Locotos",
  "Clan Destino",
];

function AdminPadronPage() {
  const { user } = useAuth();
  const [editingCi, setEditingCi] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const paging = usePaginatedList(
    "/padron",
    { search },
    Boolean(user?.is_admin),
  );
  const { items: registros, loading, error } = paging;
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const loadData = async () => {
    paging.refresh();
  };

  const handleNew = () => {
    setEditingCi(null);
    reset({});
    setShowForm(true);
  };

  const handleEdit = (reg) => {
    setEditingCi(reg.ci);
    reset({
      ci: reg.ci,
      primer_nombre: reg.primer_nombre,
      segundo_nombre: reg.segundo_nombre,
      primer_apellido: reg.primer_apellido,
      segundo_apellido: reg.segundo_apellido,
      fecha_nacimiento: reg.fecha_nacimiento
        ? reg.fecha_nacimiento.slice(0, 10)
        : "",
      sexo: reg.sexo ?? "",
      unidad: reg.unidad ?? "",
      colegio: reg.colegio,
      nivel_formacion: reg.nivel_formacion,
      contacto_nombre: reg.contacto_nombre,
      contacto_parentesco: reg.contacto_parentesco,
      contacto_celular: reg.contacto_celular,
    });
    setShowForm(true);
  };

  const handleDelete = (ci) => {
    setConfirmDelete(ci);
  };

  const executeDelete = async () => {
    try {
      await deletePadron(confirmDelete);
      setConfirmDelete(null);
      setAlertMsg({
        type: "success",
        message: "Registro eliminado correctamente",
      });
      await loadData();
    } catch (err) {
      setConfirmDelete(null);
      setAlertMsg({
        type: "error",
        message: getErrorMessage(err, "Error eliminando registro"),
      });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingCi) {
        await updatePadron(editingCi, data);
      } else {
        await createPadron(data);
      }
      setShowForm(false);
      setEditingCi(null);
      reset({});
      await loadData();
    } catch (err) {
      setAlertMsg({
        type: "error",
        message: getErrorMessage(err, "Error guardando registro"),
      });
    }
  });

  const filtered = registros;

  if (!user?.is_admin) return <p className="text-red-500">No autorizado</p>;

  return (
    <div className="page-shell">
      <div className="page-header mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title mb-2">Padrón de Personas</h1>
          <p className="text-[#a5afc2]">
            Total: {paging.pagination.total} registros
          </p>
        </div>
        <Button className="button-primary" onClick={handleNew}>
          Agregar registro
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-400/30 text-red-300 rounded-xl">
          {error}
        </div>
      )}

      {/* FORMULARIO */}
      {showForm && (
        <Card className="section-panel mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold">
              {editingCi ? "Editar Registro" : "Nuevo Registro"}
            </h2>
            <FormCloseButton
              onClick={() => {
                setShowForm(false);
                setEditingCi(null);
                reset({});
              }}
            />
          </div>
          <form onSubmit={onSubmit} className="space-y-5">
            <h3 className="text-lg font-semibold">Datos personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>CI *</Label>
                <Input
                  {...register("ci", { required: "CI es obligatorio" })}
                  disabled={!!editingCi}
                  placeholder="Ej: 12345678"
                />
                {errors.ci && (
                  <p className="text-red-500 text-sm">{errors.ci.message}</p>
                )}
              </div>
              <div>
                <Label>Sexo</Label>
                <select {...register("sexo")} className="form-input">
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Primer Nombre *</Label>
                <Input
                  {...register("primer_nombre", { required: true })}
                  placeholder="Primer nombre"
                />
              </div>
              <div>
                <Label>Segundo Nombre</Label>
                <Input
                  {...register("segundo_nombre")}
                  placeholder="Segundo nombre"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Primer Apellido *</Label>
                <Input
                  {...register("primer_apellido", { required: true })}
                  placeholder="Primer apellido"
                />
              </div>
              <div>
                <Label>Segundo Apellido</Label>
                <Input
                  {...register("segundo_apellido")}
                  placeholder="Segundo apellido"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Nacimiento</Label>
                <Input type="date" {...register("fecha_nacimiento")} />
              </div>
              <div>
                <Label>Unidad</Label>
                <select {...register("unidad")} className="form-input">
                  <option value="">Seleccionar Unidad</option>
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Colegio</Label>
                <Input
                  {...register("colegio")}
                  placeholder="Colegio (para scouts)"
                />
              </div>
              <div>
                <Label>Nivel de Formación</Label>
                <Input
                  {...register("nivel_formacion")}
                  placeholder="Nivel de formación (para dirigentes)"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold border-t border-[#303b50] pt-6">
              Contacto de emergencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Nombre del Contacto</Label>
                <Input {...register("contacto_nombre")} placeholder="Nombre" />
              </div>
              <div>
                <Label>Parentesco</Label>
                <Input
                  {...register("contacto_parentesco")}
                  placeholder="Ej: Madre, Padre"
                />
              </div>
              <div>
                <Label>Celular Contacto</Label>
                <Input {...register("contacto_celular")} placeholder="Número" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="button-primary">
                {editingCi ? "Guardar Cambios" : "Crear Registro"}
              </Button>
              <Button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingCi(null);
                  reset({});
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* BUSCADOR */}
      <div className="filter-bar mb-5">
        <Input
          placeholder="Buscar por CI, nombre o apellido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLA */}
      {loading ? (
        <p className="text-[#a5afc2] empty-state">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card className="empty-state">
          <p className="text-[#a5afc2]">No se encontraron registros</p>
        </Card>
      ) : (
        <div className="table-wrap overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#171e2d] text-[#a5afc2]">
                <th className="p-3 text-left">CI</th>
                <th className="p-3 text-left">Nombre Completo</th>
                <th className="p-3 text-left">Sexo</th>
                <th className="p-3 text-left">Unidad</th>
                <th className="p-3 text-left">Colegio</th>
                <th className="p-3 text-left">Niv. Formación</th>
                <th className="p-3 text-left">Contacto</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.ci}
                  className="border-b border-[#303b50] hover:bg-[#1d2638] transition-colors"
                >
                  <td className="p-4 font-semibold tabular-nums whitespace-nowrap">
                    {r.ci}
                  </td>
                  <td className="p-3">
                    {[
                      r.primer_nombre,
                      r.segundo_nombre,
                      r.primer_apellido,
                      r.segundo_apellido,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </td>
                  <td className="p-3">{r.sexo || "-"}</td>
                  <td className="p-3">{r.unidad || "-"}</td>
                  <td className="p-3">{r.colegio || "-"}</td>
                  <td className="p-3">{r.nivel_formacion || "-"}</td>
                  <td className="p-3 text-xs">
                    {r.contacto_nombre && (
                      <span>
                        {r.contacto_nombre}
                        {r.contacto_parentesco
                          ? ` (${r.contacto_parentesco})`
                          : ""}
                      </span>
                    )}
                    {r.contacto_celular && (
                      <div className="text-[#a5afc2]">{r.contacto_celular}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(r)}
                        className="button-secondary text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(r.ci)}
                        className="button-danger text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination {...paging} />

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Eliminar registro del padrón"
        message={`¿Estás seguro de eliminar el registro con CI ${confirmDelete}?`}
        variant="danger"
        confirmText="Eliminar"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {alertMsg && (
        <Alert
          type={alertMsg.type}
          message={alertMsg.message}
          onClose={() => setAlertMsg(null)}
        />
      )}
    </div>
  );
}

export default AdminPadronPage;
