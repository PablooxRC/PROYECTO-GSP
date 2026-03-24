import { useState } from "react";
import {
  sendReport,
  getScoutsAdmin,
  getDirigentesForReport,
} from "../api/admin.api";
import axios from "../api/axios";
import { Card } from "../components/ui";
import { formatDate } from "../utils/formatDate";

export default function AdminSendReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [scouts, setScouts] = useState([]);
  const [dirigentes, setDirigentes] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [imagenBase64, setImagenBase64] = useState(null);
  const [imagenNombre, setImagenNombre] = useState("Sin imagen seleccionada");

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenNombre(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagenBase64(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const url = `/registros${params.toString() ? "?" + params.toString() : ""}`;
      const registrosResponse = await axios.get(url);

      // Obtener todos los scouts
      const scoutsResponse = await getScoutsAdmin(from, to);

      // Obtener todos los dirigentes
      const dirigentesResponse = await getDirigentesForReport();

      // Filtrar dirigentes por fecha de depósito
      let dirigentesFiltrados = dirigentesResponse.data;
      if (from || to) {
        dirigentesFiltrados = dirigentesResponse.data.filter((d) => {
          if (!d.fecha_deposito) return false;

          // Convertir fechas a formato YYYY-MM-DD para comparación
          const fechaDirigente = d.fecha_deposito.slice(0, 10);

          if (from && fechaDirigente < from) return false;
          if (to && fechaDirigente > to) return false;
          return true;
        });
      }

      setRegistros(registrosResponse.data);
      setScouts(scoutsResponse.data);
      setDirigentes(dirigentesFiltrados);
      setShowPreview(true);

      const scoutsConRegistro = new Set(
        registrosResponse.data.map((r) => r.scout_ci),
      );
      const scoutsSinRegistro = scoutsResponse.data.filter(
        (s) => !scoutsConRegistro.has(s.ci),
      );

      setMessage({
        type: "info",
        text: `Se encontraron ${registrosResponse.data.length} registros, ${scoutsSinRegistro.length} scouts sin registro, ${dirigentesFiltrados.length} dirigentes`,
      });
    } catch (err) {
      console.error("Error:", err);
      setMessage({
        type: "error",
        text:
          "Error cargando registros: " +
          (err?.response?.data?.message || err.message),
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const url = `/admin/download-report${params.toString() ? "?" + params.toString() : ""}`;
      const response = await axios.get(url, {
        responseType: "blob",
      });

      // Crear un blob y descargar
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `reporte-${from || "inicio"}-${to || "fin"}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

      setMessage({
        type: "success",
        text: "Reporte descargado correctamente",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          err.message ||
          "Error descargando reporte",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación simple
    if (!email) {
      setMessage({
        type: "error",
        text: "Por favor ingresa un email para enviar el reporte",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Enviando reporte con email:", email);

      await sendReport({
        from,
        to,
        email: email,
        imagenBase64,
      });

      setMessage({
        type: "success",
        text: `Reporte enviado correctamente a ${email}`,
      });

      // Limpiar formulario
      setFrom("");
      setTo("");
      setEmail("");
      setImagenBase64(null);
      setImagenNombre("Sin imagen seleccionada");
      setShowPreview(false);
    } catch (err) {
      console.error("Error en handleSubmit:", err);
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          err.message ||
          "Error enviando reporte",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8">Enviar Reporte (Excel)</h1>

      <div className="max-w-4xl">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-6 rounded-lg mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Desde</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hasta</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Enviar a (email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="destino@ejemplo.com"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Imagen para adjuntar (opcional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                className="hidden"
                id="imagen-input"
              />
              <label
                htmlFor="imagen-input"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition cursor-pointer"
              >
                🖼️ Seleccionar imagen
              </label>
              <span className="text-sm text-gray-300">{imagenNombre}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewLoading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition"
            >
              {previewLoading ? "Cargando..." : "👁️ Vista Previa"}
            </button>
            <button
              type="submit"
              disabled={loading || !email}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition disabled:opacity-50"
            >
              {loading ? "Enviando..." : "📧 Enviar Reporte"}
            </button>
          </div>
        </form>

        {message && (
          <div
            className={`mb-6 p-4 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : message.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {showPreview && (
          <div>
            <div className="mb-4 flex gap-3">
              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition"
              >
                {loading ? "Descargando..." : "📥 Descargar Excel"}
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-4">
              VISTA PREVIA ({registros.length} registros,{" "}
              {
                scouts.filter(
                  (s) => !registros.map((r) => r.scout_ci).includes(s.ci),
                ).length
              }{" "}
              scouts sin registro)
            </h2>

            {registros.length === 0 &&
            scouts.length === 0 &&
            dirigentes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-400">
                  No hay scouts, registros ni dirigentes en el rango de fechas
                  seleccionado
                </p>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* SCOUTS CON REGISTROS */}
                {registros.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">
                      ✓ Scouts con Depósito Registrado ({registros.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {registros.map((registro) => (
                        <Card key={registro.id} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-400">
                                Registro #
                              </p>
                              <p className="font-bold">{registro.id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Scout</p>
                              <p className="font-bold">
                                {registro.scout_nombre &&
                                registro.scout_apellido
                                  ? `${registro.scout_nombre} ${registro.scout_apellido}`
                                  : `CI: ${registro.scout_ci}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Unidad</p>
                              <p className="text-sm">
                                {registro.unidad || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">
                                Fecha Depósito
                              </p>
                              <p className="text-sm">
                                {formatDate(registro.fecha_deposito)}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-600">
                            <div>
                              <p className="text-xs text-gray-400">Etapa</p>
                              <p className="text-sm">
                                {registro.etapa_progresion || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Colegio</p>
                              <p className="text-sm">
                                {registro.colegio || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Depósito</p>
                              <p className="text-sm">
                                {registro.numero_deposito || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Monto</p>
                              <p className="text-sm font-bold text-green-400">
                                ${registro.monto || "-"}
                              </p>
                            </div>
                          </div>
                          {registro.envio && (
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <p className="text-xs text-gray-400">Envío</p>
                              <p className="text-sm">{registro.envio}</p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* SCOUTS SIN REGISTROS */}
                {(() => {
                  const scoutsConRegistro = new Set(
                    registros.map((r) => r.scout_ci),
                  );
                  const scoutsSinRegistro = scouts.filter(
                    (s) => !scoutsConRegistro.has(s.ci),
                  );
                  return scoutsSinRegistro.length > 0 ? (
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-yellow-400">
                        ⚠️ Scouts Registrados SIN Depósito (
                        {scoutsSinRegistro.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {scoutsSinRegistro.map((scout) => (
                          <Card
                            key={scout.ci}
                            className="px-6 py-4 border-2 border-yellow-600"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-400">
                                  Scout CI
                                </p>
                                <p className="font-bold">{scout.ci}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Scout</p>
                                <p className="font-bold">
                                  {scout.nombre && scout.apellido
                                    ? `${scout.nombre} ${scout.apellido}`
                                    : "Sin nombre"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Unidad</p>
                                <p className="text-sm">{scout.unidad || "-"}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-600">
                              <div>
                                <p className="text-xs text-gray-400">Etapa</p>
                                <p className="text-sm">{scout.etapa || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Monto</p>
                                <p className="text-sm font-bold text-yellow-400">
                                  ${scout.monto || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">
                                  Dirigente CI
                                </p>
                                <p className="text-sm">
                                  {scout.dirigente_ci || "-"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <p className="text-xs text-yellow-500 font-semibold">
                                Estado: FALTA REGISTRAR DEPÓSITO
                              </p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* DIRIGENTES SECTION */}
                {dirigentes.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">
                      Dirigentes Registrados ({dirigentes.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dirigentes.map((dirigente) => {
                        // Obtener registros para este dirigente en el período
                        const registrosDirigente = registros.filter(
                          (r) => r.dirigente_ci === dirigente.ci,
                        );
                        const tieneRegistros = registrosDirigente.length > 0;

                        return (
                          <Card
                            key={`dir-${dirigente.ci}`}
                            className={`px-6 py-4 ${
                              tieneRegistros
                                ? "border-2 border-green-600"
                                : "border-2 border-gray-600"
                            }`}
                          >
                            <h3 className="text-xl font-bold mb-2">
                              {dirigente.nombre} {dirigente.apellido}
                            </h3>

                            <p className="text-gray-400 text-sm mb-3">
                              C.I.:{" "}
                              <span className="text-gray-300">
                                {dirigente.ci}
                              </span>
                            </p>

                            <p className="mb-2">
                              <span className="text-blue-400">
                                {dirigente.email || "Sin email"}
                              </span>
                            </p>

                            <p className="text-gray-300 mb-3">
                              <strong>Unidad:</strong> {dirigente.unidad || "-"}
                            </p>

                            {dirigente.fecha_deposito && (
                              <p className="text-gray-300 mb-3">
                                <strong>Fecha Depósito:</strong>{" "}
                                {formatDate(dirigente.fecha_deposito)}
                              </p>
                            )}

                            <div className="bg-gray-700 p-3 rounded mb-3">
                              <p className="text-gray-400 text-sm">Envío</p>
                              <p className="text-white">
                                {dirigente.envio || "Sin especificar"}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-gray-500 text-sm">
                                Registros en periodo:{" "}
                                <strong
                                  className={
                                    tieneRegistros
                                      ? "text-green-400"
                                      : "text-gray-400"
                                  }
                                >
                                  {registrosDirigente.length}
                                </strong>
                              </p>
                              {dirigente.es_colaborador && (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                  Colaborador
                                </span>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
