import {NextFunction, Request, RequestHandler, Response} from "express"


const asyncHandler = (handler: RequestHandler) => async(req:Request,res:Response,next:NextFunction) => {
    try {
        await handler(req,res,next)
    } catch (error:any) {
        return res.status(500).json({
            success: false,
            message:  error.message || "internal server error"
        })
    }
}

export default asyncHandler;