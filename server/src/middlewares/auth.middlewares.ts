import asyncHandler from "../utils/asyncHandler";
import User, { IUser } from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IGetUserAuthInfoRequest extends Request{
    user: IUser
}

export const isAuthenticated = asyncHandler(
    async (req: Request,res:Response,next:NextFunction) => {
        const {token} = req.cookies;

        if(!token){
            throw new ApiError(400,"Please login first then you can continue.")
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload
        console.log(decoded,"Decoded Data Log")


        // @ts-ignore
        req.user = await User.findById(decoded.id)

        next()
    }
)
export const isAdmin = asyncHandler(
    async (req: Request,res:Response,next:NextFunction) => {
        const {token} = req.cookies;

        if(!token){
            throw new ApiError(400,"Unauthorized: No token provided")
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload
        console.log(decoded,"Decoded Data Log")

        // find the use by ID
        const user = await User.findById(decoded.id)

        if(!user){
            throw new ApiError(400,"Unauthorized: User not found")
        }

        // check if the user role is admin
        if(user.role !== "admin"){
            throw new ApiError(400,"Access denied: Admins only")
        }
        // @ts-ignore
        req.user = user
        next()
    }
)