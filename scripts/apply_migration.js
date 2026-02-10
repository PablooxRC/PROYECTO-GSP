import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { pool } from '../src/db.js'

async function apply() {
  try {
    const filePath = path.resolve('./database/migration_create_report_logs.sql')
    const sql = fs.readFileSync(filePath, 'utf8')
    console.log('Applying migration:', filePath)
    await pool.query(sql)
    console.log('Migration applied successfully')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

apply()
