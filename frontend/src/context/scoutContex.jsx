import { createContext, useState, useContext } from "react";
import {
  getScoutsRequest,
  deleteScoutRequest,
  createScoutRequest,
  getScoutRequest,
  updateScoutRequest,
} from "../api/scout.api";

const scoutContext = createContext();

export const useScout = () => {
  const contex = useContext(scoutContext);
  if (!contex) {
    throw new Error("Debe estar dentro del proveedor ScoutsProvider");
  }
  return contex;
};

export const ScoutProvides = ({ children }) => {
  const [scouts, setScouts] = useState([]);
  const [errors, setErrors] = useState([]);

  const loadscouts = async () => {
    try {
      const res = await getScoutsRequest();
      setScouts(res.data);
    } catch (error) {
      console.error("Error cargando scouts:", error);
      setErrors([error.response?.data?.message || "Error al cargar scouts"]);
    }
  };

  const deleteScout = async (ci) => {
    try {
      const res = await deleteScoutRequest(ci);
      if (res.status === 200) {
        setScouts(scouts.filter((scout) => scout.ci !== ci));
      }
      return { success: true, message: "Scout eliminado correctamente" };
    } catch (error) {
      const msg = error.response?.data?.message || "Error al eliminar scout";
      setErrors([msg]);
      return { success: false, message: msg };
    }
  };

  const createScout = async (scout) => {
    try {
      const res = await createScoutRequest(scout);
      setScouts([...scouts, res.data]);
      return res.data;
    } catch (error) {
      if (error.response) {
        setErrors([error.response.data.message]);
      }
    }
  };

  const loadScout = async (ci) => {
    const res = await getScoutRequest(ci);
    return res.data;
  };

  const updateScout = async (ci, scout) => {
    try {
      const res = await updateScoutRequest(ci, scout);
      const updated = res.data;
      setScouts((prev) =>
        prev.map((s) => (s.ci === ci ? { ...s, ...updated } : s)),
      );
      return updated;
    } catch (error) {
      const data = error.response?.data;
      const msg =
        data?.error?.message || data?.message || "Error al actualizar el scout";
      setErrors([msg]);
    }
  };

  return (
    <scoutContext.Provider
      value={{
        scouts,
        loadscouts,
        deleteScout,
        createScout,
        loadScout,
        errors,
        updateScout,
        setErrors,
      }}
    >
      {children}
    </scoutContext.Provider>
  );
};
