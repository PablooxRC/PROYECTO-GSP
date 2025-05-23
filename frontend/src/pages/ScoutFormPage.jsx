import React from 'react'
import { Card, Input, Textscout, Label, Button } from '../components/ui'
import { useForm } from 'react-hook-form'
import {useNavigate} from 'react-router-dom'
import {createScoutRequest} from '../api/scout.api.js'
function ScoutFormPage(){
  const {register, handleSubmit, formState: {
    errors
  }} = useForm()
  const navigate = useNavigate();
  const onSubmit = handleSubmit(async (data) =>{
    try {
      const res = await createScoutRequest(data)
      navigate('/scouts');
    } catch (error) {
      if(error.response){
        alert(error.response.data.error)
      }
    }
  })
  return (
    <div className='h-[calc(100vh-64px)] flex justify-center items-center'>
      <Card>
        <h2>
          Registrar Scout
        </h2>
        <form onSubmit={onSubmit}>
          <Label htmlFor="id">
            Carnet de identidad
          </Label>
          <Input placeholder="Ingresa el CI"
            {... register('ci',{
              required: true,
              valueAsNumber: true
            })}
          />
          {
            errors.ci && <p className = "text-red-500"> El ci es requerido</p>
          }          
          <Label htmlFor="name">
            Nombre
          </Label>
          <Input placeholder="Ingresa el nombre"
            {... register('nombre', {
              required: true,
            })}
          />
           {
            errors.nombre && <p className = "text-red-500"> El nombre es requerido</p>
          }
          <Label htmlFor="apellido">
            Apellido
          </Label>
          <Input placeholder="Ingresa el apellido"
            {... register('apellido', {
              required: true,
            })}
          />
           {
            errors.apellido && <p className = "text-red-500"> El apellido es requerido</p>
          }
          <Label htmlFor="unidad">
            Unidad
          </Label>
          <Input type ="unidad" placeholder="Ingresa la unidad"
            {... register('unidad', {
              required: true,
            })}
          />
           {
            errors.unidad && <p className = "text-red-500"> La unidad es requerido</p>
          }
          <Label htmlFor="rama">
            Rama
          </Label>
          <Input placeholder="Ingresa la rama"
            {... register('rama', {
              required: true,
            })}
          />
           {
            errors.rama && <p className = "text-red-500"> La rama es requerido</p>
          }
          <Label htmlFor="etapa">
            Etapa
          </Label>
          <Input placeholder="Ingresa la epata"
            {... register('etapa', {
              required: true,
            })}
          />
          {
            errors.etapa && <p className = "text-red-500"> La etapa es requerido</p>
          }
          <Button>
          Registrar
          </Button>
        </form>
        
      </Card>
    </div>
  )
}

export default ScoutFormPage