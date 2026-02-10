export const publicRoutes = [
    {
        name: 'Inicio',
        path: '/'
    },
    {
        name: 'Ingresar',
        path: '/login'
    },
    {
        name: 'Registrarse',
        path: '/register'
    },
]

export const privateRoutes = [
   
    {
        name: 'Scouts',
        path: '/scouts'
    },
   
    {
        name: 'Nuevo Scout',
        path: '/scouts/new'
    },
    {
        name: 'Registros',
        path: '/registros'
    },
    {
        name: 'Admin: Registros',
        path: '/admin/registros',
        adminOnly: true
    },
    {
        name: 'Crear Admin',
        path: '/admin/create',
        adminOnly: true
    },
    {
        name: 'Crear Dirigente',
        path: '/admin/dirigentes/create',
        adminOnly: true
    },
    {
        name: 'Enviar Reporte',
        path: '/admin/send-report',
        adminOnly: true
    },
    {
        name: 'Perfil del dirigente',
        path: '/profile'
    }
]