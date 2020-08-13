//This should always go at the very top
require("dotenv").config();
const express= require("express");
const bodyParser= require("body-parser");
const ejs= require("ejs");
const mongoose= require("mongoose");
const encrypt= require("mongoose-encryption");


const app= express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
//Updated user Schema to use the mongoose object so that
//we can enable encryption
const userSchema= new mongoose.Schema({
  email: String,
  password: String
});

//Adding our encrypt package as a plugin
//This plugin goes before the Model always
//This encrypts the entire DB up intul the word secret, to do just email,
//add the encryptedFields: to specify what exactly to encrypt
//You can encrypt more fields, just ad a "," after password and type more within the []
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:["password"]});

const User= new mongoose.model("User", userSchema);


app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

//Setting up a new user, if user creates account, they will
//be taken to the secrets page
app.post("/register", function(req, res){
  // Create a new username and Password
  // email= username, password= password
  const newUser= new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if(err){
      console.log(err);
    } else{
      res.render("secrets");
    }
  });
});

//Create a login route to check if the user has the creditenals they put in
app.post("/login", function(req,res){
  //We have these two consts that tue user entered and we have to check them
  //against our database, we'll look for username/password is equal to the one typed in
  const username= req.body.username;
  const password= req.body.password;
//To look through our database and see if there is a match
User.findOne({email: username}, function(err, foundUser){
  if(err){
    console.log(err);
  } else{
    //If there is a username with that email
    if(foundUser){
      //If the username with that email matches with the password specified above
      if(foundUser.password === password){
        //Take them to the secrets page
        res.render("secrets");
      }
    }
  }
});
});


app.listen(3000, function(){
  console.log("Secret server running on port 3000");
});
