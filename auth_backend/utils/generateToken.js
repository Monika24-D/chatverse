import jwt from "jsonwebtoken";


const generateJWTTokenAndSetCookie = (userId, res) => {
    console.log("JWT_SECRET in generateJWTToken=" + process.env.JWT_SECRET);
   const token = jwt.sign({userId}, process.env.JWT_SECRET, {
       expiresIn: "15d"
   })
   res.cookie("jwt", token, {
       maxAge: 15*24*60*60*1000, //miliseconds
       httpOnly: true,
       sameSite:"strict",
       secure: false
   })
}


export default generateJWTTokenAndSetCookie
