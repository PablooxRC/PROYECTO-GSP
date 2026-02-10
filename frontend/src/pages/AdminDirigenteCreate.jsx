import React from 'react'
import { Card, Input, Label, Button } from '../components/ui'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'

function AdminDirigenteCreate(){
  const navigate = useNavigate()
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axios.post('/admins/dirigentes', data)
      navigate('/scouts')
    } catch (err) {
      alert(err?.response?.data?.message || 'Error creando dirigente')
    }
  })

  if (!user?.is_admin) return <p className="text-red-500">No autorizado</p>

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Registrar Dirigente</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Cédula de Identidad</Label>
            <Input type="number" {...register('ci', { required: true })} />
            {errors.ci && <p className="text-red-500 text-sm">CI es requerido</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primer Nombre</Label>
              <Input {...register('primer_nombre', { required: true })} />
            </div>
            <div>
              <Label>Segundo Nombre</Label>
              <Input {...register('segundo_nombre')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primer Apellido</Label>
              <Input {...register('primer_apellido', { required: true })} />
            </div>
            <div>
              <Label>Segundo Apellido</Label>
              <Input {...register('segundo_apellido')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Nacimiento</Label>
              <Input type="date" {...register('fecha_nacimiento')} />
            </div>
            <div>
              <Label>Sexo</Label>
              <select className="w-full p-2 rounded bg-gray-700 text-white" {...register('sexo')}>
                <option value="">Seleccionar</option>
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Grupo</Label>
              <Input {...register('grupo')} />
            </div>
            <div>
              <Label>Unidad</Label>
              <Input {...register('unidad')} />
            </div>
          </div>

          <div>
            <Label>Nivel de Formación</Label>
            <Input {...register('nivel_formacion')} />
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2">Registrar Dirigente</Button>
        </form>
      </Card>
    </div>
  )
}

export default AdminDirigenteCreate
