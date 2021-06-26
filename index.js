const express = require("express");
const app = express();
const mongoose = require("mongoose");
var jwt = require('jsonwebtoken');
const fs = require("fs");
const request = require('request')
var cors = require('cors');
app.use(cors());


app.use(express.json({
  limit: '50mb'
}));
app.use(express.json({
  extended: false
}));

const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));


async function connectDB() {
await mongoose.connect("mongodb://127.0.0.1:27017/testdblogin",{ useNewUrlParser: true , useUnifiedTopology: true })
console.log("db connected");
}
connectDB();

//################################# START ############# CREATING SCHEMA#############################################

var loginCred = new mongoose.Schema({username: "string", password: "string", profileIamgePath: "string", imagename: "string"});// this defines the schema in which the attributes are given along with their datatypes
var LoginCredentials = mongoose.model('LoginCredentials', loginCred);// in this the name of the table is defined

//############################### END ############ CREATING SCHEMA#############################################



//************************ Login Post *************************
app.post('/login',async (req, res) => {
const username =  req.body.username;
const password =  req.body.password;
console.log(username);
console.log(password);
let user = await LoginCredentials.findOne({username});

if(!user){
  res.json({msg: "No User Found with that email"})
  console.log("didnt find user" + user);
}else if (user && user.password != password){
  console.log("wrong Password" + user);
  return res.json({msg: "Password is incorrect"});
}else if(user && user.password == password){
  var name = user.name
  console.log("loggerd in the user" + user);
  var token = jwt.sign({ id: user.id }, 'passwordSecretEcnryptionCode');
  res.json({token:token, username: username, msg: "The User is Successfully Logged in!"});
}
});
// ######################## Login Post ####################






//************************* SignUp POST ************************
app.post('/SignUpPage',async (req, res) => {
  console.log('this is working');
const username =  req.body.username;
console.log(username);
const password =  req.body.password;
const profileIamge = req.body.profileImage;
const profileIamgePath = "./Images/ProfileImages/" + username + "_profile.jpg";
const imagename = username + "_profile.jpg";
let user = await LoginCredentials.findOne({username});
if(user){
  res.json({msg: "email is already taken " + user.password})
  console.log("email is already taken " + user.password);
}
else{
  // if (!profileIamge) {
  //   res.send('Bad request relode again');
  // } else {
    let buff = new Buffer.from(profileIamge, 'base64');
    fs.writeFileSync(profileIamgePath, buff, function(err) {
      if (err) return console.log(err);
      console.log('done');
    });

  user = new LoginCredentials({ // here a new instance of dataentry is created
    username,
    password,
    profileIamgePath,
    imagename,
  });
  console.log(user);
  await user.save();
  console.log("This Username " + username + " is Saved" );
  var token = jwt.sign({ id: user.id }, 'passwordSecretEcnryptionCode');

  res.json({token:token, username: username});
// }
}});

// ######################## SignUp POST ####################





app.listen(8080, () => console.log("Example app listening on port 8080!"));
