import { config } from "dotenv";
config()

import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const dbUrl = process.env.MONGODB_URI || "";


export const connectDB = async () => {

    try {
        await mongoose.connect(`${dbUrl}/${DB_NAME}`).then((data) => {
            console.log(`Database connected with ${data.connection.host}`)
        });
    } catch (error: any) {
        console.log(error.message)
        setTimeout(connectDB, 5000)
    }
};