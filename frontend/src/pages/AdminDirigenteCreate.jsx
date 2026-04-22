import React, { useEffect, useState } from "react";
import { Card, Input, Label, Button, Alert } from "../components/ui";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import { getDirigente } from "../api/admin.api";
import { getPadronByCi } from "../api/padron.api";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";

function AdminDirigenteCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = useParams();
  const [padronMsg, setPadronMsg] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  const handleCiBlur = async (e) => {
    if (params.ci) return;
    const ci = e.target.value.trim();
    if (!ci) return;
    try {
      const res = await getPadronByCi(ci);
      const p = res.data;
      setValue("primer_nombre", p.primer_nombre || "");
      setValue("segundo_nombre", p.segundo_nombre || "");
      setValue("primer_apellido", p.primer_apellido || "");
      setValue("segundo_apellido", p.segundo_apellido || "");
      setValue(
        "fecha_nacimiento",
        p.fecha_nacimiento ? p.fecha_nacimiento.slice(0, 10) : "",
      );
      setValue("sexo", p.sexo || "");
      setValue("unidad", p.unidad || "");
      setPadronMsg({ type: "ok", text: "✓ Datos cargados desde el padrón" });
    } catch {
      setPadronMsg({
        type: "warn",
        text: "CI no encontrado en el padrón — completar manualmente",
      });
    }
    setTimeout(() => setPadronMsg(null), 4000);
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    setValue("grupo", "PANDA");
    if (params.ci) {
      loadDirigente(params.ci);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.ci]);

  const loadDirigente = async (ci) => {
    try {
      const response = await getDirigente(ci);
      const d = response.data;
      reset({
        ci: d.ci,
        primer_nombre: d.primer_nombre,
        segundo_nombre: d.segundo_nombre,
        primer_apellido: d.primer_apellido,
        segundo_apellido: d.segundo_apellido,
        email: d.email,
        profesion_ocupacion: d.profesion_ocupacion ?? "",
        fecha_nacimiento: d.fecha_nacimiento
          ? new Date(d.fecha_nacimiento).toISOString().slice(0, 10)
          : "",
        sexo: d.sexo ?? "",
        unidad: d.unidad ?? "",
        grupo: d.grupo,
        nivel_formacion: d.nivel_formacion,
        cargo_1: d.cargo_1 ?? "",
        cargo_2: d.cargo_2 ?? "",
        numero_deposito: d.numero_deposito,
        monto: d.monto,
        fecha_deposito: d.fecha_deposito
          ? new Date(d.fecha_deposito).toISOString().slice(0, 10)
          : "",
        hora_deposito: d.hora_deposito,
        envio: d.envio,
        es_colaborador: d.es_colaborador,
      });
    } catch (err) {
      console.error("Error cargando dirigente:", err);
      setAlertMsg({
        type: "error",
        message: "Error cargando datos del dirigente",
      });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Asegurar que datos críticos sean del tipo correcto y undefined se convierta a null
      const submitData = {
        ...data,
        monto: data.monto ? parseFloat(data.monto) : null,
        es_colaborador: data.es_colaborador ? true : false,
        fecha_deposito: data.fecha_deposito || null,
        fecha_nacimiento: data.fecha_nacimiento || null,
        segundo_nombre: data.segundo_nombre || null,
        segundo_apellido: data.segundo_apellido || null,
        email: data.email || null,
        profesion_ocupacion: data.profesion_ocupacion || null,
        nivel_formacion: data.nivel_formacion || null,
        cargo_1: data.cargo_1 || null,
        cargo_2: data.cargo_2 || null,
        numero_deposito: data.numero_deposito || null,
        hora_deposito: data.hora_deposito || null,
        envio: data.envio || null,
      };

      if (params.ci) {
        // Editar dirigente existente
        await axios.put(`/admin/dirigentes/${params.ci}`, submitData);
      } else {
        // Crear nuevo dirigente
        await axios.post("/admin/dirigentes", submitData);
      }
      setAlertMsg({
        type: "success",
        message: params.ci
          ? "Dirigente actualizado correctamente"
          : "Dirigente creado correctamente",
      });
      setTimeout(() => navigate("/admin/dirigentes"), 1500);
    } catch (err) {
      setAlertMsg({
        type: "error",
        message: getErrorMessage(err, "Error guardando dirigente"),
      });
    }
  });

  if (!user?.is_admin) return <p className="text-red-500">No autorizado</p>;

  const pageTitle = params.ci ? "Editar Dirigente" : "Registrar Dirigente";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{pageTitle}</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Cédula de Identidad</Label>
            <Input
              type="text"
              {...register("ci", { required: "CI es obligatorio" })}
              disabled={!!params.ci}
              placeholder="Ej: 12345678"
              onBlur={handleCiBlur}
            />
            {padronMsg && (
              <p
                className={`text-sm mt-1 ${padronMsg.type === "ok" ? "text-green-400" : "text-yellow-400"}`}
              >
                {padronMsg.text}
              </p>
            )}
            {errors.ci && (
              <p className="text-red-500 text-sm">{errors.ci.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primer Nombre</Label>
              <Input {...register("primer_nombre", { required: true })} />
            </div>
            <div>
              <Label>Segundo Nombre</Label>
              <Input {...register("segundo_nombre")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primer Apellido</Label>
              <Input {...register("primer_apellido", { required: true })} />
            </div>
            <div>
              <Label>Segundo Apellido</Label>
              <Input {...register("segundo_apellido")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Correo</Label>
              <Input type="email" {...register("email")} placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <Label>Profesion u Ocupacion</Label>
              <Input {...register("profesion_ocupacion")} placeholder="Ej: Ingeniera, Docente" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Nacimiento</Label>
              <Input type="date" {...register("fecha_nacimiento")} />
            </div>
            <div>
              <Label>Sexo</Label>
              <select
                className="w-full p-2 rounded bg-gray-700 text-white"
                {...register("sexo")}
              >
                <option value="">Seleccionar</option>
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Unidad</Label>
            <select
              {...register("unidad")}
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar Unidad</option>
              <option value="Sin unidad">Sin unidad</option>
              <option value="Hathi">Hathi</option>
              <option value="Jacala">Jacala</option>
              <option value="Castores">Castores</option>
              <option value="Halcones">Halcones</option>
              <option value="Tiburones">Tiburones</option>
              <option value="Locotos">Locotos</option>
              <option value="Clan Destino">Clan Destino</option>
              <option value="Dirigente Institucional">
                Dirigente Institucional
              </option>
            </select>
          </div>

          <div>
            <Label>Grupo</Label>
            <Input {...register("grupo")} />
          </div>

          <div>
            <Label>Nivel de Formación</Label>
            <Input {...register("nivel_formacion")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cargo 1</Label>
              <Input {...register("cargo_1")} placeholder="Ej: Jefe de Unidad" />
            </div>
            <div>
              <Label>Cargo 2</Label>
              <Input {...register("cargo_2")} placeholder="Ej: Secretario" />
            </div>
          </div>

          {/* Número de Depósito y Monto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Número de Depósito</Label>
              <Input {...register("numero_deposito")} />
            </div>
            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                step="0.01"
                {...register("monto", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Fecha y Hora de Depósito */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Depósito</Label>
              <Input type="date" {...register("fecha_deposito")} />
            </div>
            <div>
              <Label>Hora de Depósito</Label>
              <Input type="time" {...register("hora_deposito")} />
              {errors.hora_deposito && (
                <p className="text-red-500 text-sm">Hora es requerida</p>
              )}
            </div>
          </div>

          <div>
            <Label>Envío (Descripción)</Label>
            <Input
              {...register("envio")}
              placeholder="Ej: Primer envío, Enviado a casa, etc."
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("es_colaborador")}
                className="w-4 h-4"
              />
              <span>Es Colaborador</span>
            </Label>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2">
            {params.ci ? "Guardar Cambios" : "Registrar Dirigente"}
          </Button>
        </form>

        {alertMsg && (
          <Alert
            type={alertMsg.type}
            message={alertMsg.message}
            onClose={() => setAlertMsg(null)}
          />
        )}
      </Card>
    </div>
  );
}

export default AdminDirigenteCreate;
