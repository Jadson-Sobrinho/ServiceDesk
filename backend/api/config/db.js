const mongoose = require("mongoose");
MONGO_URL = process.env.MONGO_URL;

async function connectToDataBase() {
    try {
        await mongoose.connect(MONGO_URL)
    } catch (error) {
        process.exit(1);
    }
}


module.exports = connectToDataBase;