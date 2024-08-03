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
// local middlewares
const authenticate = require("./middleware/authenticate");
const user = require("./Model/User");
const admin = require("./Model/Admin");
const userfeed = require("./Model/Userfeed");
// const category = require("./Model/Category") 
const blog = require("./Model/Blog")
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
server.set("views", path.join(__dirname, "views"));
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
        // create a new user
        passhash = await bcrypt.hash(password, 12);
        const profile = {
            name: name,
            email: email,
            password: passhash,
            cpassword: cpassword
        }
        const feed = await user.create(profile);

        // send mail
       const delivered = main("abiodunonaolapi@gmail.com", email);
       if(delivered){
            res.status(201).redirect("/login");
       }else{
            res.status(500).json({ error: "something went wrong" });
       }    
    }
})


// login the user
server.post("/userlogin", (req, res) => {
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    if (!email || !password) {
        return res.status(422).json({ error: "please fill the data" });
    }
    user.findOne({ email: email }).then((savedUser) => {
        if (savedUser["email"] == email) {
            bcrypt.compare(password, savedUser.password).then((doMatch) => {
                if (doMatch) {
                    const token = jwt.sign({ _id: savedUser._id }, "secretkey");
                    const { _id, name, email } = savedUser;
                    res.cookie("token", token, {
                        httpOnly: true
                    })
                    req.session.user = token
                    res.redirect("/services");
                    // return res.json({ token, user: { _id, name, email } });
                } else {
                    return res.status(422).json({ error: "invalid email or password" });
                }
            });
        }
       
    });
})
// submit feedback from users
server.get("/contact", (req, res) => {
    res.render("contact");
})
// get service route
server.get("/services", authenticate, (req, res) => {
    
    if(res.cookie("token")){
        res.render("services");
    }else{
        res.redirect("/login");
    } 
})
// create a project route
server.get("/projects", (req, res) => {
    res.render("projects");
})
// end the project route
server.post("/contact", async (req, res) => {
    console.log(req.body)
    res.send("Thank you for your feedback");
})
// load the users page
server.get("/", (req, res) => {
    res.render("index")
});

server.get("/blog", (req, res) => {
    res.render("blog")
})
server.get("/about", (req, res) => {
    res.render("about")

})

/**
 * this contains the admins logics
 */
// login the register admin and route to dashboard
server.get("/login", (req, res) => {
    res.render("login")
})
// reg admin
server.post("/registeradmin", async(req, res) => {
            // Create a new admin user
            // Check if an admin user already exists
        const existingAdmin = await admin.findOne({ email: "james@james.com" });
        if (existingAdmin) {
            console.log("Admin user already exists");
            return;
        }

        // Create a new admin user
    const newAdmin = new admin({
        email: "abiodunonaolapi@gmailcom",
        password: "password" // Change this to a secure password
    });
    await newAdmin.save();
    console.log("Admin user registered successfully");
})

// end the process
server.post("/login", async (req, res) => {
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    if (!email || !password) {
        return res.status(422).json({ error: "please fill the data" }); 
    }
    const adminUser = await admin.findOne({ email: email });
    console.log(adminUser);
})
// end the login
// create a route for the dashbard
server.get("/dashboard", (req, res) => {
    res.render("dashboard")
})

server.post("/adminblog", async(req, res)=>{
    const blogtitle = req.body.title.trim()
    const blogcategory = req.body.category.trim()
    const blogdescription = req.body.description.trim()
    const blogauthor = req.body.blogauthor.trim()
    const authorcontact = req.body.number.trim()
    if(!blogtitle || !blogdescription || !blogauthor || !authorcontact || !blogcategory){
        res.send({message:"fill the required field"})
    }
    // check database for existing data
    const feed = await blog.findOne({blogtitle:blogtitle})
    if(feed){
        return res.send("blog exist")
    }
    let blogContent = {blogtitle, blogcategory, blogdescription, blogauthor, authorcontact}
    newBlog = blog.create(blogContent)
    if(newBlog){
        res.send("blog content created")
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
