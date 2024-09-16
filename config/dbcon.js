const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require('../Model/Admin');
const connetDB = async () => {
    try{
            // mongodb connection
       const connDb = await mongoose.connect(process.env.DB_URL);
        const existingAdmin = await Admin.findOne({ email: 'abiodunonaolapi@gmail.com' });
        if (existingAdmin) {
            console.log('email already exists');
            console.log("MongoDB connected");
        }else{
            const passhash = await bcrypt.hash('password', 10);
            // Create a new super admin
           const superAdmin = new Admin({
               name: 'Abiodun',
               email: 'abiodunonaolapi@gmail.com',
               password: passhash, // Make sure to hash this in production(password: 'password')
           });
     
           // Save the super admin to the database
           await superAdmin.save();
           console.log('Superadmin has been created');
           console.log("MongoDB connected");
        }

    }catch(error){
        console.log("connection error "+error);
    }
}
module.exports = connetDB