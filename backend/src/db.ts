import mongoose from "mongoose";
import { config } from "./config";

export const connectToDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log("Connected to MongoDB");
    } catch(err){
        console.log("MongoDB connection failed: ",err);
        process.exit(1);
    }
}