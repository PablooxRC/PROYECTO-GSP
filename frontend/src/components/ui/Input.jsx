import { forwardRef } from "react";

export const Input = forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      className={`bg-zinc-700 text-white px-3 py-2 block my-2 w-full rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-zinc-400 transition-colors ${className}`}
      ref={ref}
      {...props}
    />
  );
});

export default Input;
