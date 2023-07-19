const express = require("express");
const mysql = require("mysql2");
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: '192.168.0.192',
  user: "Sathishmysql",
  password: "Sathish@mysql321",
  database: "sampledatabase"
});

const maxRetryAttempts = 3; 
const retryInterval = 2000; 

const initializeDbAndServer = (retryCount = 0) => {
  console.log("Connecting to the database...");
  db.connect((err) => {
    if (err) {
      console.log(`DATABASE ERROR: ${err}`);
      if (retryCount < maxRetryAttempts) {
        console.log(`Retrying connection... (Attempt ${retryCount + 1})`);
        setTimeout(() => initializeDbAndServer(retryCount + 1), retryInterval);
      } else {
        console.log("Unable to connect to the database after multiple attempts.");
        process.exit(1);
      }
    } else {
      console.log("Database Connected Successfully");
      app.listen(3000, () => {
        console.log("Server Running at http://localhost:3000/");
      });
    }
  });
};

app.post("/posttext", (req, res) => {
    const { text } = req.body;
    const createTextQuery = `
      INSERT INTO mytext (text)
      VALUES (${text})
    `;
  
    db.query(createTextQuery, (err, results) => {
      if (err) {
        console.log(`DB ERROR : ${err}`);
        res.status(500).json({ error: "Internal Error" });
      } else {
        res.send(results);
      }
    });
});

app.get("/gettext", (req, res) => {
  const getTextQuery = `
    SELECT *
    FROM mytext
    ORDER BY id
    `;

  db.query(getTextQuery, (err, results) => {
    if (err) {
      console.log(`DB ERROR : ${err}`);
      res.status(500).json({ error: "Internal Error" });
    } else {
      res.send(results);
    }
  });
});

initializeDbAndServer();
