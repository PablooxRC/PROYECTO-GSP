import { useEffect, useState } from "react";
import { Button, Card, ConfirmModal, Alert } from "../components/ui";
import { useScout } from "../context/scoutContex.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PiTrashSimpleLight } from "react-icons/pi";
import { BiPencil } from "react-icons/bi";
import { getErrorMessage } from "../utils/getErrorMessage";

function ScoutPage() {
  const { scouts, loadscouts, deleteScout } = useScout();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [toDelete, setToDelete] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadscouts();
  }, []);

  const handleDeleteClick = (scout) => {
    setToDelete(scout);
  };

  const confirmDeleteAction = async () => {
    try {
      await deleteScout(toDelete.ci);
      setToDelete(null);
      await loadscouts();
      setAlert({ type: "success", message: "Scout eliminado correctamente" });
    } catch (err) {
      setToDelete(null);
      setAlert({
        type: "error",
        message: getErrorMessage(err, "Error eliminando scout"),
      });
    }
  };

  const cancelDelete = () => {
    setToDelete(null);
  };

  function handlePrintReport() {
    const printWindow = window.open("", "", "width=800,height=600");
    const htmlContent = `
      <html>
        <head>
          <title>Reporte de Scouts</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1>Reporte de Scouts - Unidad: ${user?.unidad || "No disponible"}</h1>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>C.I.</th>
                <th>Puntaje</th>
                <th>Preguntas mal contestadas</th>
              </tr>
            </thead>
            <tbody>
              ${scouts
                .map(
                  (scout) => `
                <tr>
                  <td>${scout.nombre}</td>
                  <td>${scout.apellido}</td>
                  <td>${scout.ci}</td>
                  <td>${scout.puntaje ?? 0}</td>
                  <td>${scout.preguntas_mal_contestadas ?? 0}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  return (
    <div className="relative">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold dark:text-white py-4">
          Unidad: {user?.unidad || "No disponible"}
        </h1>
      </div>

      {/* Confirm Modal para eliminación */}
      <ConfirmModal
        isOpen={!!toDelete}
        title="Confirmar eliminación"
        message={
          toDelete
            ? `¿Estás seguro de que deseas eliminar a ${toDelete.nombre} ${toDelete.apellido} (C.I.: ${toDelete.ci})? Esta acción no se puede deshacer.`
            : ""
        }
        variant="danger"
        confirmText="Eliminar"
        onConfirm={confirmDeleteAction}
        onCancel={cancelDelete}
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Acciones */}
      <div className="mb-4 flex gap-4">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handlePrintReport}
        >
          Imprimir Reporte de Scouts
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scouts.map((scout) => (
          <Card key={scout.ci} className="px-5 py-4">
            <div>
              <h1 className="text-xl font-bold break-words">
                {scout.nombre} {scout.apellido}
              </h1>
              <p>{scout.ci}</p>
              <p>Puntaje: {scout.puntaje ?? 0}</p>
              <p>
                Preguntas mal contestadas:{" "}
                {scout.preguntas_mal_contestadas ?? 0}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                className="bg-red-500 hover:bg-red-600 flex-1 min-w-0 justify-center"
                onClick={() => handleDeleteClick(scout)}
              >
                <PiTrashSimpleLight className="text-white" />
                Eliminar
              </Button>
              <Button
                className="flex-1 min-w-0 justify-center"
                onClick={() => navigate(`/scouts/${scout.ci}/edit`)}>
                <BiPencil className="text-white" />
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ScoutPage;
