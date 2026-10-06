import { useState } from "react";
import usePaginatedList from "../hooks/usePaginatedList";
import Pagination from "../components/ui/Pagination";
import api from "../api/axios";
import { Button, Card, ConfirmModal, Alert } from "../components/ui";
import { useScout } from "../context/scoutContex.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PiTrashSimpleLight } from "react-icons/pi";
import { BiPencil } from "react-icons/bi";
import { getErrorMessage } from "../utils/getErrorMessage";

function ScoutPage() {
  const { deleteScout } = useScout();
  const paging = usePaginatedList("/scouts");
  const scouts = paging.items;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [toDelete, setToDelete] = useState(null);
  const [alert, setAlert] = useState(null);

  const handleDeleteClick = (scout) => {
    setToDelete(scout);
  };

  const confirmDeleteAction = async () => {
    try {
      const result = await deleteScout(toDelete.ci);
      if (!result.success) throw new Error(result.message);
      setToDelete(null);
      paging.refresh();
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

  async function handlePrintReport() {
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;
    let allScouts;
    try {
      allScouts = (await api.get("/scouts")).data;
    } catch (error) {
      printWindow.close();
      setAlert({
        type: "error",
        message: getErrorMessage(error, "Error cargando reporte"),
      });
      return;
    }
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
              ${allScouts
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
    <div className="page-shell relative">
      {/* Encabezado */}
      <div className="page-header">
        <h1 className="page-title">
          Scouts de {user?.unidad || "No disponible"}
        </h1>
        <p className="page-description">
          Consulta los resultados y administra los scouts de tu unidad.
        </p>
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
      <div className="filter-bar mb-6 flex flex-wrap gap-4">
        <Button className="button-secondary" onClick={handlePrintReport}>
          Imprimir Reporte de Scouts
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {scouts.map((scout) => (
          <Card key={scout.ci} className="data-card flex flex-col">
            <div className="space-y-3 flex-1">
              <h2 className="text-xl font-semibold break-words">
                {scout.nombre} {scout.apellido}
              </h2>
              <p className="data-label">C.I. {scout.ci}</p>
              <p className="data-value">Puntaje: {scout.puntaje ?? 0}</p>
              <p className="data-label">
                Preguntas mal contestadas:{" "}
                {scout.preguntas_mal_contestadas ?? 0}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#303b50] flex flex-wrap gap-2">
              <Button
                className="button-danger flex-1 min-w-0 justify-center"
                onClick={() => handleDeleteClick(scout)}
              >
                <PiTrashSimpleLight className="text-white" />
                Eliminar
              </Button>
              <Button
                className="button-secondary flex-1 min-w-0 justify-center"
                onClick={() => navigate(`/scouts/${scout.ci}/edit`)}
              >
                <BiPencil className="text-white" />
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Pagination {...paging} />
    </div>
  );
}

export default ScoutPage;
