import TokenService from "../Tokens/TokenService.js"
import ErrorHandler from "../utils/Error.Handler.js"

export default function authMiddleware(req,res,next){
    try {
        const {accessToken}=req.cookies
        const {payload}=TokenService.verifyAccessToken(accessToken,process.env.JWT_ACCESS_TOKEN_SECRET)
        if(!payload){
            return next(ErrorHandler(401,"Unauthorized Access Denied...."))
        }
        req.user=payload
        next()
    } catch (error) {
        next(error)
    }
}