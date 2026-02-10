import 'dotenv/config'
import app from './app.js'
import {pool} from './db.js'

const PORT = process.env.PORT || 3000
app.listen(PORT);
console.log('Server on port', PORT)


