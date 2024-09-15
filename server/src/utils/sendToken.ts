import { Response } from "express";
import { IUser } from "../models/user.model";
import ApiResponse from "./ApiResponse";

interface User {
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    phone_number: string;
    password: string;
}

export const sendToken = async (
    user: IUser | any,
    statusCode: number,
    res: Response,
    message: string
) => {
    const token = user.getJwtToken();

    // Options for cookies
    const option = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // secure: true,
        sameSite: 'None'
    };

    res.status(statusCode).cookie("token",token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
    }).json(new ApiResponse(200,message,{user,token}))
};

