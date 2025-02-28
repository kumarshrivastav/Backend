import { check } from "express-validator";

export const registerValidation=[
    check("name","name is required").isString(),
    check("email","email is required").isEmail(),
    check("password","password is required").isString()
]

export const loginValidation=[
    check("email","email is required").isEmail().isLength({max:191}),
    check("password","password is required").isString()
]
