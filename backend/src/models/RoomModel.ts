import mongoose from "mongoose";

export const RoomSchema = new mongoose.Schema({
    roomId: {type: String, required: true, unique: true},
    roomName: {type:String, required: true},
    isPrivate: {type: Boolean, required: true},
    allowedUsers: {type: [String], default: []}, // userId,s allowed to join private rooms
    createdBy: {type: String, required: true},
    joinRequests: {type: [String], default: []},
    createdAt: {type: Date, default: Date.now}
});

export const Room = mongoose.model("Rooms", RoomSchema);