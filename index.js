// import all middlewares/dependencies
const express = require("express");
const server = express();
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto") 
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
// import dotenv and read the content in it
const dotenv = require("dotenv");
const { log } = require("console");
dotenv.config();
const client = new mongodb.MongoClient(process.env.DB_URL);
// use the imported middlewares/dependencies
server.use(cors());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "public/")));
// generate a secret key
const secretKey = crypto.randomBytes(64).toString("hex");
server.use(session({
    secret: secretKey,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}))
// set template engine
server.set("view engine", "ejs");
// read the content inside dotenv file
const port = process.env.PORT;
// read database name and collection then store it to a variable
const dbName = process.env.DB_NAME;
const table = process.env.TABLE;
// create a route
server.get("/", (req, res) => {
    res.render("index");
})

// create a route for registering
server.get("/register", (req, res) => {
    res.render("register");
})
// process the registered data
server.post("/register", async(req, res)=>{
    const username = req.body.username.trim();
    const password = req.body.password.trim();
    const confirmpwd = req.body.confirmPassword.trim();
    const email = req.body.email.trim();
    if(username.length>0 || password.length>0 || confirmpwd.length>0 || email.length>0){
            if(password === confirmpwd){
                const hash = await bcrypt.hash(password, 10)
                const profile = {
                    username:username,
                    password:hash,
                    email:email
                }
                // check the database if the user already exist
                const user = await client.db(dbName).collection(table).findOne({email:email})
                if(user){
                    if(user["email"] == email){
                        res.send("user already exist")
                    }
                }else{// save user info to the database
                    const db = await client.db(dbName).collection(table).insertOne(profile)
                    if(db){
                        res.render("login", {message:"registration successfull"})
                    }else{
                        res.send("unable to insert")
                    }
                }
            }else{
                res.send("invalid password match")
            }
    }else{
        res.send("invalid data passed")
    }
})
// login route
server.get("/login", (req, res)=>{
    res.render("login");
})
server.post("/login", async(req, res)=>{
    const password = req.body.password.trim();
    const email = req.body.email.trim();
    if(password.length == 0 || email.length == 0){
        res.send("fill the required field")
    }
    const profile = {
        password:password,
        email:email
    }
    // generate token for user
    jwt.sign(profile, secretKey, (error, token)=>{
        if(error){
            res.send("validation issues")
        }else{
            req.session.secretKey = secretKey
            req.session.token = token
            res.cookie("usertoken", token)
            if(res.cookie("usertoken")){
                res.redirect("dash")
            }else{
                res.render("login")
            }
            
        }

    })
    // end token generation 
})

// dashboard route
server.get("/dash", (req, res)=>{
    // const usertoks = res.cookie("usertoken")
    const secretKey = req.session.secretKey
    const toks = req.session.token
    // console.log({"token":toks, "secretKey":secretKey})
      jwt.verify(toks, secretKey, (error, data)=>{
        if(error){
            res.send("invalid credentials")
        }else{
            // // res.send(data)
            // console.log(data);
           res.render("dash", {data:data})
        }
    }) 
})
// logout route
server.post("/logout", (req, res)=>{
    res.clearCookie("usertoken")
    res.redirect("/login")
})
// image upload route
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "public/images/")
    },
    filename: (req, file, cb)=>{
        cb(null, file.originalname)
    }
})
// activate multer storage setting
const upload = multer({storage: storage})
server.post("/uploader", upload.single('file1'), (req, res, next)=>{
    const img = req.file.originalname
    const imgsize = req.file.size
    const img_title = req.body.imgTitle
    const img_desc = req.body.img_desc
    res.send(img)
    // if(imgsize > 5000){
    //     res.send("large image size")
    // }else{
    //     res.send("image size is ok")
    // }
})

// update profile
server.get("/updateprofile", async(req, res)=>{
    const oldemail = req.body.oldemail
    const newemail = req.body.newemail
    const db = await client.db(dbName).collection(table).updateOne({email:oldemail}, {$set:{email:newemail}})
    // res.send(db)
    let num = db.modifiedCount
    if(num > 0){
        res.send("profile updated")
    }
    res.send("unable to update")
    
})
// delete route
server.get("/deleteprofile", async(req, res)=>{
    res.render("del")
    })
server.post("/deleteprofile", async(req, res)=>{
    const email = req.query.email
    const db = await client.db(dbName).collection(table).deleteOne({email:email})
    let num = db.deletedCount
    if(num > 0){
        res.send({
            message:"unable to delete",
            status:"error"
        })
    }else{
        res.send({
            message:"deleted successfully",
            status:"success"
        })
    }
})
// create an instance of a running server
server.listen(port, (error) => {
    if(error){
        console.log("unable to connect");
    }
    console.log(`server is running on port ${port}`);
    
})

