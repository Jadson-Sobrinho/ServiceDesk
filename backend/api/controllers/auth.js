const bcrypt = require('bcrypt');
const userModel = require("../models/user");

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await userModel.findOne({email});
        if (!user) {
            return res.status(401).json({error: "Email is wrong"})
        }


        //Tirar o user.password dps que tiver a rota de registro de usuario
        const isMatch = await bcrypt.compare(password, user.password || user.hashed_password);
        if (!isMatch) {
            return res.status(401).json({error: "Password is wrong"})
        }
        
        const payload = {
            user_id: user._id,
            name: user.name,
            email: user.email,
            rule: user.rule,
            phone_number: user.phone_number
        }

        return res.json(payload);
    } catch (error) {
        console.error('Faild to log in:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}