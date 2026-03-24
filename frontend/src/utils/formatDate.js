/**
 * Parsea y formatea una fecha en formato localizado (es-ES).
 * Maneja múltiples formatos de entrada: ISO, YYYY-MM-DD, timestamps.
 * Retorna "-" si la fecha es inválida o vacía.
 */
export function formatDate(dateStr) {
  if (!dateStr || dateStr === "Invalid Date") return "-";

  try {
    let date;

    if (typeof dateStr === "string") {
      date = dateStr.includes("T")
        ? new Date(dateStr)
        : new Date(dateStr + "T00:00:00");
    } else {
      date = new Date(dateStr);
    }

    if (!date || isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("es-ES");
  } catch {
    return "-";
  }
}

/**
 * Formatea una fecha a YYYY-MM-DD (para inputs type="date").
 */
export function toDateInputValue(dateStr) {
  if (!dateStr) return "";

  try {
    const date =
      typeof dateStr === "string" && !dateStr.includes("T")
        ? new Date(dateStr + "T00:00:00")
        : new Date(dateStr);

    if (isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}
