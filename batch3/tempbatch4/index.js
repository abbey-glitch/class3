// import all middlewares/dependencies
const express = require("express");
const server = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto") 
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
// import dotenv and read the content in it
const dotenv = require("dotenv");
dotenv.config();
// use the imported middlewares/dependencies
server.use(cors());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "public/")));
// generate a secret key
const secretKey = crypto.randomBytes(64).toString("hex");
server.use(session({
    secret: secretKey,
    resave: false,
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
                // res.send(secretKey)
                jwt.sign(profile, "secretKey", (error, token)=>{
                    if(error){
                        res.send("validation issues")
                    }else{
                        req.session.secret = secretKey
                        // res.send({profile, token})
                        // res.send({
                        //     message:"registration successfull",
                        //     status:"successfull",
                        //     token:token,
                        //     secret:secretKey
                        // })
                        res.cookie("usertoken", token).render("login", {profile:profile})
                    }

                })
                // res.send(profile)
            }else{
                res.send("invalid password match")
            }
    }else{
        res.send("invalid data passed")
    }
})
// login route
server.post("/login", (req, res)=>{

    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImphbWVzIiwicGFzc3dvcmQiOiIkMmIkMTAkSTZ6M2lMeVlVenVmbWxNaWZCM2FadUk3NTNTWkdycjZ4SlVtNzQ0NE11TEhZNDcxYm1nbmkiLCJlbWFpbCI6InNhbUBzYW0uY29tIiwiaWF0IjoxNzIxMDQ1NTIyfQ.ZsL1lu04RJiNAy9wXNyFnsWTTpeyCj-lr8vBzQG1i08"
    // toks = res.cookie("usertoken")
    // console.log(req.cookie)
    const password = req.body.password.trim();
    const email = req.body.email.trim();
    const profile = {
        password:password,
        email:email
    }
    // res.send(profile)
    jwt.verify(token, "secretKey", (error, data)=>{
        if(error){
            res.send("invalid credentials")
        }else{
           res.send(data)
        }
    })
    
})
// logout route

// create an instance of a running server
server.listen(port, (error) => {
    if(error){
        console.log("unable to connect");
    }
    console.log(`server is running on port ${port}`);
    
})

