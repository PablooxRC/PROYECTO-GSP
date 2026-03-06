import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { pool } from '../src/db.js'

const migrations = [
  'init.sql',
  'migration_create_registros_table.sql',
  'migration_add_envio_field.sql',
  'migration_create_report_logs.sql',
  'migration_add_fields_dirigente.sql',
  'migration_add_is_admin_dirigente.sql',
  'migration_scouts_campos_nuevos.sql',
  'migration_add_envio_dirigente.sql',
  'migration_change_envio_type.sql',
  'migration_add_create_at_scouts.sql',
  'migration_change_scouts_ci_type.sql',
  'migration_change_scout_ci_type.sql',
  'migration_add_deposito_dirigente.sql',
  'migration_add_es_colaborador_dirigente.sql'
]

async function apply() {
  try {
    for (const migration of migrations) {
      const filePath = path.resolve(`./database/${migration}`)
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo no encontrado: ${migration}`)
        continue
      }
      const sql = fs.readFileSync(filePath, 'utf8')
      console.log(`\n📝 Aplicando migración: ${migration}`)
      try {
        await pool.query(sql)
        console.log(`✅ Migración completada: ${migration}`)
      } catch (migrationErr) {
        if (migrationErr.message.includes('ya existe') || migrationErr.message.includes('already exists')) {
          console.log(`⏭️  Saltando (ya existe): ${migration}`)
        } else {
          throw migrationErr
        }
      }
    }
    console.log('\n🎉 Todas las migraciones se procesaron exitosamente')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error en migración:', err.message)
    process.exit(1)
  }
}

apply()
