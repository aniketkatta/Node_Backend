import express from "express";
import path from "path"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const app=express();
app.use(cookieParser())
mongoose.connect('mongodb://localhost:27017',{
    dbName:'backend',
}).then(()=>console.log("Database Connected")).catch(e=>console.log(e));

const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

const user=new mongoose.model('User',userSchema)
// app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended:true}))
app.set("view engine","ejs")



const isAuth=async (req,res,next)=>{
    const {token}=req.cookies;
    if(token)
    {
    const decoded= jwt.verify(token,'kjdhfhdfnhedfji')
    req.user=await user.findById(decoded._id)
        next()
    }
    else{
        res.render('login')
    }
}

app.get('/',isAuth,(req,res)=>{
    console.log(req.user);
    res.render('logout')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.get('/logout',(req,res)=>{
    res.cookie('token',null,{
        httpOnly:true,
        expires: new Date(Date.now())
    })
    res.redirect('/')
})



app.post('/register',async(req,res)=>{
    const {name,email,password}=req.body;
    let User= await user.findOne({email})
    if(User){
        return res.redirect('/login')
    }
    const hashPass=await bcrypt.hash(password,10)
     User=await user.create({
        name,
        email,
        password:hashPass
    })
    res.redirect('/login')
})

app.post('/login',async(req,res)=>{
    const {email,password}=req.body;
    let User=await user.findOne({email})
    if(!User){
        return res.redirect('/register')
    }

    const isMatch=await bcrypt.compare(password,User.password);
    if(!isMatch){
        return res.render('login',{message:'Incorrect Password'})
    }

    const token=jwt.sign({_id:User._id},"kjdhfhdfnhedfji");
    res.cookie('token',token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    })
    res.redirect('/')
})
// app.get('/add',async(req,res)=>{
//     await Message.create({name:'dev',email:'dev@gmail.com'})
//     res.send('nice')

// })



app.listen(5000,()=>{
    console.log("Server is Working");
})