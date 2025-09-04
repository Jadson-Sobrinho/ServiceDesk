const mongoose = require("mongoose");


async function connectToDataBase() {
    try {
        await mongoose.connect("mongodb://localhost:27017/ServiceDesk")
    } catch (error) {
        process.exit(1);
    }
}


module.exports = connectToDataBase;