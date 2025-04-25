const express = require("express");
const mongoose= require("mongoose");
const dotenv=require("dotenv");
const authRoutes=require("./routes/authRoutes");
const cors=require("cors");
const app=express();

dotenv.config();

app.use(express.json())
app.use(cors());
app.use('/api/auth',authRoutes)

mongoose.connect(process.env.MONGO).then(()=>{
    console.log("MongoDB is now Connected");
    app.listen(5000, ()=> console.log("Server started on Port 5000"))
}).catch(err => console.error('DB connection error:', err))

