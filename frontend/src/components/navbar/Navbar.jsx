import { Link, useLocation } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './navigation';
import { useAuth } from '../../context/AuthContext';

function Navbar(){
    const location = useLocation();
    const {isAuth, signout} = useAuth()
    return(
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
          <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
            <a href="https://www.instagram.com/gscoutpanda/" className="flex items-center space-x-3 rtl:space-x-reverse">
                {/* Reducimos un poco el logo para que no ocupe tanto espacio */}
                <img src="https://i.ibb.co/8gHKQbF6/Grupo-Scout-Panda.png" className="h-20" alt="Flowbite Logo" />
                <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Grupo Scout Panda - Registros</span>
            </a>

            {/* Botón hamburguesa para mobile */}
            <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
            </button>

            {/* Menú */}
            <div className="hidden w-full md:flex md:w-auto" id="navbar-default">
                <ul className="font-medium flex-nowrap flex overflow-x-auto space-x-4 md:space-x-6 p-0 m-0">
                {
                    isAuth
                    ? privateRoutes.map(({ path, name }) => (
                        <li
                            className={`${location.pathname === path ? "bg-blue-600 px-3 py-1" : ""}`}
                            key={path}
                        >
                            <Link
                            to={path}
                            className="block whitespace-nowrap py-2 px-3 text-blue-100 rounded-sm md:bg-transparent md:text-blue-100 md:p-0 dark:text-white md:dark:text-blue-100"
                            >
                            {name}
                            </Link>
                        </li>
                        ))
                    : publicRoutes.map(({ path, name }) => (
                        <li
                            className={`${location.pathname === path ? "bg-blue-600 px-3 py-1" : ""}`}
                            key={path}
                        >
                            <Link
                            to={path}
                            className="block whitespace-nowrap py-2 px-3 text-blue-100 rounded-sm md:bg-transparent md:text-blue-100 md:p-0 dark:text-white md:dark:text-blue-100"
                            >
                            {name}
                            </Link>
                        </li>
                        ))
                }
                {isAuth && (
                    <li
                    onClick={signout}
                    >
                    <a
                        href="#"
                        className="block whitespace-nowrap py-2 px-3 text-blue-100 rounded-sm md:bg-transparent md:text-blue-100 md:p-0 dark:text-white md:dark:text-blue-100"
                    >
                        Salir
                    </a>
                    </li>
                )}
                </ul>

            </div>
          </div>
        </nav>
    )
}

export default Navbar;
