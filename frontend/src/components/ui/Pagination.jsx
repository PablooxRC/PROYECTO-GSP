export default function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  loading,
  error,
  refresh,
  label = "Paginación",
}) {
  const { page, pageSize, total, totalPages } = pagination;
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const style = "pagination-button";
  return (
    <nav aria-label={label} className="pagination-bar">
      {label !== "Paginación" && (
        <span className="font-semibold">{label}:</span>
      )}
      <span role="status" className="pagination-count">
        {loading
          ? "Cargando…"
          : `${start}–${Math.min(page * pageSize, total)} de ${total}`}
      </span>
      <button
        type="button"
        className={style}
        disabled={loading || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      <span>
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className={style}
        disabled={loading || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </button>
      <label className="flex items-center gap-2">
        Por página{" "}
        <select
          className={style}
          value={pageSize}
          disabled={loading}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <span role="alert" className="text-red-400">
          {error}{" "}
          <button type="button" className={style} onClick={refresh}>
            Reintentar
          </button>
        </span>
      )}
    </nav>
  );
}
