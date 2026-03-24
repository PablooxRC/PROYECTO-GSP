export const publicRoutes = [
  {
    name: "Inicio",
    path: "/",
  },
  {
    name: "Ingresar",
    path: "/login",
  },
  {
    name: "Registrarse",
    path: "/register",
  },
];

export const privateRoutes = [
  {
    name: "Scouts",
    path: "/scouts",
    scoutOnly: true,
  },

  {
    name: "Nuevo Scout",
    path: "/scouts/new",
  },
  {
    name: "Registros",
    path: "/registros",
  },
  {
    name: "Crear Admin",
    path: "/admin/create",
    adminOnly: true,
  },
  {
    name: "Ver Dirigentes",
    path: "/admin/dirigentes",
    adminOnly: true,
  },
  {
    name: "Crear Dirigente",
    path: "/admin/dirigentes/create",
    adminOnly: true,
  },
  {
    name: "Enviar Reporte",
    path: "/admin/send-report",
    adminOnly: true,
  },
  {
    name: "Perfil del dirigente",
    path: "/profile",
  },
];
