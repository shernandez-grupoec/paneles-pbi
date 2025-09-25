const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

const app = express();

// Archivos estáticos
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
  secret: "miSecretoPowerBI",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production", // usa HTTPS en producción
    sameSite: "lax"
  }
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

// Ruta principal (dashboard)
app.get("/", async (req, res) => {
  if (!req.session.user) {
    return res.sendFile(path.join(__dirname, "public/index.html"));
  }

  const client = await pool.connect();
  try {
    // Obtener el panel asignado al usuario
    const userResult = await client.query(
      "SELECT panels FROM users WHERE username=$1",
      [req.session.user]
    );

    if (userResult.rows.length === 0) {
      return res.redirect("/logout");
    }

    const panelName = userResult.rows[0].panels;

    // Obtener el iframe desde la tabla dashboards
    const dashResult = await client.query(
      "SELECT embed_url FROM dashboards WHERE name = $1",
      [panelName]
    );

    if (dashResult.rows.length === 0) {
      return res.status(404).send("No se encontró el dashboard asignado.");
    }

    console.log("Panel del usuario:", panelName);
    console.log("Resultado dashboards:", dashResult.rows);

    const embedUrl = dashResult.rows[0].embed_url;

    // Cargar dashboards.html y reemplazar marcador
    let html = fs.readFileSync(path.join(__dirname, "public/dashboards.html"), "utf8");
    html = html.replace(
      "%%DASHBOARDS%%",
      `<iframe src="${embedUrl}" width="100%" height="100%" frameborder="0" allowFullScreen="true"></iframe>`
    );

    res.send(html);

  } catch (err) {
    console.error("Error cargando dashboard:", err);
    res.status(500).send("Error cargando dashboards");
  } finally {
    client.release();
  }
});

// 🚨 Ruta de login que faltaba
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE username=$1 AND password=$2",
      [username, password]
    );

    if (result.rows.length > 0) {
      req.session.user = username;
      console.log("Sesión creada:", req.session.user);
      return res.redirect("/");
    }

    res.redirect("/?error=1");

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).send("Error en login");
  } finally {
    client.release();
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

