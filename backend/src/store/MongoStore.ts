import { ChatMessage } from "../features/chat/chat.model";
import { Room } from "../features/room/room.model";
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
            roomId: roomId,
            chatId: chatId
        });

        if(!chat) return;

        const hasUpvoted = chat.upvotes.includes(userId);

        if(hasUpvoted){ 
            // Remove upvote
            chat.upvotes = chat.upvotes.filter((id) => id!== userId);
        } else {
            // Add upvote
            chat.upvotes.push(userId);
        }

        await chat.save();

        return chat as Chat;
    }
}