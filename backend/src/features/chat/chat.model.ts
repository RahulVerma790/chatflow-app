import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    chatId: {type: String, required: true, unique: true},
    userId: {type: String, required: true},
    roomId: {type: String, required: true},
    message:{type: String, required: true},
    userName: {type: String, required: true},
    upvotes: {type: [String], default: [] }
})

export const ChatMessage = mongoose.model("ChatMessage", chatSchema);