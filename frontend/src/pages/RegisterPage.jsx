import { Button, Input, Card, Label } from "../components/ui/Index.js";
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
    <div className="h-[calc(100vh-64px)] flex items-center justify-center">
      <Card>
        {signupErrors && signupErrors.length > 0 && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {signupErrors.map((err, index) => (
              <p key={index} className="mb-1">
                {err}
              </p>
            ))}
          </div>
        )}
        <h3 className="text-2xl font-bold"> Registrarse</h3>
        <form onSubmit={onSubmit}>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            placeholder="Ingresa tu email"
            {...register("email", {
              required: true,
            })}
          />
          {errors.email && (
            <p className="text-red-500"> El email es requerido</p>
          )}
          <Label htmlFor="password">Contraseña</Label>
          <Input
            type="password"
            placeholder="Ingresa tu contraseña"
            {...register("password", {
              required: true,
            })}
          />
          {errors.password && (
            <p className="text-red-500"> La contraseña es requerida</p>
          )}
          <Label htmlFor="unidad">Unidad</Label>
          <select
            {...register("unidad", {
              required: true,
            })}
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
            <p className="text-red-500"> La unidad es requerida</p>
          )}
          <Button>Registrar</Button>
          <div className="flex justify-between my-4">
            <p>¿Ya tienes una cuenta?</p>
            <Link to="/login" className="font-bold">
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
