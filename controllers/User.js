const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async function(req, res, next) {
    const{username,email,password} = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    try{
        if (password.length <6)
            return res.status(400).json({msg: "password must at least 6 "})
        const user= await User.create({
            username, email, password: passwordHash
        });

        const token = sendToken(user);

        res.status(201).json({
            success: true,
            token: token
        });
    }catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

exports.login = async (req, res, next) => {
    const {email, password} = req.body;
    
    if (!email || !password)
            res.status(404).json({ 
                success:false,
                error: "Please provide amail and password"})
     
    try{
        const user = await User.findOne({ email }).select("+password");

        if(!user){
            res.status(404).json({ 
                success:false,
                error: "Invalid credentials"})
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            res.status(404).json({ 
                success:false,
                error: "Invalid credentialss"})
        }

        const token = sendToken(user);

        res.cookie('refreshtoken',token, {
            httpOnly: true,
            path: '/api/auth/refresh_token',
            maxAge: 7*24*60*60*1000 // 7days
        })

        res.status(200).json({ 
            success:true,
            token: token
    });

    } catch (error){
        res.status(500).json({ 
            success:false,
            error: error.message});
 
    }
}

exports.refreshToken = async (req, res, next) => {
    try{
        const token = req.cookies.refreshtoken;
        if(!token) 
            return res.status(400).json({message: "Please Login now !"})
        
        jwt.verify(token,process.env.REFRESH_TOKEN_SECRET , (err,user) => {
            if (err) return res.status(400).json({message: "Please Login now !"})
            const access_token = sendToken({id:user.id})
            res.json({access_token})
            console.log(user)
        })
        
                }
    catch (err) {
        return res.status(500).json({error: err.message})
            
    }

}

const sendToken = (payload) => {
    return jwt.sign({payload} , (process.env.JWT_SECRET), {expiresIn: process.env.JWT_EXPIRE,});
};





