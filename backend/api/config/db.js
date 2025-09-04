const mongoose = require("mongoose");


async function connectToDataBase() {
    try {
        await mongoose.connect("mongodb+srv://jadson:C31f4d0r!@cluster0.3oq3ftf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    } catch (error) {
        process.exit(1);
    }
}


module.exports = connectToDataBase;