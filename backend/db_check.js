
const mysql = require("mysql2/promise");
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "ramram",
  database: process.env.DB_NAME || "localharvest",
  port: process.env.DB_PORT || 3306
});

async function check() {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    console.log("Tables:", tables);
    for (let table of tables) {
      const tableName = Object.values(table)[0];
      const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
      console.log(`Columns for ${tableName}:`, columns.map(c => c.Field));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
