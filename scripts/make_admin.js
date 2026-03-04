import 'dotenv/config'
import { pool } from '../src/db.js'

async function makeAdmin() {
  try {
    const ci = 8637944
    const email = 'pabloox73@gmail.com'
    
    console.log(`\n🔧 Actualizando dirigente con C.I. ${ci} a admin...`)
    
    const result = await pool.query(
      'UPDATE dirigente SET is_admin = true WHERE ci = $1 RETURNING *',
      [ci]
    )
    
    if (result.rowCount === 0) {
      console.log(`❌ No se encontró dirigente con C.I. ${ci}`)
      process.exit(1)
    }
    
    console.log(`✅ Dirigente actualizado a admin exitosamente`)
    console.log(`\n📋 Detalles:`)
    console.log(`   Email: ${result.rows[0].email}`)
    console.log(`   C.I.: ${result.rows[0].ci}`)
    console.log(`   Nombre: ${result.rows[0].nombre} ${result.rows[0].apellido}`)
    console.log(`   is_admin: ${result.rows[0].is_admin}`)
    
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error:', err.message)
    process.exit(1)
  }
}

makeAdmin()
