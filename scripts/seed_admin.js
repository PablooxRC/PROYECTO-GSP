import 'dotenv/config'
import { pool } from '../src/db.js'
import bcrypt from 'bcrypt'

async function seedAdmin() {
  try {
    console.log('\n🌱 Creando admin por defecto...\n')

    // Hash de la contraseña "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Verificar si el admin ya existe
    const existingAdmin = await pool.query('SELECT * FROM dirigente WHERE ci = $1', [8637944])
    
    if (existingAdmin.rowCount > 0) {
      console.log('✅ Admin ya existe en la BD')
      console.log(`   CI: ${existingAdmin.rows[0].ci}`)
      console.log(`   Email: ${existingAdmin.rows[0].email}`)
      process.exit(0)
      return
    }

    // Crear el admin
    const result = await pool.query(
      `INSERT INTO dirigente (ci, nombre, apellido, email, unidad, password, is_admin) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [8637944, 'Pablo', 'Rodriguez Castro', 'pabloox73@gmail.com', 'Admin', hashedPassword, true]
    )

    console.log('✅ Admin creado correctamente:')
    console.log(`   CI: ${result.rows[0].ci}`)
    console.log(`   Nombre: ${result.rows[0].nombre} ${result.rows[0].apellido}`)
    console.log(`   Email: ${result.rows[0].email}`)
    console.log(`   Password: admin123 (CAMBIAR EN PRODUCCIÓN)\n`)
    
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error creando admin:', err.message)
    process.exit(1)
  }
}

seedAdmin()
