import React, { useEffect } from "react";
import { Card, Input, Label, Button } from "../components/ui";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

function AdminDirigenteCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    setValue("grupo", "PANDA");
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axios.post("/admin/dirigentes", data);
      navigate("/admin/dirigentes");
    } catch (err) {
      alert(err?.response?.data?.message || "Error creando dirigente");
    }
  });

  if (!user?.is_admin) return <p className="text-red-500">No autorizado</p>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Registrar Dirigente</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Cédula de Identidad</Label>
            <Input type="number" {...register("ci", { required: true })} />
            {errors.ci && (
              <p className="text-red-500 text-sm">CI es requerido</p>
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

          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
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
              <option value="Hathi">Hathi</option>
              <option value="Jacala">Jacala</option>
              <option value="Castores">Castores</option>
              <option value="Halcones">Halcones</option>
              <option value="Tiburones">Tiburones</option>
              <option value="Locotos">Locotos</option>
              <option value="Clan Destino">Clan Destino</option>
            </select>
          </div>

          <div>
            <Label>Nivel de Formación</Label>
            <Input {...register("nivel_formacion")} />
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
              <Input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                {...register("fecha_deposito")}
              />
            </div>
            <div>
              <Label>Hora de Depósito</Label>
              <Input
                type="time"
                {...register("hora_deposito", { required: true })}
              />
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
            Registrar Dirigente
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default AdminDirigenteCreate;
