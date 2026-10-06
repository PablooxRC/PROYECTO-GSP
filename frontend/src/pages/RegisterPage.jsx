import { Button, Input, Card, Label } from "../components/ui";
import FormCloseButton from "../components/ui/FormCloseButton";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signup, errors: signupErrors } = useAuth();
  const navigate = useNavigate();
  const onSubmit = handleSubmit(async (data) => {
    const user = await signup(data);
    if (user) {
      navigate("/profile");
    }
  });
  return (
    <div className="auth-shell">
      <div className="auth-intro">
        <h2 className="auth-title">
          Un espacio para
          <br /> tu comunidad scout.
        </h2>
        <p className="page-description">
          Crea tu cuenta y elige la unidad a la que perteneces para empezar.
        </p>
      </div>
      <Card className="auth-card w-full max-w-md">
        {signupErrors && signupErrors.length > 0 && (
          <div className="auth-error" role="alert">
            {signupErrors.map((err, index) => (
              <p key={index} className="mb-1">
                {err}
              </p>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl font-semibold">Crear una cuenta</h1>
          <FormCloseButton to="/login" />
        </div>
        <p className="text-sm text-[#a5afc2] mb-7">
          Completa tus datos de acceso.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            autoComplete="email"
            placeholder="Ingresa tu email"
            {...register("email", {
              required: true,
            })}
          />
          {errors.email && (
            <p className="text-sm text-[#f5a5ae]"> El email es requerido</p>
          )}
          <Label htmlFor="password">Contraseña</Label>
          <Input
            type="password"
            id="password"
            autoComplete="new-password"
            placeholder="Ingresa tu contraseña"
            {...register("password", {
              required: true,
            })}
          />
          {errors.password && (
            <p className="text-sm text-[#f5a5ae]">
              {" "}
              La contraseña es requerida
            </p>
          )}
          <Label htmlFor="unidad">Unidad</Label>
          <select
            id="unidad"
            {...register("unidad", {
              required: true,
            })}
            className="form-input w-full"
          >
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
          {errors.unidad && (
            <p className="text-sm text-[#f5a5ae]"> La unidad es requerida</p>
          )}
          <Button type="submit" className="w-full mt-4">
            Registrar
          </Button>
          <div className="auth-footer flex flex-wrap justify-center gap-2 text-sm">
            <p className="text-[#a5afc2]">¿Ya tienes una cuenta?</p>
            <Link to="/login" className="font-semibold text-[#c1b2f3]">
              {" "}
              Ingresar
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default RegisterPage;
