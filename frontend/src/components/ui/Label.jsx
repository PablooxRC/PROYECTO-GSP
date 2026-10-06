export function Label({ children, htmlFor, className = "" }) {
  return (
    <label className={`ui-label ${className}`} htmlFor={htmlFor}>
      {children}
    </label>
  );
}
export default Label;
