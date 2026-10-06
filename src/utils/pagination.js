import { AppError } from "./errorHandler.js";

export function pageOptions(query = {}) {
  const parse = (value, fallback, max) => {
    if (value === undefined) return fallback;
    if (
      typeof value !== "string" ||
      !/^[1-9]\d*$/.test(value) ||
      !Number.isSafeInteger(Number(value)) ||
      Number(value) > max
    )
      throw new AppError(
        "Página y tamaño deben ser enteros positivos; máximo 100 por página.",
        400,
      );
    return Number(value);
  };
  return {
    page: parse(query.page, 1, 1000000),
    pageSize: parse(query.pageSize, 20, 100),
  };
}

// Los consumidores históricos sin page conservan su respuesta completa (exportaciones).
// El ORDER BY suministrado por cada controlador debe incluir una clave única.
export async function queryPage(db, sql, params = [], query = {}) {
  if (query.page === undefined && query.pageSize === undefined)
    return (await db.query(sql, params)).rows;
  const requested = pageOptions(query);
  const count = await db.query(
    `SELECT COUNT(*)::int AS total FROM (${sql}) AS filtered`,
    params,
  );
  const total = count.rows[0].total;
  const totalPages = Math.max(1, Math.ceil(total / requested.pageSize));
  const page = Math.min(requested.page, totalPages);
  const result = await db.query(
    `${sql} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, requested.pageSize, (page - 1) * requested.pageSize],
  );
  return {
    items: result.rows,
    pagination: { page, pageSize: requested.pageSize, total, totalPages },
  };
}
