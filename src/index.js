let mysql;
let connection;

function initializeDatabase() {
  if (!mysql) {
    mysql = require('mysql2');
  }
  if (!connection) {
    connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'monapp',
    });
  }
  return connection;
}

initializeDatabase().connect(err => {
  if (err) {
    console.error('Erreur de connexion MySQL:', err.message);
    process.exit(1);
  }
  console.log("Connecté à MySQL ✅");

  connection.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error('Erreur lors de la requête:', err.message);
      connection.end();
      return;
    }
    console.log("Utilisateurs :", results);
  });
});
