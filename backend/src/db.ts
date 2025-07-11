import mongoose from "mongoose";

export const connectToDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://rahulverma:Sakidara7@cluster0.z4t4t.mongodb.net/ChatFlow");
        console.log("Database connected");
    } catch(err){
        console.log("Error in connecting to the database",err);
        process.exit(1);
    }
}