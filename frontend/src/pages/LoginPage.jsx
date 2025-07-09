import React from 'react'
import {Card, Input, Button, Label} from '../components/ui/Index.js'
import {Link, useNavigate} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import { useAuth } from '../context/AuthContext.jsx'

function LoginPage(){
  // Renombramos 'errors' de useForm a 'formErrors' para evitar conflicto con los 'errors' del contexto
  const {register, handleSubmit, formState: {errors: formErrors}} = useForm()
  // Del useAuth hook, obtenemos la función signin y los errores específicos de login ('loginErrors')
  const {signin, errors: loginErrors, isAuth} = useAuth()
  const navigate = useNavigate()

  // Esta función se ejecuta cuando el formulario es enviado
  const onSubmit = handleSubmit(async (data) =>{
    const user = await signin(data) // Llama a la función signin del contexto
    // Si 'signin' devuelve un usuario (es decir, el login fue exitoso), navega al perfil.
    // Si 'signin' devuelve null (debido a un error, como ya hemos modificado en AuthContext),
    // esta condición será falsa y NO navegará. Los errores serán mostrados por el bloque {loginErrors && ...}
    if (user){
      navigate('/profile')
    }
  });

  return (
    <div className='h-[calc(100vh-64px)] flex justify-center items-center'>
      <Card>
        {/* ESTE ES EL BLOQUE MODIFICADO PARA MOSTRAR LOS ERRORES DEL CONTEXTO */}
        {loginErrors && loginErrors.length > 0 && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {/* Aquí iteramos sobre 'loginErrors' que es el array de mensajes de error del AuthContext */}
            {loginErrors.map((err, index) => (
              <p key={index} className="mb-1">{err}</p>
            ))}
          </div>
        )}

        <h1 className='text-4xl font-bold my-2 text-center'> Ingresar</h1>

        <form onSubmit={onSubmit}>

          <Label htmlFor="email">
            Email
          </Label>
          {/* Aquí se usan los errores de validación del formulario (formErrors) */}
          {formErrors.email && (
            <p className='text-red-500'>El email es requerido</p>
          )}
          <Input type='email' placeholder='Email'
            {...register('email', {
                required: true
              })
            }
          />
          <Label htmlFor="contraseña">
            Contraseña
          </Label>
          {/* Aquí se usan los errores de validación del formulario (formErrors) */}
          {formErrors.password && (
            <p className='text-red-500'>La contraseña es requerida</p>
          )}
          <Input type='password' placeholder='Password'
            {...register('password', {
                required: true
              })
            }
          />

          <Button>
            Ingresar
          </Button>
          <div className='flex justify-between my-4'>
            <p>
              ¿No tienes una cuenta?
            </p>
            <Link to="/register" className='font-bold'> Registrarse</Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage