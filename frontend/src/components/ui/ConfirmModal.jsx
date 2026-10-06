import { useState, useEffect } from "react";

/**
 * Modal de confirmación reutilizable.
 * Reemplaza window.confirm() con un modal estilizado.
 */
export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const variantClasses = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
    info: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`dialog-overlay fixed inset-0 transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0"}`}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`dialog-panel relative p-6 sm:p-8 max-w-md w-full transform transition-all duration-200 ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="button-secondary">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`button-primary ${variantClasses[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
