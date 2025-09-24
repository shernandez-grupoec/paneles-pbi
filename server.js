import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import mysql from "mysql2/promise";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "miSecreto", resave: false, saveUninitialized: true }));

// Configuración de conexión MySQL
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

// Iframes públicos de Power BI
const panels = {
  ventas: '<iframe width="95%" height="100%" src="https://app.powerbi.com/view?r=eyJrIjoiNmU5N2QxOTctN2RkYy00ZmRmLWFjMGEtYzY4OWViNDM0NDFkIiwidCI6IjE4ODU0M2M3LWVlNjAtNDE5Zi04M2Q4LTA1OGNlYjlmNjIwMSIsImMiOjR9" frameborder="0" allowFullScreen="true"></iframe>',
  rrhh: '<iframe width="95%" height="100%" src="https://app.powerbi.com/view?r=eyJrIjoiNmU5N2QxOTctN2RkYy00ZmRmLWFjMGEtYzY4OWViNDM0NDFkIiwidCI6IjE4ODU0M2M3LWVlNjAtNDE5Zi04M2Q4LTA1OGNlYjlmNjIwMSIsImMiOjR9" frameborder="0" allowFullScreen="true"></iframe>'
};

// Función para obtener conexión
async function getDB() {
  return await mysql.createConnection(dbConfig);
}

// Página principal
app.get("/", async (req, res) => {
  if (req.session.user) {
    const conn = await getDB();
    const [rows] = await conn.execute("SELECT * FROM users WHERE username = ?", [req.session.user]);
    await conn.end();

    if (rows.length === 0) return res.redirect("/logout");

    const userPanels = rows[0].panels.split(",").map(p => panels[p]).join("<br>");
    res.send(`
      <div style="width:100vw; height:100vh; margin:0; padding:0;">
        ${userPanels}
      </div>
      <a href="/logout" style="position:fixed; top:10px; right:10px; z-index:999;">Cerrar sesión</a>
    `);
  } else {
    res.send(`
      <form method="post" action="/login">
        Usuario: <input name="username"><br>
        Contraseña: <input type="password" name="password"><br>
        <button type="submit">Entrar</button>
      </form>
    `);
  }
});

// Procesar login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const conn = await getDB();
  const [rows] = await conn.execute("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
  await conn.end();

  if (rows.length > 0) {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
