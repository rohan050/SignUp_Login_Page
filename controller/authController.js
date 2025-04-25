const user=require('../models/User.js');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')
const nodemailer=require('nodemailer')
const crypto = require('crypto');
const User = require('../models/User.js');

const JWT_SECRET=process.env.JWT_SECRET;
const CLIENT_URL=process.env.CLIENT_URL;

exports.signup=async (req,res)=>{
    console.log("signup")
    const{firstName, lastName, email, password}=req.body;
    try{
        const existing= await User.findOne({email});
        if(existing) return res.status(400).json({error: 'Email already in use'});
        const user=new User({firstName, lastName, email, password});
        await user.save();
        res.status(201).json({message:'User successfully registered'});
    } catch(err){
        res.status(400).json({err: err.message})
    }
};

exports.login=async (req,res)=>{
    const{email,password}=req.body;
    const user=await User.findOne({email});
    if(!user)return res.status(400).json({error: 'Invalid credentials'});
    
    const token=jwt.sign({id:user._id},JWT_SECRET,{ expiresIn:'1h'});
    res.json({token});
}

exports.getUser=async(req,res)=>{
    try{
        const user=await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        res.status(500).json({error:'Server error'})
    }
};

exports.forgotPassword=async(req,res)=>{
    const {email}=req.body;
    const user=await User.findOne({email});
    if(!user)return res.status(400).json({error: 'User not found'});

    const token=crypto.randomBytes(20).toString('hex');
    user.resetToken=token;
    user.resetTokenExpiration = Date.now()=5*60*1000;
    await user.save();
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {user:process.env.EMAIL_USER, pass: process.env.EMAIL_PASS}
    }); 
    const lin =`${CLIENT_URL}/reset-password/${token}`;
    await transporter.sendMail({
        to:user.email,
        from: process.env.EMAIL_USER,
        subject:'Password Reset',
        html: `<p>Click <a href="${link}"> here</a> to reset password. Link valid for 5 minutes.</p>`
    });
    res.json({message:'Reset password link sent to email'})   
};

exports.resetPassword=async(req, res)=>{
    const {token}=req.params;
    const {newPassword}=req.body;

    const user=await User.findOne({resetToken: token, resetTokenExpiration:{$gt: Date.now()}});
    if(!user) return res.status(400).json({error:'Invalid or expired token'});

    user.password = newPassword;
    user.resetToken=undefined;
    user.resetTokenExpiration=undefined;
    await user.save();
    res.json({message:'Password updated successfully'});
}

