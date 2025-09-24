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

async function setupDashboards() {
  const client = await pool.connect();
    try {
    // Crear tabla dashboards
    await client.query(`
      CREATE TABLE IF NOT EXISTS dashboards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        embed_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("Tabla 'dashboards' creada ✅");

    // Insertar dashboards de ejemplo
    await client.query(`
      INSERT INTO dashboards (name, embed_url) VALUES
        ('ventas', 'https://app.powerbi.com/view?r=eyJrIjoiMGVhZDU3MGQtMWMxZS00N2U1LWI5MzEtNjMyMmU1NGJjMWYzIiwidCI6IjE4ODU0M2M3LWVlNjAtNDE5Zi04M2Q4LTA1OGNlYjlmNjIwMSIsImMiOjR9'),
        ('rrhh', 'https://app.powerbi.com/view?r=eyJrIjoiNmU5N2QxOTctN2RkYy00ZmRmLWFjMGEtYzY4OWViNDM0NDFkIiwidCI6IjE4ODU0M2M3LWVlNjAtNDE5Zi04M2Q4LTA1OGNlYjlmNjIwMSIsImMiOjR9'),
        ('finanzas', 'https://app.powerbi.com/view?r=eyJrIjoiNmU5N2QxOTctN2RkYy00ZmRmLWFjMGEtYzY4OWViNDM0NDFkIiwidCI6IjE4ODU0M2M3LWVlNjAtNDE5Zi04M2Q4LTA1OGNlYjlmNjIwMSIsImMiOjR9')
      ON CONFLICT DO NOTHING
    `);

    console.log("Dashboards de ejemplo agregados ✅");
  } catch (err) {
    console.error("Error creando la tabla o insertando datos:", err);
  } finally {
    client.release();
    pool.end();
  }
  }

setupDashboards();
