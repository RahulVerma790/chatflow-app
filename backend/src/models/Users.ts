import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    role: {type: String, enum:["user", "admin"], default: "user"},
    rooms: {type: [String]}
})

export const User = mongoose.model("Users", UserSchema);
