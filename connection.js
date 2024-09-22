async function connection() {
  const mysql = require("mysql2/promise");

  // Membuat koneksi ke database MySQL
  const connection = await mysql.createConnection({
    host: "0.0.0.0",
    user: "root",
    database: "tugas_kuliah",
    password: "123456",
  });

  return connection;
}

module.exports = connection;
