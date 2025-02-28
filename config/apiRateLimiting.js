import { rateLimit } from "express-rate-limit"

export const globalRateLimit = rateLimit({
    
    windowMs: 1000 * 60 * 60,
    limit: 50,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: "Too many request attempts. Try again later..."
})
export const registerRateLimit=rateLimit({
    windowMs:1000*60*10,
    limit:5,
    standardHeaders:'draft-8',
    legacyHeaders:false,
    message:"Too many register attempts. Try again in 10 minutes..."
})
export const loginRateLimit = rateLimit({
    windowMs: 1000 * 60 * 5,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: "Too many login attempts. Try again in 5 minutes..."
})
export const userListApiLimit = rateLimit({
    windowMs: 1000 * 60 * 5,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: "Too many login attempts. Try again in 5 minutes..."
})

export const newsApiLimit = rateLimit({
    
    windowMs: 1000 * 60 * 10,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: "Too many login attempts. Try again in 10 minutes..."

})
export const newsListApiLimit = rateLimit({
   
    windowMs: 1000 * 60 * 10,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: "Too many login attempts. Try again in 10 minutes..."

})