export function Label({ children, htmlFor, className = "" }) {
  return (
    <label
      className={`block text-sm font-medium text-gray-300 mb-1 ${className}`}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}
export default Label;
