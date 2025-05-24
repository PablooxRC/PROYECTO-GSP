import { Navigate, Outlet } from "react-router-dom"

export const ProtectedRoute = ({isAllowed,children, redirectTo}) => {
   
    if(!isAllowed){
        return <Navigate to={redirectTo} replace></Navigate>
    }

    return children ? children : <Outlet/>
}