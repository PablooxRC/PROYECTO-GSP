import React from 'react'
import {Routes, Route, Outlet} from 'react-router-dom'
import  { useAuth }  from './context/AuthContext.jsx'
import { ScoutProvides } from './context/scoutContex.jsx'
import { RegistroProvider } from './context/registroContex.jsx'
import Navbar from './components/navbar/Navbar.jsx'
import { ProtectedRoute }  from './components/ProtecttedRoute.jsx'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ScoutsPage from './pages/ScoutsPage'
import ScoutFormPage from './pages/ScoutFormPage'
import RegistrosPage from './pages/RegistrosPage'
import RegistroFormPage from './pages/RegistroFormPage'
import ProfilePage from './pages/ProfilePage'
import NotFound from './pages/NotFound'
import AdminRegistrosPage from './pages/AdminRegistrosPage'
import AdminCreatePage from './pages/AdminCreatePage'
import AdminDirigenteCreate from './pages/AdminDirigenteCreate'
import AdminDirigentesPage from './pages/AdminDirigentesPage'
import AdminSendReport from './pages/AdminSendReport'


function App(){

  const {isAuth, loading} = useAuth()
  console.log(loading)
  if(loading) return <h1>cargando.....</h1>
  return (
   <>
    <Navbar/>
    <div className='max-w-7xl px-4 mx-auto'>
      <Routes>
       <Route element ={<ProtectedRoute isAllowed={!isAuth} redirectTo="/scouts"/>}>
          <Route path="/" element={<HomePage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
       </Route>

       <Route
        element ={<ProtectedRoute
          isAllowed={isAuth}
          redirectTo="/login"
        />}
       >
        <Route element={
          <ScoutProvides>
            <Outlet/>
          </ScoutProvides>
        }>
          <Route path="/scouts" element={<ScoutsPage/>} />
          <Route path="/scouts/new" element={<ScoutFormPage/>} />
          <Route path="/scouts/:ci/edit" element={<ScoutFormPage/>} />
        </Route>

        <Route element={
          <RegistroProvider>
            <Outlet/>
          </RegistroProvider>
        }>
          <Route path="/registros" element={<RegistrosPage/>} />
          <Route path="/registros/create" element={<RegistroFormPage/>} />
          <Route path="/registros/:id/edit" element={<RegistroFormPage/>} />
          <Route path="/admin/registros" element={<AdminRegistrosPage/>} />
          <Route path="/admin/create" element={<AdminCreatePage/>} />
          <Route path="/admin/dirigentes" element={<AdminDirigentesPage/>} />
          <Route path="/admin/dirigentes/create" element={<AdminDirigenteCreate/>} />
          <Route path="/admin/send-report" element={<AdminSendReport/>} />
        </Route>

          <Route path="/profile" element={<ProfilePage/>} />
       </Route>

        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </div>
   </>
  )
}

export default App