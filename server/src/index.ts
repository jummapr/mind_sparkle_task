import dotenv from "dotenv";


import app from "./app";
import { connectDB } from "./db";
dotenv.config();

// handling uncaught exception
// process.on("uncaughtException", (error) => {
//     console.log(`shutting down the server due to ${error.message}`);
//     process.exit(1);
// });

// // unhandled promise rejection
// process.on("unhandledRejection", (error:any) => {
//     console.log(`shutting down the server due to ${error.message}`);
//     process.exit(1);
// });

connectDB()
    .then(() => {
        app.on("error", (error:any) => {
            console.log(error.message);
        })
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error.message);
    })
