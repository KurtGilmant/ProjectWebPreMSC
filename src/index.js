const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'joboard_db',
});

connection.connect(err => {
  if (err) throw err;
  console.log("Connecté à MySQL ✅");

  connection.query("SELECT * FROM users", (err, results) => {
    if (err) throw err;
    console.log("Utilisateurs :", results);
  });
});
