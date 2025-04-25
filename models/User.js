const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const userSchema=new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:{type: String,unique:true,required: true},
    password: {type: String, required: true},
    resetToken:String,
    resetTokenExpiration:Date,
});

userSchema.pre('save',async function (next){
    if(this.isModified('password')){
        const salt=await bcrypt.genSalt(10);
        this.password=await bcrypt.hash(this.password, salt);
    }
    next();
})
module.exports=mongoose.model('User',userSchema);