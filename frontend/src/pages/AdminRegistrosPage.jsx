import React from 'react'
import { RegistroProvider } from '../context/registroContex'
import RegistrosPage from './RegistrosPage'
import { useAuth } from '../context/AuthContext'

function AdminRegistrosPage(){
  const { user } = useAuth()
  if (!user?.is_admin) return <p>No autorizado</p>
  return (
    <RegistroProvider>
      <RegistrosPage />
    </RegistroProvider>
  )
}

export default AdminRegistrosPage
