const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { Pool } = require("pg");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "miSecretoPowerBI",
  resave: false,
  saveUninitialized: true
}));

// Configuración PostgreSQL con SSL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

// Crear tabla users si no existe y agregar usuarios de prueba
async function setupDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        panels VARCHAR(255) NOT NULL
      )
    `);

    await client.query(`
      INSERT INTO users (username, password, panels)
      VALUES 
        ('ana','1234','ventas'),
        ('juan','5678','rrhh')
      ON CONFLICT (username) DO NOTHING
    `);

    console.log("DB lista y usuarios agregados ✅");
  } catch (err) {
    console.error("Error creando tabla:", err);
  } finally {
    client.release();
  }
}
setupDB();

// Iframes públicos de Power BI
const panels = {
  ventas: '<iframe width="100%" height="100%" src="https://app.powerbi.com/view?r=eyJrIjoiNmU5N2QxOTctN2RkYy00ZmRmLWFjMGEtYzY4OWViNDM0NDFkIiwidCI6IjE4ODU0M2M3LWVlNjAtNDE5Zi04M2Q4LTA1OGNlYjlmNjIwMSIsImMiOjR9" frameborder="0" allowFullScreen="true"></iframe>',
  rrhh: '<iframe width="100%" height="100%" src="https://app.powerbi.com/view?r=eyJrIjoiNmU5N2QxOTctN2RkYy00ZmRmLWFjMGEtYzY4OWViNDM0NDFkIiwidCI6IjE4ODU0M2M3LWVlNjAtNDE5Zi04M2Q4LTA1OGNlYjlmNjIwMSIsImMiOjR9" frameborder="0" allowFullScreen="true"></iframe>'
};

// Ruta principal
app.get("/", async (req, res) => {
  if (req.session.user) {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE username=$1", [req.session.user]);
    client.release();

    if (result.rows.length === 0) return res.redirect("/logout");

    // Obtener los paneles asignados al usuario
    const userPanels = result.rows[0].panels.split(",").map(p => panels[p]).join("<br>");
    res.send(`
      <div style="width:100vw; height:100vh; margin:0; padding:0;">
        ${userPanels}
      </div>
      <a href="/logout" style="position:fixed; top:10px; right:10px; z-index:999; background:#fff; padding:5px 10px; border-radius:5px;">Cerrar sesión</a>
    `);
  } else {
    res.send(`
      <form method="post" action="/login" style="margin:100px auto; width:300px;">
        <h2>Login</h2>
        Usuario: <input name="username" style="width:100%; margin-bottom:10px;"><br>
        Contraseña: <input type="password" name="password" style="width:100%; margin-bottom:10px;"><br>
        <button type="submit" style="width:100%;">Entrar</button>
      </form>
    `);
  }
});

// Procesar login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const client = await pool.connect();
  const result = await client.query(
    "SELECT * FROM users WHERE username=$1 AND password=$2",
    [username, password]
  );
  client.release();

  if (result.rows.length > 0) {
    req.session.user = username;
    res.redirect("/");
  } else {
    res.send("Credenciales inválidas. <a href='/'>Volver</a>");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
