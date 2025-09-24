import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Clavenueva1",
  database: "powerbi_web"
});

const [rows] = await conn.execute("SELECT * FROM users");
console.log(rows);
await conn.end();
