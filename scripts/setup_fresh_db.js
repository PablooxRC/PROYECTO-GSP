import 'dotenv/config'
import bcrypt from 'bcrypt'
import { pool } from '../src/db.js'

async function setupFreshDatabase() {
  try {
    console.log('\n🗑️  Limpiando toda la base de datos...\n')

    // Eliminar todos los registros
    console.log('Eliminando registros...')
    await pool.query('DELETE FROM registros')
    console.log('✅ Registros eliminados')

    // Eliminar todos los scouts
    console.log('Eliminando scouts...')
    await pool.query('DELETE FROM scouts')
    console.log('✅ Scouts eliminados')

    // Eliminar todos los dirigentes
    console.log('Eliminando dirigentes...')
    await pool.query('DELETE FROM dirigente')
    console.log('✅ Dirigentes eliminados')

    // Crear admin
    console.log('\n📝 Creando admin...')
    
    const email = 'pabloox73@gmail.com'
    const password = 'Pr8637944'
    const unidad = 'Castores'
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const result = await pool.query(
      `INSERT INTO dirigente (ci, nombre, apellido, email, password, unidad, is_admin, admin_registrado, gravatar) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      ['ADMIN_MASTER', 'Admin', 'Sistema', email, hashedPassword, unidad, true, true, 'https://cdn.pixabay.com/photo/2024/02/15/14/20/ai-generated-8575506_1280.png']
    )

    const admin = result.rows[0]
    console.log('\n✅ Admin creado exitosamente:')
    console.log(`   CI: ${admin.ci}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Unidad: ${admin.unidad}`)
    console.log(`   Es Admin: ${admin.is_admin}`)
    console.log(`   Admin Registrado: ${admin.admin_registrado}`)

    console.log('\n🎉 Base de datos lista para usar\n')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error:', err.message)
    process.exit(1)
  }
}

setupFreshDatabase()
