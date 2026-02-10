import React, { useState, useEffect } from 'react'
import { Card, Input, Label, Button } from '../components/ui'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useRegistro } from '../context/registroContex'

function RegistroFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm()
  
  const navigate = useNavigate()
  const { createRegistro, loadRegistro, updateRegistro, errors: RegistroErrors, setErrors } = useRegistro()
  const params = useParams()

  const onSubmit = handleSubmit(async (data) => {
    setErrors([])
    let registro
    
    if (!params.id) {
      registro = await createRegistro(data)
    } else {
      registro = await updateRegistro(params.id, data)
    }
    
    if (registro) {
      navigate('/registros')
    }
  })

  useEffect(() => {
    setErrors([])
    if (params.id) {
      loadRegistro(params.id).then((registro) => {
        if (registro) {
          setValue('scout_ci', registro.scout_ci)
          setValue('unidad', registro.unidad)
          setValue('etapa_progresion', registro.etapa_progresion)
          setValue('colegio', registro.colegio)
          setValue('curso', registro.curso)
          setValue('numero_deposito', registro.numero_deposito)
          setValue('fecha_deposito', registro.fecha_deposito)
          setValue('monto', registro.monto)
          setValue('envio', registro.envio)
          setValue('contacto_parentesco', registro.contacto_parentesco)
          setValue('contacto_nombre', registro.contacto_nombre)
          setValue('contacto_celular', registro.contacto_celular)
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex justify-center items-center p-4">
      <Card className="w-full max-w-2xl">
        {RegistroErrors.map((error, i) => (
          <p className="text-red-500 mb-4" key={i}>{error}</p>
        ))}
        <h2 className="text-2xl font-bold mb-6">{params.id ? "Editar Registro" : "Nuevo Registro"}</h2>
        
        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Scout CI */}
          <div>
            <Label htmlFor="scout_ci">C.I. del Scout</Label>
            <Input
              placeholder="Ingresa el CI del scout"
              type="number"
              {...register('scout_ci', { required: "El CI del scout es requerido", valueAsNumber: true })}
            />
            {errors.scout_ci && <p className="text-red-500 text-sm">{errors.scout_ci.message}</p>}
          </div>

          {/* Unidad y Etapa de Progresión */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unidad">Unidad</Label>
              <Input placeholder="Unidad (opcional)" {...register('unidad')} />
            </div>
            <div>
              <Label htmlFor="etapa_progresion">Etapa de Progresión</Label>
              <Input placeholder="Etapa (opcional)" {...register('etapa_progresion')} />
            </div>
          </div>

          {/* Colegio y Curso */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="colegio">Colegio</Label>
              <Input placeholder="Colegio (opcional)" {...register('colegio')} />
            </div>
            <div>
              <Label htmlFor="curso">Curso</Label>
              <Input placeholder="Curso (opcional)" {...register('curso')} />
            </div>
          </div>

          {/* Número de Depósito y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero_deposito">Número de Depósito</Label>
              <Input placeholder="Número de depósito (opcional)" {...register('numero_deposito')} />
            </div>
            <div>
              <Label htmlFor="fecha_deposito">Fecha de Depósito</Label>
              <Input type="date" {...register('fecha_deposito')} />
            </div>
          </div>

          {/* Monto y Envío */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monto">Monto</Label>
              <Input 
                type="number" 
                step="0.01"
                placeholder="Monto (opcional)"
                {...register('monto', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="envio">Envío</Label>
              <Input placeholder="Envío (opcional)" {...register('envio')} />
            </div>
          </div>

          {/* Contacto - Parentesco y Nombre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contacto_parentesco">Parentesco</Label>
              <Input placeholder="Parentesco (opcional)" {...register('contacto_parentesco')} />
            </div>
            <div>
              <Label htmlFor="contacto_nombre">Nombre del Contacto</Label>
              <Input placeholder="Nombre completo (opcional)" {...register('contacto_nombre')} />
            </div>
          </div>

          {/* Celular de Contacto */}
          <div>
            <Label htmlFor="contacto_celular">Número de Celular</Label>
            <Input placeholder="Número de celular (opcional)" {...register('contacto_celular')} />
          </div>

          {/* Botón Submit */}
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2">
            {params.id ? "Editar Registro" : "Crear Registro"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default RegistroFormPage
