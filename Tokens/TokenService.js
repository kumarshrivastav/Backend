import jwt from "jsonwebtoken";
class TokenService{
    generateToken(payload){
        const accessToken=jwt.sign(payload,process.env.JWT_ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
        const refreshToken=jwt.sign(payload,process.env.JWT_REFRESH_TOKEN_SECRET,{expiresIn:'1d'})
        return {accessToken,refreshToken}
    }

    verifyAccessToken(accessToken){
        return jwt.verify(accessToken,process.env.JWT_ACCESS_TOKEN_SECRET)
    }
    verifyRefreshToken(refreshToken){
        return jwt.verify(refreshToken,process.env.JWT_REFRESH_TOKEN_SECRET)
    }
}

export default new TokenService()