export function Button({ children, className, ...props }) {
  return (
    <button className={`ui-button ${className || ""}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
