import { useEffect, useState } from "react"
import { getScoutsRequest } from "../api/scout.api"
import {Card} from '../components/ui/Card.jsx'
function ScoutPage(){
  const [scouts, setScouts] = useState([])
  useEffect(()=>{
    getScoutsRequest()
      .then(response => {
        setScouts(response.data)

      })
  },[])

  return (
    <div className='grid grid-cols-3 gap-2'>
      {
        scouts.map(scout => (
          <Card key={scout.ci}>
            <h1 className="text-2xl font-bold">
              {scout.nombre}  {scout.apellido}
            </h1>
            <p>
              {scout.ci}
              
            </p>
          </Card>
        ))
      }
    </div>
  )
}

export default ScoutPage