//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const app = express();
// const md5=require('md5')
// const bcrypt=require('bcrypt');
// const saltRounds=10;
const session=require('express-session');
const passport=require('passport')
const passportlocalmongoose=require('passport-local-mongoose');

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(session({
  secret:"our little secret",
  resave:false,
  saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session());

///////////////////mongooose/////////////////////////////
const mongoose = require("mongoose");
const encrypt=require('mongoose-encryption');
const { flatMap } = require('lodash');
mongoose.connect("mongodb://127.0.0.1:27017/userdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//dontknow-> mongoose.set("useCreateIndex",true);

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

// userschema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
userschema.plugin(passportlocalmongoose);

const user = new mongoose.model("user", userschema);

passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
///////////////////////mongoose/////////////////////////

app.get('/secrets',function(req,res){
  if(req.isAuthenticated()){
    res.render('secrets');
  }else{
    res.redirect('/login');
  }
})

app.get("/", function (req, res) {
  res.render("home");
});

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const newuser=new user({
      username:req.body.username,
      password:req.body.password,
    });
    req.login(newuser,function(err){
      if(err){
        console.log("error boufy",err);
      }else{
        passport.authenticate("local")(req,res,function(){
          res.redirect('/secrets');
        })
      }
    })
    // const username = req.body.username;
    // // const password = md5(req.body.password);
    // const password = (req.body.password);
    // user.findOne({email:username})
    //   .then((found) => {
    //     bcrypt.compare(password,found.password,function(err,result){
    //       if(result===true){
    //         res.render('secrets');
    //       }
    //     })
    //   })
    //   .catch((err) => {
    //     console.error("Error while querying: " + err);
    //   });
  });

app
  .route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    user.register({username:req.body.username},req.body.password,function(err,user){
      if(err){
        console.log("error body: ",err);
        res.redirect('/register')
      }else{
        passport.authenticate("local")(req,res,function(){
          res.redirect('/secrets');
        })
      }
    })

    // bcrypt.hash(req.body.password,saltRounds,function(err,hash){
    //   const newuser = new user({
    //     email: req.body.username,
    //     //password: md5(req.body.password),
    //     password:hash,
    //   });
    //   newuser
    //     .save()
    //     .then(() => {
    //       res.render("secrets");
    //     })
    //     .catch((err) => {
    //       console.error("Error while saving: " + err);
    //     });
    // })
   
  });

  app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.listen(3000, function (err) {
  if (err) {
    console.log("error buddy :", err);
  }
  console.log("server is up and running");
});
