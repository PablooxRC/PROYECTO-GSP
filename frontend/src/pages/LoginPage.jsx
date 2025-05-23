import React from 'react'
import {Card, Input, Button, Label} from '../components/ui/Index.js'
import {Link, useNavigate} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import { useAuth } from '../context/AuthContext.jsx'
function LoginPage(){
  const {register, handleSubmit} = useForm()
  const {signin, errors, isAuth} = useAuth()
  const navigate = useNavigate()
  const onSubmit = handleSubmit(async (data) =>{
    const user = await signin(data)
    if (user){
      navigate('/profile')
    }
    
  });
  return (
    <div className='h-[calc(100vh-64px)] flex justify-center items-center'>
      <Card>
        {errors && errors.length > 0 && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {errors.map((err, index) => (
              <p key={index} className="mb-1">{err}</p>
            ))}
          </div>
          )
        }

        <h1 className='text-4xl font-bold my-2 text-center'> Ingresar</h1>
        
        <form onSubmit={onSubmit}>
          <Label htmlFor="email">
            Email
          </Label>
          <Input type='email' placeholder='Email'
            {...register('email', {
                required: true
              })
            }          
          />
          <Label htmlFor="contraseña">
            Contraseña
          </Label>
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