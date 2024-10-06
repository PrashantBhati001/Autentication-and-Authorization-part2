const cookieParser = require("cookie-parser")
const express=require("express")
const app=express()
const path=require("path")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser())

const userModel=require("./models/user")
const { brotliCompressSync } = require("zlib")

app.get("/",(req,res)=>{
  res.render("index")
})
app.post("/create",(req,res)=>{

    const{username,email,password,age}=req.body

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt, async (err,hash)=>{

                const createdUser= await userModel.create({
                    username,
                    email,
                    password:hash,
                    age
                })

                let token=jwt.sign({email},"aaaaa")
                res.cookie("token",token)
                res.send(createdUser)

        })

    })

 
})

app.get("/logout",(req,res)=>{

    res.cookie("token","")
    res.redirect("/")

})

app.get("/login",(req,res)=>{
    res.render("login")

})

app.post("/login", async (req,res)=>{
    
    let user=await userModel.findOne({email:req.body.email})
    if(!user) return res.send("something went wrong")

    bcrypt.compare(req.body.email,user.password,(err,result)=>{

        if(result){

            let token=jwt.sign({email:user.email},"aaaaa")
            res.cookie("token",token)
            res.send("Good to go")
        }
        else{
            res.send("")
        }

    })

})

app.listen(3000)