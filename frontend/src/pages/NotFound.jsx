import { Link } from "react-router-dom";
import { Card } from "../components/ui";
function NotFound() {
  return (
    <div className="page-shell flex min-h-[65vh] items-center justify-center">
      <Card className="w-full max-w-xl text-center py-12 sm:py-16">
        <p
          className="text-7xl font-semibold text-[#c1b2f3] mb-6"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3">
          Página no encontrada
        </h1>
        <p className="page-description mx-auto mb-8">
          La dirección que buscas no está disponible. Vuelve al inicio para
          continuar.
        </p>
        <Link to="/" className="button-primary inline-flex">
          Volver al inicio
        </Link>
      </Card>
    </div>
  );
}

export default NotFound;
