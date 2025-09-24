import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function initDB() {
  const db = await open({
    filename: "./users.db",
    driver: sqlite3.Database
  });

  // Crear tabla usuarios
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      panels TEXT
    )
  `);

  // Insertar usuarios de prueba
  await db.run(`INSERT OR IGNORE INTO users (username, password, panels) VALUES (?, ?, ?)`,
    ["ana", "1234", "ventas"]);
  await db.run(`INSERT OR IGNORE INTO users (username, password, panels) VALUES (?, ?, ?)`,
    ["juan", "5678", "rrhh"]);

  console.log("Base de datos inicializada");
  await db.close();
}

initDB();
