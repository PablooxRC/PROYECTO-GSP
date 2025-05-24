import { useEffect } from "react"
import {Button} from '../components/ui/Button.jsx'
import {Card} from '../components/ui/Card.jsx'
import { useScout } from "../context/scoutContex.jsx"
import { useNavigate } from "react-router-dom"
import {useAuth} from '../context/AuthContext'
import { PiTrashSimpleLight }from 'react-icons/pi'
import { BiPencil }from 'react-icons/bi'
function ScoutPage(){
  const {scouts, loadscouts, deleteScout} = useScout(); 
  const navigate = useNavigate()
  useEffect(()=>{
    loadscouts();
  },[]) 
  const {user} = useAuth()
  return (
    <div>
      <div>
        <h1 class="text-4xl font-extrabold dark:text-white py-4"  >Unidad: {user?.unidad || "No disponible"}</h1>
      </div>
      <div className='grid grid-cols-3 gap-2'>
        {
          scouts.map(scout => (
            <Card key={scout.ci} className="px-7 py-4"> 
              <div>
                <h1 className="text-2xl font-bold">
                {scout.nombre}  {scout.apellido}
                </h1>
                <p>
                  {scout.ci}
                  
                </p>
              </div>
              <div className="my-2 flex justify-end gap-x-2">
                <Button className="bg-red-500 hover:bg-red-600" onClick={async () => {
                if( window.confirm("¿Estas seguro de eliminar esta tarea?")){
                  await deleteScout(scout.ci)
                }
                  
                }}>
                  <PiTrashSimpleLight className="text-white"/>
                  Eliminar
                  </Button>
                <Button
                
                  onClick = {() => navigate(`/scouts/${scout.ci}/edit`)}
                >
                  <BiPencil className="text-white" ></BiPencil>
                  Editar</Button>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
    
  )
}

export default ScoutPage