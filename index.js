const express = require("express");
const server = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const user = require("./Model/User");
// const Admin = require("Model/Admin");
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
        res.status(201).json({ message: "user registered successfully" });
        console.log(feed);
    }
})
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
