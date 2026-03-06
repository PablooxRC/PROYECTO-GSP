import 'dotenv/config'
import bcrypt from 'bcrypt'
import { pool } from '../src/db.js'

async function testLogin() {
  try {
    const email = 'pabloox73@gmail.com'
    const password = 'Pr8637944'
    
    console.log('\n🧪 Testeando login...\n')
    console.log('Email:', email)
    console.log('Password:', password)
    
    // Búsqueda del usuario
    const result = await pool.query('SELECT * FROM dirigente WHERE email = $1', [email])
    
    if (result.rowCount === 0) {
      console.log('\n❌ Usuario no encontrado')
      process.exit(1)
    }
    
    const user = result.rows[0]
    console.log('\n✅ Usuario encontrado:')
    console.log('   CI:', user.ci)
    console.log('   Email:', user.email)
    console.log('   Es Admin:', user.is_admin)
    console.log('   Tiene password:', !!user.password)
    
    // Validar password
    const isValid = await bcrypt.compare(password, user.password)
    
    if (isValid) {
      console.log('\n✅ Password es válida!')
    } else {
      console.log('\n❌ Password es inválida')
      console.log('   Esto significa que el password guardado en la BD no coincide')
    }
    
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error:', err.message)
    process.exit(1)
  }
}

testLogin()
