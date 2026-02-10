import React, { useEffect } from 'react'
import { Card, Input, Label, Button } from '../components/ui'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'

function AdminCreatePage(){
  const navigate = useNavigate()
  const { user, setErrors } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  useEffect(() => {
    // limpiar posibles errores globales
    if (setErrors) setErrors(null)
  }, [])

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axios.post('/admins', data)
      navigate('/admin/registros')
    } catch (err) {
      // mostrar error simple dentro del form
      alert(err?.response?.data?.message || 'Error al crear admin')
    }
  })

  if (!user?.is_admin) return <p className="text-red-500">No autorizado</p>

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Crear Admin</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>C.I.</Label>
            <Input type="number" {...register('ci', { required: true })} />
            {errors.ci && <p className="text-red-500 text-sm">CI es requerido</p>}
          </div>

          <div>
            <Label>Nombre</Label>
            <Input {...register('nombre', { required: true })} />
            {errors.nombre && <p className="text-red-500 text-sm">Nombre es requerido</p>}
          </div>

          <div>
            <Label>Apellido</Label>
            <Input {...register('apellido')} />
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" {...register('email', { required: true })} />
            {errors.email && <p className="text-red-500 text-sm">Email es requerido</p>}
          </div>

          <div>
            <Label>Unidad</Label>
            <Input {...register('unidad')} />
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" {...register('password', { required: true })} />
            {errors.password && <p className="text-red-500 text-sm">Password es requerido</p>}
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2">Crear Admin</Button>
        </form>
      </Card>
    </div>
  )
}

export default AdminCreatePage
