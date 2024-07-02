const jwt = require("jsonwebtoken")

const authenticate = (req,res,next)=>{
    if(cookies.token===NULL){
        res.json({
            success:false
        })
        return;
    }
    const token = cookies.token
    const data = jwt.verify(token,"WorkIndia")
    if(!data){
        res.json({
            success:false
        })
        return;
    }
    next()
}

module.exports = authenticate