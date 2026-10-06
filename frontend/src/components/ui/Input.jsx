import { forwardRef } from "react";

export const Input = forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input className={`ui-input my-2 ${className}`} ref={ref} {...props} />
  );
});

export default Input;
