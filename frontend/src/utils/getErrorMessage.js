/**
 * Extrae el mensaje de error legible de una respuesta de axios.
 * Compatible con ambos formatos del backend:
 *   - { message: "..." }
 *   - { error: { code, message, stack } }
 */
export function getErrorMessage(err, fallback = "Error inesperado") {
  const data = err?.response?.data;
  return (
    data?.message ||
    data?.error?.message ||
    (typeof data?.error === "string" ? data.error : null) ||
    err?.message ||
    fallback
  );
}
