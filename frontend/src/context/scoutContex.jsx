import {createContext,useState, useContext} from "react";
import ScoutPage from "../pages/ScoutsPage";
import { getScoutsRequest, deleteScoutRequest, createScoutRequest, getScoutRequest, updateScoutRequest } from "../api/scout.api";

const scoutContext = createContext()

export const useScout = () => {
    const contex = useContext(scoutContext)
    if(!contex){
        throw new Error('Debe estar dentro del proovedor ScoutsProvider')
    }
    return contex
}

export const ScoutProvides = ({children}) => {

    const [scouts, setScouts] = useState ([])
    const [errors, setErrors] = useState([])

    const loadscouts = async () =>{
        const res = await getScoutsRequest()
        setScouts(res.data)
    }
    const deleteScout = async (ci) => {
        const res = await deleteScoutRequest(ci)
        console.log("Respuesta de eliminación:", res.status);
        window.alert("Scout Eliminado")
        if (res.status == 200){
            setScouts( scouts.filter(scout => scout.ci !== ci));
        }
    }

    const createScout = async (scout) => {
        try {
            const res = await createScoutRequest(scout);
            setScouts([...scouts, res.data])
            return res.data
        } catch (error) {
            if(error.response){
                setErrors([error.response.data.message])
            }
        }
    }

    const loadScout = async ci =>{
       const res =  await getScoutRequest(ci)
       return res.data
    }

    const updateScout = async (ci, scout) =>{
        try {
            const res = await updateScoutRequest(ci, scout)
            return res.data
        } catch (error) {
            setErrors([error.response.data.message])
        }
    }
    return <scoutContext.Provider
        value ={{
            scouts,
            loadscouts,
            deleteScout,
            createScout,
            loadScout,
            errors,
            updateScout,
            setErrors
        }}
    >
        {children}
    </scoutContext.Provider>
}