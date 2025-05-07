import express from 'express';
import morgan from 'morgan'

const app = express();

app.use(morgan('dev'));

app.get('/', (req, res) => res.json({message: "Bienvenido a mi proyecto"}))

app.get('/test', (req,res) => {
    throw new Error ("my custom error");
    res.send('test')
})


app.use((err,req, res, next) =>{
    res.status(500)
})

export default app;