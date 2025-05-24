export const Card = ({ children, className }) => (
  <div className={`bg-gray-600 p-10 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);
