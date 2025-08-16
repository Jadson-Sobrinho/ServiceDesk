const mongoose = require("mongoose");


async function connectToDataBase() {
    try {
        await mongoose.connect("mongodb://localhost:27017/ServiceDesk")
        console.log("Connected to the database successfully");
    } catch (error) {
        console.log("Faild to connect to the database", error.message);
        process.exit(1);
    }
}


module.exports = connectToDataBase;