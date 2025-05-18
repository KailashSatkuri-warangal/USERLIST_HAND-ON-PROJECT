const express = require("express");
const mysql = require("mysql2");
// const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
const dbconfig={
  host:"localhost",
  user:"root",
  password:"123456789",
  database:"sru_db"
};
//create a pool of connections
const pool=mysql.createPool(dbconfig);
//connenct db
pool.getConnection((err,connection)=>{
  if(err){
    console.error("Error connecting to database: ",err.stack);
    return;
  }
  console.log("successfully connected to the database ID: ",connection.threadId);
  connection.release();
});

app.get("/api/students", (req, res) => {
  pool.query("SELECT * from student limit 1000;", (err, result) => {
    if (err){
      console.error("An Fetch error has occured: ", err.stack);
      return res.status(500).json({
        error:"Failed to fetch user data from database",
        details:err.message,
      });
    }
    return res.json(result);
  });
});


app.get("/sample", (req, res) => {
  // res.sendFile(path.join(__dirname,"public","index.html"));
  res.json({
    name: "Pankaj Kumar",
    age: 25,
    location: "Delhi",
    company: "Infosys",
  });
});

app.get("/Test", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index1.html"));
});

// app.get("/SRU", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "app.html"));
  console.log("Reach get call: ");
});
app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
