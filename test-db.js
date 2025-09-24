const { Pool } = require("pg");

// Conexión PostgreSQL desde variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST || "dpg-d3a2a9fdiees73b6se60-a.oregon-postgres.render.com",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "powerbi_db_2993_user",
  password: process.env.DB_PASSWORD || "hRAuittnyEjALEW3FMxhXJUwMVsfBxrR",
  database: process.env.DB_NAME || "powerbi_db_2993",
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDB() {
  const client = await pool.connect();

  try {
    // Crear tabla si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        panels VARCHAR(255) NOT NULL
      )
    `);

    // Insertar usuarios de prueba (si no existen)
    await client.query(`
      INSERT INTO users (username, password, panels)
      VALUES 
        ('ana','1234','ventas'),
        ('juan','5678','rrhh')
      ON CONFLICT (username) DO NOTHING
    `);

    console.log("Base de datos lista y usuarios de prueba agregados ✅");
  } catch (err) {
    console.error("Error configurando la DB:", err);
  } finally {
    client.release();
  }

  // Probar lectura
  const res = await pool.query("SELECT * FROM users");
  console.log(res.rows);
}

setupDB();
