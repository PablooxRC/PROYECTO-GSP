import express from 'express';
import morgan from 'morgan'
import taskRoutes from './routes/task.routes.js'
import authRoutes from './routes/auth.routes.js' 
const app = express();

//Middlwares
app.use(morgan('dev'));
app.use(express.json())
app.use(express.urlencoded({extended: false}));

//Routes
app.get('/', (req, res) => res.json({message: "Bienvenido a mi proyecto"}))
app.use("/api",taskRoutes)
app.use("/api",authRoutes)

//Error Handler
app.use((err,req, res, next) =>{
    res.status(500).json({
        status: "error",
        message: err.message
    })
})

export default app;