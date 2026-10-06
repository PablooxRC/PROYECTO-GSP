import { useEffect, useState } from "react";
import FormCloseButton from "../components/ui/FormCloseButton";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import usePaginatedList from "../hooks/usePaginatedList";
import Pagination from "../components/ui/Pagination";

const input = "form-input mt-2 w-full";
const button = "button-primary disabled:opacity-50";
const emptyMaterial = {
  name: "",
  reference: "",
  category: "",
  unit: "GRUPO",
  measure: "unidad",
  total: 0,
  notes: "",
  location_id: "",
};
const errorText = (e) =>
  e.response?.data?.error?.message || e.response?.data?.message || e.message;
const date = (value) => new Date(value).toLocaleString("es-BO");

export default function KralPage({ requests = false }) {
  const { user } = useAuth();
  const admin = Boolean(user?.is_admin);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [material, setMaterial] = useState(null);
  const [location, setLocation] = useState({
    name: "",
    external: true,
    description: "",
  });
  const [form, setForm] = useState({
    unit: user?.unidad || "",
    place: "",
    purpose: "",
    use_at: "",
    return_at: "",
  });
  const [items, setItems] = useState([{ material_id: "", quantity: 1 }]);
  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState("");
  const inventoryPage = usePaginatedList(
    "/kral/materials",
    { location_id: filter || undefined, search },
    !requests,
  );
  const inUsePage = usePaginatedList(
    "/kral/in-use",
    { location_id: filter || undefined, search },
    !requests,
  );
  const requestsPage = usePaginatedList("/kral/requests", {}, requests);
  const pickerPage = usePaginatedList(
    "/kral/materials",
    { search, availableOnly: "true" },
    requests,
  );
  const options = [
    ...new Map(
      [
        ...items.map((i) => i.material).filter(Boolean),
        ...pickerPage.items,
      ].map((m) => [String(m.id), m]),
    ).values(),
  ];
  const data = {
    locations,
    materials: requests ? options : inventoryPage.items,
    inUse: inUsePage.items,
  };
  const list = requestsPage.items;
  async function refresh() {
    inventoryPage.refresh();
    inUsePage.refresh();
    requestsPage.refresh();
    pickerPage.refresh();
    setLocations((await api.get("/kral/locations")).data);
  }
  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/kral/locations", { signal: controller.signal })
      .then((r) => setLocations(r.data))
      .catch((e) => {
        if (!controller.signal.aborted) setMessage(errorText(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);
  async function run(work, success) {
    setBusy(true);
    setMessage("");
    try {
      await work();
      await refresh();
      setMessage(success);
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  const visible = data.materials;
  const fields = (value, setter, definitions) =>
    definitions.map(([key, label, type = "text"]) => (
      <label key={key} className="block text-sm font-medium text-[#cbd2e1]">
        {label}
        <input
          className={input}
          type={type}
          required={!["reference", "category", "notes"].includes(key)}
          min={type === "number" ? 0 : undefined}
          step={type === "number" ? "0.001" : undefined}
          value={value[key]}
          onChange={(e) => setter((v) => ({ ...v, [key]: e.target.value }))}
        />
      </label>
    ));
  return (
    <main className="page-shell space-y-6">
      <div className="page-header flex flex-wrap justify-between items-center gap-4">
        <h1 className="page-title">
          {requests ? "Solicitudes de Kral" : "Inventario de grupo (Kral)"}
        </h1>
        <Link
          className="button-secondary"
          to={requests ? "/kral" : "/kral/solicitudes"}
        >
          {requests ? "Ver inventario" : "Solicitudes de material"}
        </Link>
      </div>
      {message && (
        <p
          role="status"
          className="rounded-xl border border-[#7053c8]/50 bg-[#7053c8]/10 p-4 text-[#d4c9f4]"
        >
          {message}
        </p>
      )}
      {loading ? (
        <p className="empty-state">Cargando Kral…</p>
      ) : requests ? (
        <>
          <form
            className="section-panel space-y-6 p-5 sm:p-7"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await api.post("/kral/requests", {
                  ...form,
                  use_at: new Date(form.use_at).toISOString(),
                  return_at: new Date(form.return_at).toISOString(),
                  items: items.map((i) => ({
                    material_id: Number(i.material_id),
                    quantity: Number(i.quantity),
                  })),
                });
                setItems([{ material_id: "", quantity: 1 }]);
                setForm({
                  ...form,
                  place: "",
                  purpose: "",
                  use_at: "",
                  return_at: "",
                });
              }, "Solicitud enviada. Pendiente de aprobación.");
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Nueva solicitud
              </h2>
              <FormCloseButton to="/kral" disabled={busy} />
            </div>
            <label className="block text-sm font-medium text-[#cbd2e1]">
              Buscar material
              <input
                className={input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <p className="rounded-lg border border-[#303b50] bg-[#0e1420]/50 p-4 text-sm leading-relaxed text-[#a5afc2]">
              El stock se descuenta al aprobar. Un administrador confirma la
              devolución completa.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {admin ? (
                fields(form, setForm, [["unit", "Unidad solicitante"]])
              ) : (
                <p>Unidad solicitante: {user?.unidad}</p>
              )}
              {fields(form, setForm, [
                ["place", "Lugar de uso"],
                ["purpose", "Actividad / motivo"],
                ["use_at", "Fecha y hora de uso", "datetime-local"],
                ["return_at", "Fecha y hora de devolución", "datetime-local"],
              ])}
            </div>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-wrap gap-4 items-end rounded-xl border border-[#303b50] p-4"
              >
                <label className="flex-1 min-w-48 text-sm font-medium text-[#cbd2e1]">
                  Material
                  <select
                    required
                    className={input}
                    value={item.material_id}
                    onChange={(e) =>
                      setItems((v) =>
                        v.map((i, j) =>
                          j === index
                            ? {
                                ...i,
                                material_id: e.target.value,
                                material: data.materials.find(
                                  (m) => String(m.id) === e.target.value,
                                ),
                              }
                            : i,
                        ),
                      )
                    }
                  >
                    <option value="">Selecciona material y ubicación</option>
                    {data.materials
                      .filter((m) => Number(m.available) > 0)
                      .map((m) => (
                        <option
                          key={m.id}
                          value={m.id}
                          disabled={items.some(
                            (i, j) =>
                              j !== index && Number(i.material_id) === m.id,
                          )}
                        >
                          {m.name} · {m.location} · {m.available} {m.measure}{" "}
                          disponibles
                        </option>
                      ))}
                  </select>
                </label>
                <label className="w-full text-sm font-medium text-[#cbd2e1] sm:w-36">
                  Cantidad
                  <input
                    aria-label={`Cantidad material ${index + 1}`}
                    className={input}
                    type="number"
                    min="0.001"
                    step="0.001"
                    required
                    value={item.quantity}
                    max={
                      data.materials.find(
                        (m) => m.id === Number(item.material_id),
                      )?.available
                    }
                    onChange={(e) =>
                      setItems((v) =>
                        v.map((i, j) =>
                          j === index ? { ...i, quantity: e.target.value } : i,
                        ),
                      )
                    }
                  />
                </label>
                {items.length > 1 && (
                  <button
                    type="button"
                    className={button}
                    onClick={() =>
                      setItems((v) => v.filter((_, j) => j !== index))
                    }
                  >
                    Quitar
                  </button>
                )}
              </div>
            ))}
            <Pagination {...pickerPage} label="Materiales disponibles" />
            <div className="flex flex-wrap gap-3 border-t border-[#303b50] pt-5">
              <button
                type="button"
                className={button}
                onClick={() =>
                  setItems((v) => [...v, { material_id: "", quantity: 1 }])
                }
              >
                Agregar material
              </button>
              <button disabled={busy} className={button}>
                Enviar solicitud
              </button>
            </div>
          </form>
          <h2 className="text-xl font-semibold">
            {admin ? "Todas las solicitudes" : "Mis solicitudes"}
          </h2>
          {list.length === 0 && (
            <p className="empty-state">No hay solicitudes todavía.</p>
          )}
          {list.map((r) => (
            <article key={r.id} className="section-panel p-5 sm:p-6 space-y-4">
              <h3 className="border-b border-[#303b50] pb-4 text-lg font-semibold text-[#c1b2f3]">
                Solicitud #{r.id} · {r.unit} ·{" "}
                {
                  {
                    pending: "Pendiente",
                    approved: "Aprobada / en uso",
                    rejected: "Rechazada",
                    returned: "Devuelta",
                  }[r.status]
                }
              </h3>
              <p>
                {r.purpose} · {r.place}
              </p>
              <p>
                Uso: {date(r.use_at)} — Devolución prevista: {date(r.return_at)}
              </p>
              {r.status === "approved" &&
                Date.parse(r.return_at) < Date.now() && (
                  <p className="text-amber-300">Devolución vencida</p>
                )}
              <ul className="list-disc space-y-2 rounded-xl bg-[#0e1420]/60 p-4 pl-9 text-sm">
                {r.items.map((i) => (
                  <li key={i.material_id}>
                    {i.name} · {i.location}: {i.quantity} {i.measure}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[#a5afc2]">
                Solicitante: {r.requester_ci} · Creada: {date(r.created_at)}
              </p>
              {r.decision_note && <p>Observación: {r.decision_note}</p>}
              {r.returned_at && <p>Devuelta: {date(r.returned_at)}</p>}
              {admin && (
                <div className="flex flex-wrap gap-3 border-t border-[#303b50] pt-4">
                  {(r.status === "pending"
                    ? [
                        ["approve", "Aprobar"],
                        ["reject", "Rechazar"],
                      ]
                    : r.status === "approved"
                      ? [["return", "Registrar devolución completa"]]
                      : []
                  ).map(([action, label]) => (
                    <button
                      key={action}
                      disabled={busy}
                      className={button}
                      onClick={() => {
                        setDecision({ id: r.id, action, label });
                        setNote("");
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
          <Pagination {...requestsPage} label="Solicitudes" />
        </>
      ) : (
        <>
          <p className="page-description">
            Consulta existencias por ubicación, cantidades disponibles y
            materiales en uso.
          </p>
          <div className="filter-bar flex flex-wrap items-end gap-4">
            <label className="w-full text-sm font-medium text-[#cbd2e1] sm:w-auto sm:min-w-56">
              Ubicación
              <select
                className={input}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Todas las ubicaciones</option>
                {data.locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                    {l.external ? " (externa)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="w-full min-w-0 text-sm font-medium text-[#cbd2e1] sm:w-auto sm:min-w-48 sm:flex-1">
              Buscar material, categoría o unidad
              <input
                className={input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            {admin && (
              <button
                className={button}
                onClick={() =>
                  setMaterial({
                    ...emptyMaterial,
                    location_id: filter || data.locations[0]?.id || "",
                  })
                }
              >
                Nuevo material
              </button>
            )}
          </div>
          {admin && (
            <details className="section-panel p-5">
              <summary className="cursor-pointer font-semibold text-[#c1b2f3]">
                Crear ubicación
              </summary>
              <form
                className="mt-5 grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(async () => {
                    await api.post("/kral/locations", location);
                    setLocation({ name: "", description: "", external: true });
                  }, "Ubicación creada.");
                }}
              >
                <div className="sm:col-span-2 flex justify-end">
                  <FormCloseButton
                    disabled={busy}
                    onClick={(event) => {
                      event.currentTarget
                        .closest("details")
                        .removeAttribute("open");
                    }}
                  />
                </div>
                {fields(location, setLocation, [
                  ["name", "Nombre de ubicación"],
                  ["description", "Descripción / dirección"],
                ])}
                <label className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={location.external}
                    onChange={(e) =>
                      setLocation((v) => ({ ...v, external: e.target.checked }))
                    }
                  />
                  Fuera del Kral
                </label>
                <button disabled={busy} className={button}>
                  Guardar ubicación
                </button>
              </form>
            </details>
          )}
          <div className="table-wrap">
            <table className="w-full min-w-[920px] text-sm text-left">
              <thead>
                <tr>
                  {[
                    "N°",
                    "Nombre",
                    "Categoría",
                    "Ubicación",
                    "Unidad",
                    "Total",
                    "Disponible",
                    "En uso",
                    "Observaciones",
                    ...(admin ? ["Acciones"] : []),
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-4 whitespace-nowrap text-[#a5afc2] font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-[#303b50] align-top hover:bg-[#c1b2f3]/5"
                  >
                    <td className="p-3">{m.reference || m.id}</td>
                    <td className="p-3 font-semibold">
                      {m.name}
                      <span className="mt-1 block text-xs font-normal text-[#a5afc2]">
                        {m.measure}
                      </span>
                    </td>
                    <td className="p-3">{m.category || "—"}</td>
                    <td className="p-3">
                      {m.location}
                      {m.external ? " (externa)" : ""}
                    </td>
                    <td className="p-3">{m.unit}</td>
                    <td className="p-3 tabular-nums text-right">
                      {Number(m.total)}
                    </td>
                    <td className="p-3 text-[#91d1b8] tabular-nums text-right font-semibold">
                      {Number(m.available)}
                    </td>
                    <td className="p-3 text-amber-300 tabular-nums text-right">
                      {Number(m.in_use)}
                    </td>
                    <td className="p-3">{m.notes}</td>
                    {admin && (
                      <td className="p-3">
                        <button
                          className={button}
                          onClick={() => setMaterial({ ...m })}
                        >
                          Editar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length && (
            <p className="empty-state">No hay materiales para este filtro.</p>
          )}
          <Pagination {...inventoryPage} label="Inventario" />
          <section className="section-panel p-5 sm:p-6 space-y-4">
            <h2 className="text-xl font-semibold">Materiales en uso</h2>
            {!data.inUse.length && (
              <p className="empty-state">No hay materiales prestados.</p>
            )}
            {data.inUse.map((i) => (
              <p
                key={`${i.request_id}-${i.material_id}`}
                className="rounded-lg border border-[#303b50] p-4 text-sm leading-relaxed"
              >
                {i.name} · {Number(i.quantity)} · {i.unit} · {i.place} ·
                Devolución: {date(i.return_at)} · Solicitud #{i.request_id}
              </p>
            ))}
            <Pagination {...inUsePage} label="Materiales en uso" />
          </section>
        </>
      )}
      {material && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Material"
          className="fixed inset-0 z-50 bg-[#060a13]/85 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 flex items-start justify-center"
        >
          <form
            className="section-panel p-5 sm:p-7 max-w-2xl w-full space-y-5 shadow-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const payload = {
                  ...material,
                  total: Number(material.total),
                  location_id: Number(material.location_id),
                };
                if (material.id)
                  await api.put(`/kral/materials/${material.id}`, payload);
                else await api.post("/kral/materials", payload);
                setMaterial(null);
              }, "Material guardado.");
            }}
          >
            <h2 className="text-2xl font-semibold tracking-tight">
              {material.id ? "Editar material" : "Nuevo material"}
            </h2>
            {message && <p role="alert">{message}</p>}
            <div className="grid sm:grid-cols-2 gap-3">
              {fields(material, setMaterial, [
                ["reference", "N° de referencia"],
                ["name", "Nombre"],
                ["category", "Categoría"],
                ["unit", "Unidad propietaria"],
                ["measure", "Presentación (unidad, bolsa, kg…)"],
                ["total", "Cantidad total", "number"],
                ["notes", "Observaciones"],
              ])}
              <label className="block text-sm font-medium text-[#cbd2e1]">
                Ubicación
                <select
                  required
                  className={input}
                  value={material.location_id}
                  onChange={(e) =>
                    setMaterial((v) => ({ ...v, location_id: e.target.value }))
                  }
                >
                  <option value="">Selecciona</option>
                  {data.locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p>
              La cantidad disponible se calcula descontando los préstamos
              activos del total.
            </p>
            <div className="flex flex-wrap gap-3 border-t border-[#303b50] pt-5">
              <button className={button} disabled={busy}>
                Guardar
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={busy}
                onClick={() => setMaterial(null)}
              >
                Cerrar
              </button>
            </div>
          </form>
        </div>
      )}
      {decision && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar acción"
          className="fixed inset-0 z-50 bg-[#060a13]/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            className="section-panel p-5 sm:p-7 w-full max-w-lg space-y-5 shadow-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await api.post(
                  `/kral/requests/${decision.id}/${decision.action}`,
                  { note },
                );
                setDecision(null);
              }, "Solicitud actualizada.");
            }}
          >
            <h2 className="text-xl font-semibold tracking-tight">
              {decision.label} · Solicitud #{decision.id}
            </h2>
            <p>
              {decision.action === "return"
                ? "Confirma que todos los materiales de esta solicitud fueron devueltos. Se repondrán las cantidades al inventario."
                : decision.action === "approve"
                  ? "Se descontarán todos los materiales solicitados del stock disponible."
                  : "La solicitud se rechazará sin descontar existencias."}
            </p>
            {message && <p role="alert">{message}</p>}
            {decision.action !== "return" && (
              <label className="block text-sm font-medium text-[#cbd2e1]">
                Observación
                <textarea
                  className={input}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
            )}
            <div className="flex flex-wrap gap-3 border-t border-[#303b50] pt-5">
              <button disabled={busy} className={button}>
                Confirmar
              </button>
              <button
                disabled={busy}
                type="button"
                className="button-secondary"
                onClick={() => setDecision(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
