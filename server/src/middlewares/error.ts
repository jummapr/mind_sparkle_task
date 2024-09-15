import { NextFunction, Request, Response } from "express"
import ApiError from "../utils/ApiError"

export const error = (err:any, req:Request,res:Response,next:NextFunction) => {


    // wrong mongoose id error
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`
        err = new ApiError(404,message,err)
    }


    // mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`

        err = new ApiError(400,message,err)
    }

    // wrong jwt error
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is invalid, Try again`;
        err = new ApiError(400,message,err)
    }

    // jwt expire error
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token has expired`;
        err = new ApiError(401, message, err);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}