const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { Pool } = require("pg");
const path = require("path");

const app = express();

// Archivos estáticos
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de sesión
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

// Ruta principal
app.get("/", async (req, res) => {
  if (req.session.user) {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE username=$1", [req.session.user]);
    client.release();

    if (result.rows.length === 0) return res.redirect("/logout");

    const userPanels = result.rows[0].panels
      .split(",")
      .map(p => panels[p])
      .join("<br>");

    // Cargar dashboards.html y reemplazar marcador
    const fs = require("fs");
    let html = fs.readFileSync(__dirname + "/public/dashboards.html", "utf8");
    html = html.replace("%%DASHBOARDS%%", userPanels);

    return res.send(html);
  } else {
    res.sendFile(__dirname + "/public/index.html");
  }
});


// Login
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
      res.redirect("/"); // ✅ Redirige a /, que ahora carga dashboards.html
    } else {
      res.redirect("/?error=1");
    }
  } catch (err) {
    console.error(err);
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

