export function Spinner({ size = "lg", text = "Cargando..." }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-4"
    >
      <div
        aria-hidden="true"
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-700 border-t-indigo-400`}
      />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}

export default Spinner;
