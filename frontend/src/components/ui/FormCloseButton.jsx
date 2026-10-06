import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import Button from "./Button";

export default function FormCloseButton({ to, onClick, disabled = false }) {
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      className="button-secondary shrink-0"
      disabled={disabled}
      onClick={onClick || (() => navigate(to))}
    >
      <IoClose aria-hidden="true" size={18} />
      Cerrar
    </Button>
  );
}
