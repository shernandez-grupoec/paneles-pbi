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

async function setupUsersPanels() {
  const client = await pool.connect();
  try {
    // Agregar columna panels si no existe
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS panels VARCHAR(255)
    `);

    // Actualizar usuarios con los dashboards que pueden ver
    await client.query(`
      UPDATE users
      SET panels = 'ventas'
      WHERE username = 'ana'
    `);

    await client.query(`
      UPDATE users
      SET panels = 'rrhh'
      WHERE username = 'juan'
    `);

    console.log("Columna panels agregada y usuarios actualizados ✅");
  } catch (err) {
    console.error("Error actualizando la tabla users:", err);
  } finally {
    client.release();
    pool.end();
  }
}

setupUsersPanels();
