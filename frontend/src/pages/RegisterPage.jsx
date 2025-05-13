import {Button, Input, Card} from "../components/ui/Index.js"
import {useForm} from 'react-hook-form'
function RegisterPage(){

  const {register, handleSubmit} = useForm()

  const onSubmit = handleSubmit(data =>{
    console.log(data)
  })
  return (
    <div className='h-[calc(100vh-64px)] flex items-center justify-center'>
      <Card>
        <h3 className='text-2xl font-bold'> Register</h3>
        <form onSubmit={onSubmit}>
          <Input placeholder="Ingresa tu CI"
            {... register('ci',{
              required: true,
            })}
          />
          <Input placeholder="Ingresa tu nombre"
            {... register('nombre', {
              required: true,
            })}
          />
          <Input placeholder="Ingresa tu apellido"
            {... register('apellido', {
              required: true,
            })}
          />
          <Input type ="email" placeholder="Ingresa tu email"
            {... register('email', {
              required: true,
            })}
          />
          <Input placeholder="Ingresa tu unidad"
            {... register('unidad', {
              required: true,
            })}
          />
          <Input type ="password" placeholder="Ingresa tu contraseña"
            {... register('password', {
              required: true,
            })}
          />
          <Button>
            Registrar
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default RegisterPage