import jwt from "jsonwebtoken"

export const auth = async (req,res,next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({message:"you have n token/access to see....!"})
    }
    try{
        const tokenResponse = await jwt.verify(token,"secretkey")
        req.user = tokenResponse;
        next()
    } catch (error){
    res.json({ message: "Invalid token" });
}}