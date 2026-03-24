import { Link, useLocation } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./navigation";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";

function Navbar() {
  const location = useLocation();
  const { isAuth, signout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b-2 border-gray-100 dark:bg-gray-900 dark:border-gray-700 shadow-sm">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-4 py-3">
        {/* Logo y Brand */}
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="https://i.ibb.co/8gHKQbF6/Grupo-Scout-Panda.png"
            className="h-10 w-10"
            alt="Logo Scout Panda"
          />
          <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
            Scout Panda
          </span>
        </a>

        {/* Menú Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex md:hidden items-center p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none"
        >
          {isOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
        </button>

        {/* Menú Desktop */}
        <div className={`hidden md:flex md:w-auto`}>
          <ul className="font-medium flex flex-row gap-1 p-0 m-0 items-center">
            {isAuth
              ? privateRoutes.map(({ path, name, adminOnly }) => {
                  if (adminOnly && !user?.is_admin) return null;
                  const isActive = location.pathname === path;
                  return (
                    <li key={path}>
                      <Link
                        to={path}
                        className={`block px-3 py-2 rounded-md transition-colors duration-200 ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {name}
                      </Link>
                    </li>
                  );
                })
              : publicRoutes.map(({ path, name }) => {
                  const isActive = location.pathname === path;
                  return (
                    <li key={path}>
                      <Link
                        to={path}
                        className={`block px-3 py-2 rounded-md transition-colors duration-200 ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {name}
                      </Link>
                    </li>
                  );
                })}
            {isAuth && (
              <li>
                <button
                  onClick={signout}
                  className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ml-2"
                >
                  Salir
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Menú Mobile */}
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b md:hidden z-50">
            <ul className="font-medium flex flex-col gap-1 p-4 m-0">
              {isAuth
                ? privateRoutes.map(({ path, name, adminOnly, scoutOnly }) => {
                    if (adminOnly && !user?.is_admin) return null;
                    if (scoutOnly && user?.unidad === "Dirigente Institucional")
                      return null;
                    const isActive = location.pathname === path;
                    return (
                      <li key={path}>
                        <Link
                          to={path}
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-md transition-colors duration-200 ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {name}
                        </Link>
                      </li>
                    );
                  })
                : publicRoutes.map(({ path, name }) => {
                    const isActive = location.pathname === path;
                    return (
                      <li key={path}>
                        <Link
                          to={path}
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-md transition-colors duration-200 ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {name}
                        </Link>
                      </li>
                    );
                  })}
              {isAuth && (
                <li>
                  <button
                    onClick={() => {
                      signout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    Salir
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
