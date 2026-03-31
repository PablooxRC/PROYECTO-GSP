import { Link } from "react-router-dom";
import { Card } from "../components/ui";
function NotFound() {
  return (
    <div className="h-[calc(100vh-64px)] flex justify-center items-center">
      <Card>
        <h1 className="text-4xl">Pagina no encontrada</h1>
        <h3 className="text-2xl">404</h3>
        <Link to="/"> Volver a la página principal</Link>
      </Card>
    </div>
  );
}

export default NotFound;
