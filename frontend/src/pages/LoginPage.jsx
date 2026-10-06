import React from "react";
import { Card, Input, Button, Label } from "../components/ui";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  // Renombramos 'errors' de useForm a 'formErrors' para evitar conflicto con los 'errors' del contexto
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm();
  // Del useAuth hook, obtenemos la función signin y los errores específicos de login ('loginErrors')
  const { signin, errors: loginErrors, isAuth } = useAuth();
  const navigate = useNavigate();

  // Esta función se ejecuta cuando el formulario es enviado
  const onSubmit = handleSubmit(async (data) => {
    const user = await signin(data); // Llama a la función signin del contexto
    // Si 'signin' devuelve un usuario (es decir, el login fue exitoso), navega al perfil.
    // Si 'signin' devuelve null (debido a un error, como ya hemos modificado en AuthContext),
    // esta condición será falsa y NO navegará. Los errores serán mostrados por el bloque {loginErrors && ...}
    if (user) {
      navigate("/profile");
    }
  });

  return (
    <div className="auth-shell">
      <div className="auth-intro">
        <h2 className="auth-title">El grupo, más cerca.</h2>
        <p className="page-description">
          Tu espacio para acompañar las actividades y la vida de nuestra
          comunidad scout.
        </p>
      </div>
      <Card className="auth-card w-full max-w-md">
        {/* ESTE ES EL BLOQUE MODIFICADO PARA MOSTRAR LOS ERRORES DEL CONTEXTO */}
        {loginErrors && loginErrors.length > 0 && (
          <div className="auth-error" role="alert">
            {/* Aquí iteramos sobre 'loginErrors' que es el array de mensajes de error del AuthContext */}
            {loginErrors.map((err, index) => (
              <p key={index} className="mb-1">
                {err}
              </p>
            ))}
          </div>
        )}

        <h1 className="text-2xl font-semibold mb-2">Ingresar</h1>
        <p className="text-sm text-[#a5afc2] mb-7">
          Accede con el correo de tu cuenta.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <Label htmlFor="email">Email</Label>
          {/* Aquí se usan los errores de validación del formulario (formErrors) */}
          {formErrors.email && (
            <p className="text-sm text-[#f5a5ae]">El email es requerido</p>
          )}
          <Input
            type="email"
            id="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            {...register("email", {
              required: true,
            })}
          />
          <Label htmlFor="password">Contraseña</Label>
          {/* Aquí se usan los errores de validación del formulario (formErrors) */}
          {formErrors.password && (
            <p className="text-sm text-[#f5a5ae]">La contraseña es requerida</p>
          )}
          <Input
            type="password"
            id="password"
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            {...register("password", {
              required: true,
            })}
          />

          <Button type="submit" className="w-full mt-4">
            Ingresar
          </Button>
          <div className="auth-footer flex flex-wrap justify-center gap-2 text-sm">
            <p className="text-[#a5afc2]">¿No tienes una cuenta?</p>
            <Link to="/register" className="font-semibold text-[#c1b2f3]">
              {" "}
              Registrarse
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;
