import React, { useState, useEffect } from "react";
import { Card, Input, Label, Button } from "../components/ui";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useScout } from "../context/scoutContex.jsx";
import { getPadronByCi } from "../api/padron.api";

function ScoutFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({ mode: "onSubmit" });
  const navigate = useNavigate();
  const {
    createScout,
    loadScout,
    errors: ScoutErrors,
    updateScout,
    setErrors,
  } = useScout();
  const params = useParams();
  const esBeca = watch("es_beca");
  const [padronMsg, setPadronMsg] = useState(null);

  const handleCiBlur = async (e) => {
    if (params.ci) return; // no auto-fill al editar
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
      setValue("sexo", p.sexo || "M");
      setValue("unidad", p.unidad || "");
      setValue("colegio", p.colegio || "");
      if (p.contacto_nombre || p.contacto_parentesco) {
        setValue(
          "contacto_emergencia_nombre_parentesco",
          [p.contacto_nombre, p.contacto_parentesco]
            .filter(Boolean)
            .join(" - "),
        );
      }
      setValue("contacto_emergencia_celular", p.contacto_celular || "");
      setPadronMsg({ type: "ok", text: "✓ Datos cargados desde el padrón" });
    } catch {
      setPadronMsg({
        type: "warn",
        text: "CI no encontrado en el padrón — completar manualmente",
      });
    }
    setTimeout(() => setPadronMsg(null), 4000);
  };

  const onSubmit = handleSubmit(async (data) => {
    setErrors([]);
    // Sanear tipos antes de enviar
    const payload = {
      ...data,
      monto:
        data.monto === "" || data.monto === undefined || isNaN(data.monto)
          ? null
          : Number(data.monto),
      es_beca: data.es_beca === true || data.es_beca === "true",
      fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento : null,
      fecha_deposito: data.fecha_deposito ? data.fecha_deposito : null,
    };
    let scout;
    if (!params.ci) {
      scout = await createScout(payload);
    } else {
      scout = await updateScout(params.ci, payload);
    }
    if (scout) {
      navigate("/scouts");
    }
  }, () => {
    // Al fallar validación, scroll al primer error
    setTimeout(() => {
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  });

  useEffect(() => {
    setErrors([]);
    if (params.ci) {
      loadScout(params.ci).then((scout) => {
        reset({
          ci: scout.ci,
          primer_nombre: scout.primer_nombre,
          segundo_nombre: scout.segundo_nombre,
          primer_apellido: scout.primer_apellido,
          segundo_apellido: scout.segundo_apellido,
          fecha_nacimiento: scout.fecha_nacimiento
            ? new Date(scout.fecha_nacimiento).toISOString().slice(0, 10)
            : undefined,
          sexo: scout.sexo ?? "M",
          grupo: scout.grupo,
          rama: scout.rama ?? "",
          unidad: scout.unidad ?? "",
          etapa: scout.etapa,
          curso: scout.curso,
          colegio: scout.colegio,
          numero_deposito: scout.numero_deposito,
          monto: scout.monto,
          es_beca: scout.es_beca,
          tipo_beca: scout.tipo_beca,
          contacto_emergencia_nombre_parentesco:
            scout.contacto_emergencia_nombre_parentesco,
          contacto_emergencia_celular: scout.contacto_emergencia_celular,
          fecha_deposito: scout.fecha_deposito
            ? new Date(scout.fecha_deposito).toISOString().slice(0, 10)
            : undefined,
          hora_deposito: scout.hora_deposito,
          envio: scout.envio,
        });
      });
    } else {
      setValue("grupo", "PANDA");
    }
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "ci") {
        setErrors([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="min-h-screen flex justify-center items-center p-4">
      <Card className="w-full max-w-2xl">
        {ScoutErrors.map((error, i) => (
          <p className="text-red-500 mb-4" key={i}>
            {error}
          </p>
        ))}
        <h2 className="text-2xl font-bold mb-6">
          {params.ci ? "Editar Scout" : "Registrar Scout"}
        </h2>
        {Object.keys(errors).length > 0 && (
          <p className="text-red-500 bg-red-500/10 p-3 rounded mb-4 text-sm">
            Hay campos requeridos sin completar. Revisa el formulario.
          </p>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* C.I. */}
          <div>
            <Label htmlFor="ci">Carnet de identidad</Label>
            <Input
              placeholder="Ingresa el CI"
              type="text"
              {...register("ci", { required: "El CI es requerido" })}
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

          {/* Nombres */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primer_nombre">Primer Nombre</Label>
              <Input
                placeholder="Primer nombre"
                {...register("primer_nombre", { required: "Es requerido" })}
              />
              {errors.primer_nombre && (
                <p className="text-red-500 text-sm">
                  {errors.primer_nombre.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="segundo_nombre">Segundo Nombre</Label>
              <Input
                placeholder="Segundo nombre (opcional)"
                {...register("segundo_nombre")}
              />
            </div>
          </div>

          {/* Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primer_apellido">Primer Apellido</Label>
              <Input
                placeholder="Primer apellido"
                {...register("primer_apellido", { required: "Es requerido" })}
              />
              {errors.primer_apellido && (
                <p className="text-red-500 text-sm">
                  {errors.primer_apellido.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
              <Input
                placeholder="Segundo apellido (opcional)"
                {...register("segundo_apellido")}
              />
            </div>
          </div>

          {/* Fecha de nacimiento y Sexo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                type="date"
                {...register("fecha_nacimiento", { required: "Es requerida" })}
              />
              {errors.fecha_nacimiento && (
                <p className="text-red-500 text-sm">
                  {errors.fecha_nacimiento.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="sexo">Sexo</Label>
              <select
                {...register("sexo", { required: "Es requerido" })}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="M" className="text-gray-800">
                  Masculino
                </option>
                <option value="F" className="text-gray-800">
                  Femenino
                </option>
              </select>
              {errors.sexo && (
                <p className="text-red-500 text-sm">{errors.sexo.message}</p>
              )}
            </div>
          </div>

          {/* Grupo y Rama */}
          <div>
            <Label htmlFor="rama">Rama</Label>
            <select
              {...register("rama", { required: "Es requerida" })}
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar Rama</option>
              <option value="Lobatos">Lobatos</option>
              <option value="Exploradores">Exploradores</option>
              <option value="Pioneros">Pioneros</option>
              <option value="Rovers">Rovers</option>
            </select>
            {errors.rama && (
              <p className="text-red-500 text-sm">{errors.rama.message}</p>
            )}
          </div>

          {/* Unidad y Etapa */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unidad">Unidad</Label>
              <select
                {...register("unidad", { required: "Es requerida" })}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar Unidad</option>
                <option value="Hathi">Hathi</option>
                <option value="Jacala">Jacala</option>
                <option value="Castores">Castores</option>
                <option value="Halcones">Halcones</option>
                <option value="Tiburones">Tiburones</option>
                <option value="Locotos">Locotos</option>
                <option value="Clan Destino">Clan Destino</option>
              </select>
              {errors.unidad && (
                <p className="text-red-500 text-sm">{errors.unidad.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="etapa">Etapa</Label>
              <Input
                placeholder="Ingresa la etapa"
                {...register("etapa", { required: "Es requerida" })}
              />
              {errors.etapa && (
                <p className="text-red-500 text-sm">{errors.etapa.message}</p>
              )}
            </div>
          </div>

          {/* Curso y Colegio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="curso">Curso</Label>
              <Input
                placeholder="Ingresa el curso (opcional)"
                {...register("curso")}
              />
            </div>
            <div>
              <Label htmlFor="colegio">Colegio</Label>
              <Input
                placeholder="Ingresa el colegio (opcional)"
                {...register("colegio")}
              />
            </div>
          </div>

          {/* Número de Depósito y Monto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero_deposito">Número de Depósito</Label>
              <Input
                placeholder="Número de depósito (opcional)"
                {...register("numero_deposito")}
              />
            </div>
            <div>
              <Label htmlFor="monto">Monto</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Monto (opcional)"
                {...register("monto", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Fecha y Hora de Depósito */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha_deposito">Fecha de Depósito</Label>
              <Input type="date" {...register("fecha_deposito")} />
            </div>
            <div>
              <Label htmlFor="hora_deposito">Hora de Depósito</Label>
              <Input
                type="time"
                {...register("hora_deposito", {
                  required: "La hora es requerida",
                })}
              />
              {errors.hora_deposito && (
                <p className="text-red-500 text-sm">
                  {errors.hora_deposito.message}
                </p>
              )}
            </div>
          </div>

          {/* Envío */}
          <div>
            <Label htmlFor="envio">Envio</Label>
            <Input placeholder="Envio (opcional)" {...register("envio")} />
          </div>

          {/* Beca */}
          <div>
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("es_beca")}
                className="w-4 h-4"
              />
              <span>¿Es beca?</span>
            </Label>
          </div>

          {/* Tipo de Beca (condicional) */}
          {esBeca && (
            <div>
              <Label htmlFor="tipo_beca">Tipo de Beca</Label>
              <Input
                placeholder="Ingresa el tipo de beca"
                {...register("tipo_beca")}
              />
            </div>
          )}

          {/* Contacto de Emergencia */}
          <div>
            <Label htmlFor="contacto_emergencia_nombre_parentesco">
              Contacto de Emergencia (Nombre y Parentesco)
            </Label>
            <Input
              placeholder="Nombre completo y parentesco (ej: María García - Madre)"
              {...register("contacto_emergencia_nombre_parentesco")}
            />
          </div>

          {/* Celular de Emergencia */}
          <div>
            <Label htmlFor="contacto_emergencia_celular">
              Número de Celular de Emergencia
            </Label>
            <Input
              placeholder="Número de celular"
              {...register("contacto_emergencia_celular")}
            />
          </div>

          {/* Botón Submit */}
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2">
            {params.ci ? "Editar Scout" : "Registrar Scout"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default ScoutFormPage;
