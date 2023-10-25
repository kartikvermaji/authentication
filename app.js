//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const app = express();
///////////////////mongooose/////////////////////////////
const mongoose = require("mongoose");
const encrypt=require('mongoose-encryption');
mongoose.connect("mongodb://127.0.0.1:27017/userdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const userschema = new mongoose.Schema({
  email: String,
  password: String,
});
///////encryption

userschema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});

const user = new mongoose.model("user", userschema);
///////////////////////mongoose/////////////////////////
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("home");
});

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    user.findOne({email:username})
      .then((found) => {
        if(found.password === password){    
            res.render('secrets');
        }
      })
      .catch((err) => {
        console.error("Error while querying: " + err);
      });
  });

app
  .route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    const newuser = new user({
      email: req.body.username,
      password: req.body.password,
    });
    newuser
      .save()
      .then(() => {
        res.render("secrets");
      })
      .catch((err) => {
        console.error("Error while saving: " + err);
      });
  });

app.post("/register");

app.listen(3000, function (err) {
  if (err) {
    console.log("error buddy :", err);
  }
  console.log("server is up and running");
});
