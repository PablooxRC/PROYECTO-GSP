import { useAuth } from '../context/AuthContext'; // ajusta la ruta según tu estructura

function HomePage(){
  const data = useAuth()
  return (
    <h1>hola</h1>
  )
}

export default HomePage