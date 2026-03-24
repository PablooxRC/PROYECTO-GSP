export function Spinner({ size = "lg", text = "Cargando..." }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-600 border-t-indigo-500`}
      />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}

export default Spinner;
