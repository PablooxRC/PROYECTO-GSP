import 'dotenv/config'
import { pool } from '../src/db.js'

async function checkAdmin() {
  try {
    console.log('\n🔍 Verificando admin en BD...\n')
    
    const result = await pool.query('SELECT ci, email, is_admin, nombre FROM dirigente')
    
    console.log('Dirigentes en la BD:')
    console.table(result.rows)
    
    const admin = result.rows.find(d => d.is_admin)
    if (admin) {
      console.log('\n✅ Admin encontrado:')
      console.log(`   Email: ${admin.email}`)
      console.log(`   Nombre: ${admin.nombre}`)
    } else {
      console.log('\n⚠️  No hay admins en la BD')
    }
    
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error:', err.message)
    process.exit(1)
  }
}

checkAdmin()
