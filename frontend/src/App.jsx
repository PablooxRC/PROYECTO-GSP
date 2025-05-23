import React from 'react'
import {Routes, Route} from 'react-router-dom'
import  { useAuth }  from './context/AuthContext.jsx'
import Navbar from './components/navbar/Navbar.jsx'
import { ProtectedRoute }  from './components/ProtecttedRoute.jsx'

import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ScoutsPage from './pages/ScoutsPage'
import ScoutFormPage from './pages/ScoutFormPage'
import ProfilePage from './pages/ProfilePage'
import NotFound from './pages/NotFound'


function App(){

  const {isAuth} = useAuth()
  console.log(isAuth)
  return (
   <>
    <Navbar/>
    <div className='max-w-7xl px-4 mx-auto'>
      <Routes>
       <Route element ={<ProtectedRoute isAllowed={!isAuth} redirectTo="/scouts"/>}>
          <Route path="/" element={<HomePage/>} />
          <Route path="/about" element={<AboutPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
       </Route>

       <Route
        element ={<ProtectedRoute
          isAllowed={isAuth}
          redirectTo="/login"
        />}
       >
          <Route path="/scouts" element={<ScoutsPage/>} />
          <Route path="/scouts/new" element={<ScoutFormPage/>} />
          <Route path="/scouts/1/edit" element={<ScoutFormPage/>} />
          <Route path="/profile" element={<ProfilePage/>} />
       </Route>

        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </div>
   </>
  )
}

export default App