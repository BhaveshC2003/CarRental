const jwt = require("jsonwebtoken")

const sendToken = (res,user)=>{
    const token = jwt.sign({email:user.email},"WorkIndia",{expiresIn:"2h"})
    let options = {
        maxAge: 1000 * 60 * 60
    }
    res.cookie('token',token).status(200)
    .json({
        success:true,
        message:"Logged in successfully",
        access_token:token,
        email:user.email
    })
    return
}

module.exports = sendToken