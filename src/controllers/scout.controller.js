import {pool} from '../db.js'
export const getScouts = async (req, res,next) => {
  try{
    const result = await pool.query('SELECT * FROM scouts');
    return res.json(result.rows);
  } catch (error){
    next(error);
  }
};
export const getScout = (req, res) => res.send ('obteniendo scout')

//Creación de scouts
export const createScout = async (req, res, next) => {
    const{ci,nombre,unidad,rama,etapa} = req.body;
    try{
        console.log(req.body)
        const result = await pool.query('INSERT INTO scouts (ci, nombre, unidad, rama, etapa) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [ci, nombre, unidad,rama, etapa])
        
        res.json(result.rows[0])

    }catch (error) {
        if(error.code == "23505")
        {
            return res.send("El scout ya existe");
        }
        next(error)
    }
}

export const updateScout = (req, res) => res.send ('actualizando scout')

export const deleteScout = (req, res) => res.send ('eliminando scout')