const bcrypt = require('bcrypt');
const userModel = require("../models/user");
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await userModel.findOne({email});
        if (!user) {
            return res.status(401).json({error: "Email ou senha incorretas"});
        }

        const isMatch = await bcrypt.compare(password, user.hashed_password);
        if (!isMatch) {
            return res.status(401).json({error: "Email ou senha incorretas"});
        }
        
        const payload = {
            user_id: user._id,
            name: user.name,
            email: user.email,
            rule: user.rule,
            phone_number: user.phone_number
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );
        
        return res.json({
          token, 
          user: payload
        });


    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
}


exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(
    token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido ou expirado' });
      }
      //Armazena o payload decodificado em req.user
      req.user = decoded;
      next();
    }
  );
};

exports.getProfile = (req, res) => {
  const {user_id, name, email, rule, phone_number} = req.user;
  return res.json({user_id, name, email, rule, phone_number});
};