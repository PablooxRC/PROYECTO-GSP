import 'dotenv/config'
import { pool } from '../src/db.js'

async function cleanDatabase() {
  try {
    console.log('\n🗑️  Limpiando base de datos...\n')

    // Eliminar todos los registros
    console.log('Eliminando registros...')
    await pool.query('DELETE FROM registros')
    console.log('✅ Registros eliminados')

    // Eliminar todos los scouts
    console.log('Eliminando scouts...')
    await pool.query('DELETE FROM scouts')
    console.log('✅ Scouts eliminados')

    // Eliminar todos los dirigentes EXCEPTO el admin 8637944
    console.log('Eliminando dirigentes (excepto admin)...')
    await pool.query('DELETE FROM dirigente WHERE ci != 8637944')
    console.log('✅ Dirigentes eliminados')

    // Verificar que el admin existe
    const adminCheck = await pool.query('SELECT * FROM dirigente WHERE ci = 8637944')
    if (adminCheck.rowCount > 0) {
      console.log('\n✅ Admin preservado:')
      console.log(`   CI: ${adminCheck.rows[0].ci}`)
      console.log(`   Email: ${adminCheck.rows[0].email}`)
      console.log(`   Nombre: ${adminCheck.rows[0].nombre} ${adminCheck.rows[0].apellido}`)
    } else {
      console.log('\n⚠️  ADVERTENCIA: El admin 8637944 no existe en la base de datos')
    }

    console.log('\n🎉 Base de datos limpiada exitosamente\n')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error limpiando base de datos:', err.message)
    process.exit(1)
  }
}

cleanDatabase()
