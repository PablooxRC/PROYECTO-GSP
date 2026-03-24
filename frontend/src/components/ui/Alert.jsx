import { useState, useEffect } from "react";

/**
 * Componente de alerta/toast flotante que se auto-oculta.
 * Reemplaza window.alert() con un componente estilizado.
 */
export function Alert({ type = "info", message, onClose, duration = 6000 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animación de entrada
    requestAnimationFrame(() => setShow(true));

    if (duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      bg: "bg-green-600",
      border: "border-green-400",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    error: {
      bg: "bg-red-600",
      border: "border-red-400",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
    warning: {
      bg: "bg-yellow-600",
      border: "border-yellow-400",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A1 1 0 002.56 20h18.88a1 1 0 00.87-1.28l-8.6-14.86a1 1 0 00-1.74 0z"
          />
        </svg>
      ),
    },
    info: {
      bg: "bg-blue-600",
      border: "border-blue-400",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01"
          />
        </svg>
      ),
    },
  };

  const { bg, border, icon } = config[type] || config.info;

  return (
    <div
      className="fixed top-6 right-6 z-50"
      style={{ minWidth: "320px", maxWidth: "480px" }}
    >
      <div
        className={`${bg} ${border} border rounded-xl shadow-2xl px-5 py-4 text-white flex items-start gap-3 transition-all duration-300 ${show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
      >
        <span className="mt-0.5 flex-shrink-0">{icon}</span>
        <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
        {onClose && (
          <button
            onClick={() => {
              setShow(false);
              setTimeout(() => onClose(), 300);
            }}
            className="flex-shrink-0 ml-2 text-white/70 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default Alert;
