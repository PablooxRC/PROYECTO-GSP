import React from 'react'
import {Routes, Route} from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ScoutsPage from './pages/ScoutsPage'
import ScoutFormPage from './pages/ScoutFormPage'
import ProfilePage from './pages/ProfilePage'

function App(){
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/about" element={<AboutPage/>} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<RegisterPage/>} />
      <Route path="/scouts" element={<ScoutsPage/>} />
      <Route path="/scouts/new" element={<ScoutFormPage/>} />
      <Route path="/scouts/1/edit" element={<ScoutFormPage/>} />
      <Route path="/profile" element={<ProfilePage/>} />

    </Routes>
  )
}

export default App