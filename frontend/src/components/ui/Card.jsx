export const Card = ({ children, className = "" }) => (
  <div
    className={`bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 ${className}`}
  >
    {children}
  </div>
);
