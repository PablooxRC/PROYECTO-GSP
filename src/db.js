import pg from 'pg'

export const pool = new pg.Pool({
    port: 5432,
    host: 'localhost',
    user: 'postgres',
    password: '12345678',
    database: 'Scouts'
})

pool.on('connect', ()=> {
    console.log('Server on port', 3000)
})