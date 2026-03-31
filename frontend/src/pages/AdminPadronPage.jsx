import React, { useEffect, useState } from "react";
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
import {
  listPadron,
  createPadron,
  updatePadron,
  deletePadron,
} from "../api/padron.api";

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
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCi, setEditingCi] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await listPadron();
      setRegistros(res.data);
    } catch {
      setError("Error cargando padrón");
    } finally {
      setLoading(false);
    }
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

  const filtered = registros.filter((r) => {
    const s = search.toLowerCase();
    return (
      r.ci?.toLowerCase().includes(s) ||
      r.primer_nombre?.toLowerCase().includes(s) ||
      r.primer_apellido?.toLowerCase().includes(s)
    );
  });

  if (!user?.is_admin) return <p className="text-red-500">No autorizado</p>;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-1">Padrón de Personas</h1>
          <p className="text-gray-400">Total: {registros.length} registros</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4"
          onClick={handleNew}
        >
          ➕ Agregar Registro
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* FORMULARIO */}
      {showForm && (
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingCi ? "Editar Registro" : "Nuevo Registro"}
          </h2>
          <form onSubmit={onSubmit} className="space-y-4">
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
                <select
                  {...register("sexo")}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
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
                <select
                  {...register("unidad")}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
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
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6"
              >
                {editingCi ? "Guardar Cambios" : "Crear Registro"}
              </Button>
              <Button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6"
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
      <div className="mb-4">
        <Input
          placeholder="Buscar por CI, nombre o apellido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLA */}
      {loading ? (
        <p className="text-gray-400 text-center py-8">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-400">No se encontraron registros</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-700 text-white">
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
                  className="border-b border-gray-600 hover:bg-gray-700/50"
                >
                  <td className="p-3 font-mono font-bold">{r.ci}</td>
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
                      <div className="text-gray-400">{r.contacto_celular}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(r)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(r.ci)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
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
