import { ChatMessage } from "../models/ChatMessages";
import { Room } from "../models/RoomModel";
import { Chat, Store} from "./Store";
import {v4 as uuidv4} from "uuid";

export class MongoStore extends Store {

    async initRoom(roomName: string, createdBy: string, isPrivate: boolean = false) {
        const roomId = uuidv4();

        const createdRoom = await Room.create({
            roomId, 
            roomName,
            createdBy,
            isPrivate,
            joinRequests: [],
            allowedUsers: isPrivate ? [createdBy] : [],
        })

        return createdRoom;
    }

    async addChat(roomId: string, userId: string, userName: string, message: string) {
        const chat = new ChatMessage({
            chatId: uuidv4(),
            userId,
            roomId,
            message,
            userName, 
            upvotes: [],
        })

        return (await chat.save()) as Chat;
    }

    async getChats(roomId: string, limit: number, offset: number){
        const doc = await ChatMessage
        .find({roomId})
        .sort({createdAt: -1}) // for the newest message to come first
        .skip(offset)
        .limit(limit)
        .lean()
        .exec();

        return doc as Chat[];
    }

    async upvote(userId: string, roomId: string, chatId: string) {
        const chat = await ChatMessage.findOne({
            chatId: chatId,
            roomId: roomId,
        });

        if(!chat) return null;

        if(!chat.upvotes.includes(userId)){
            chat.upvotes.push(userId);
            await chat.save();
        }

        return chat as Chat;
    }
}