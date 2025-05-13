import {pool} from '../db.js'
//Seleccionar todos los scouts
export const getScouts = async (req, res,next) => {
  console.log(req.userUnidad)
  const result = await pool.query('SELECT * FROM scouts WHERE dirigente_ci = $1', [
    req.userCI,
  ]);
  return res.json(result.rows);
};

//Seleccionar Scout especifico
export const getScout = async (req, res) => {
  const result =  await pool.query('SELECT * FROM scouts WHERE ci = $1', [
    req.params.ci,
  ]);
  if(result.rowCount == 0){
    return res.status(404).json({
      message: "No existe un Scout con ese CI"
    })
  }
  return res.json(result.rows[0]);
}

//Creación de scouts
export const createScout = async (req, res, next) => {
    const{ci,nombre,unidad,rama,etapa} = req.body;
    try{
        console.log(req.body)
        const result = await pool.query('INSERT INTO scouts (ci, nombre, unidad, rama, etapa, dirigente_ci) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [ci, nombre, unidad,rama, etapa, req.userCI])
        
        res.json(result.rows[0])

    }catch (error) {
        if(error.code == "23505")
        {
            return res.status(409).json({
              message: "Ya existe un scout con ese CI"
            });
        }
        next(error)
    }
}

//Actualizando scout
export const updateScout = async (req, res) => {
  const ci = req.params.ci 
  const {nombre, unidad, rama, etapa} = req.body;

  const result = await pool.query('UPDATE scouts SET nombre = $1, unidad = $2, rama = $3, etapa = $4 WHERE ci = $5 RETURNING *', [
      nombre, unidad, rama, etapa, ci
    ])
  if (result.rowCount == 0){
    return res.status(404).json({
      message:"No existe un scout con ese ci"
    })
  }
  return res.json(result.rows[0])
} 

//Eliminar Scout
export const deleteScout = async (req, res) => {
  const result = await pool.query('DELETE FROM scouts WHERE ci = $1', [req.params.ci])
  console.log(result)
  if(result.rowCount==0){
    return res.status(404).json({
      message:"No existe un scout con ese ci"
    })
  }
  return res.send(`Scout ${req.params.ci} eliminado`)
}