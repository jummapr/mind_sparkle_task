import { IUser } from "../models/user.model"
import jwt from "jsonwebtoken";

interface User  {
    first_name: string,
    last_name: string,
    email:string,
    country: string,
    phone_number: number,
    password: string
}

export const createActivationToken = (user:User) => {
    const activationToken  = jwt.sign(user,process.env.ACTIVATION_TOKEN_SECRET!,{
        expiresIn: "5m",
    });

    return activationToken
}