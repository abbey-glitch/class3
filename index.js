const express = require("express");
const server = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const user = require("./Model/User");
// const Admin = require("Model/Admin");
const Userfeed = require("./Model/Userfeed");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// use middleware
server.use(cors());
server.use(express.static(path.join(__dirname, "public")));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(cookieParser());
server.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true,
    })
);
// set engine
server.set("view engine", "ejs");
// read .env file
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;
// end 
// database connection
const connectDB = require("./config/dbcon");
connectDB();

// create a simple route
server.get("/registeruser", (req, res) => {
    res.render("register");
})

const apppwd = process.env.APP_PWD
// send mail code
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "abiodunonaolapi@gmail.com",
      pass: apppwd,
    },
  });
  
  // async..await is not allowed in global scope, must use a wrapper
  async function main(senderemail, receiveremail) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"abiodun site" ${senderemail}`, // sender address
      to: `${receiveremail}`, // list of receivers
      subject: "Welcome To Our Product Page", // Subject line
      text: "Hello world?", // plain text body
    //   html: "<b>Hello world?</b>", // html body

    });
  
    // console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }
// end mail


server.post("/registeruser", async (req, res) => {
    const name = req.body.name.trim();
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const cpassword = req.body.cpassword.trim();

    if (!name || !email || !password || !cpassword) {
        return res.status(422).json({ error: "please fill the data" });
    }
    const userExist = await user.findOne({ email: email });
    if(userExist){
        return res.status(422).json({ error: "user already exist" });
    }else{
        const profile = {
            name: name,
            email: email,
            password: password,
            cpassword: cpassword
        }
        const feed = await user.create(profile);

        // send mail
       const delivered = main("abiodunonaolapi@gmail.com", email);
       if(delivered){
            res.status(201).json({ message: "user registered successfully",
            status: "mail delivered successfully"
             });
       }else{
            res.status(500).json({ error: "something went wrong" });
       }    
    }
})
// submit feedback from users
server.get("/contact", (req, res) => {
    res.render("contact");
})
server.post("/contact", async (req, res) => {
    console.log(req.body)
    res.send("Thank you for your feedback");
    // const name = req.body.name
    // const email = req.body.email
    // const message = req.body.message
    // console.log(name, email, message);
    // if (!name || !email || !message) {
    //     return res.status(422).json({ error: "please fill the data" });
    // }
    // const feed = await Userfeed.create({
    //     name: name,
    //     email: email,
    //     message: message
    // });
    // return jsonify({name:name, email:email, message:message});
    // res.status(201).json({ message: "Feedback Submitted Successfully" });
})
// load the users page
server.get("/users", (req, res) => {
    res.render("index")
});
// create a database connection
const db = mongoose.connection;
// check database error
db.on("error", (err) => {
    console.log("connection error", err);
});
// end
// connect to database
db.once("open", () => {
    console.log("connected to database");
    server.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    })
});

// close database connection
db.on("close", () => {
    console.log("connection closed");
});
