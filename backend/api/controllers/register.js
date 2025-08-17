const bcrypt = require('bcrypt');
const userModel = require("../models/user");

exports.register = async (req, res) => {
    try {
        const {name, email, rule, phone_number, hashed_password} = req.body;

        const encryptRounds = 5;
        const passordHash = await bcrypt.hash(hashed_password, encryptRounds);

        const newUser = new userModel({
            name,
            email,
            rule,
            phone_number,
            hashed_password: passordHash
        });

        const savedUser = await newUser.save();

        res.status(201).json({ message: "Usuário registrado com sucesso!", name: savedUser.name });

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Faild to create a new user"});
    }
};