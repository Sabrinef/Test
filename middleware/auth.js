const jwt = require('jsonwebtoken')
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1] 
    }
    if(!token){
        return res.status(401).json({ 
            success:false,
            error: "Not authorized to acces this route"})
    }

    try{
        jwt.verify(token, process.env.JWT_SECRET,(err, user) => {

            if(err) 
                return res.status(400).json({error: "Not authorized to acces this route"});   
            req.user = user;
            next();
    
        });  

    }catch(error){
        return res.status(500).json({ 
            success:false,
            error: error.message})
    }
}