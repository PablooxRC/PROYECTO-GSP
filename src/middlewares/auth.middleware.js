import jwt from 'jsonwebtoken'

export const isAuth = (req, res, next) => {
    // Intentar obtener token de cookies o del header Authorization
    let token = req.cookies.token
    
    if(!token) {
        const authHeader = req.headers.authorization
        if(authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7) // Extraer token sin "Bearer "
        }
    }

    if(!token){
        return res.status(401).json({
            message: "No estas autorizado"
        })
    }
    jwt.verify(token, 'xyz123', (err, decoded) =>{
        if(err)
            return res.status(401).json({ message: 'No estas autorizado' });
        req.userCI = decoded.ci;
        req.userUnidad = decoded.unidad || null;
        req.isAdmin = !!decoded.is_admin;
        next();
    });
}