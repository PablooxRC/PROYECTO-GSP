import React, { useEffect, useState } from "react";
import FormCloseButton from "../components/ui/FormCloseButton";
import { Card, Input, Label, Button, Alert } from "../components/ui";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";

function AdminCreatePage() {
  const navigate = useNavigate();
  const { user, setErrors } = useAuth();
  const [alert, setAlert] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (setErrors) setErrors(null);
  }, [setErrors]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axios.post("/admin", data);
      setAlert({ type: "success", message: "Admin creado correctamente" });
      setTimeout(() => navigate("/admin/dirigentes"), 1500);
    } catch (err) {
      setAlert({
        type: "error",
        message: getErrorMessage(err, "Error al crear admin"),
      });
    }
  });

  if (!user?.is_admin) return <p className="text-red-500">No autorizado</p>;

  return (
    <div className="page-shell flex justify-center">
      <Card className="section-panel w-full max-w-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <h2 className="page-title">Crear administrador</h2>
          <FormCloseButton to="/admin/dirigentes" />
        </div>
        <p className="page-description mb-8">
          Configura los datos de acceso y la unidad del nuevo administrador.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input {...register("nombre", { required: true })} />
            {errors.nombre && (
              <p className="text-red-500 text-sm">Nombre es requerido</p>
            )}
          </div>

          <div>
            <Label>Apellido</Label>
            <Input {...register("apellido")} />
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email", { required: true })} />
            {errors.email && (
              <p className="text-red-500 text-sm">Email es requerido</p>
            )}
          </div>

          <div>
            <Label>Unidad</Label>
            <select {...register("unidad")} className="form-input">
              <option value="">Seleccionar Unidad</option>
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
            <Label>Contraseña</Label>
            <Input
              type="password"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">Password es requerido</p>
            )}
          </div>

          <Button className="button-primary w-full mt-6">Crear Admin</Button>
        </form>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
      </Card>
    </div>
  );
}

export default AdminCreatePage;
