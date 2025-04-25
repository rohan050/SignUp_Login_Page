const express = require('express');
const router= express.Router();
const{signup, login, getUser, forgotPassword,resetPassword}=require('../controller/authController');
const auth=require('../middleware/auth');

router.post('/signup',signup);
router.post('/login',login);
router.get('/user',auth,getUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports=router;
