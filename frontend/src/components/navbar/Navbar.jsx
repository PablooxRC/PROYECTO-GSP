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
    <nav className="site-nav">
      <div className="nav-inner">
        {/* Logo y Brand */}
        <a href="/" className="nav-brand">
          <img
            src="https://i.ibb.co/8gHKQbF6/Grupo-Scout-Panda.png"
            className="nav-logo"
            alt="Logo Scout Panda"
          />
          <span className="whitespace-nowrap">Scout Panda</span>
        </a>

        {/* Menú Mobile Toggle */}
        <button
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen(!isOpen)}
          className="nav-toggle"
        >
          {isOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
        </button>

        {/* Menú Desktop */}
        <div className="nav-desktop">
          <ul className="nav-links">
            {isAuth
              ? privateRoutes.map(({ path, name, adminOnly }) => {
                  if (adminOnly && !user?.is_admin) return null;
                  const isActive = location.pathname === path;
                  return (
                    <li key={path}>
                      <Link
                        to={path}
                        aria-current={isActive ? "page" : undefined}
                        className={`nav-link ${
                          isActive ? "nav-link-active" : ""
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
                        aria-current={isActive ? "page" : undefined}
                        className={`nav-link ${
                          isActive ? "nav-link-active" : ""
                        }`}
                      >
                        {name}
                      </Link>
                    </li>
                  );
                })}
            {isAuth && (
              <li>
                <button onClick={signout} className="nav-link nav-signout">
                  Salir
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Menú Mobile */}
        {isOpen && (
          <div id="mobile-navigation" className="nav-mobile">
            <ul className="flex flex-col gap-1">
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
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setIsOpen(false)}
                          className={`nav-link ${
                            isActive ? "nav-link-active" : ""
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
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setIsOpen(false)}
                          className={`nav-link ${
                            isActive ? "nav-link-active" : ""
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
                    className="nav-link nav-signout w-full text-left"
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
