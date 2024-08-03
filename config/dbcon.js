const mongoose = require("mongoose");
const connetDB = async () => {
    try{
            // mongodb connection
       const connDb = await mongoose.connect(process.env.DB_URL, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log("MongoDB connected");

    }catch(error){
        console.log("connection error "+error);
    }
}
module.exports = connetDB