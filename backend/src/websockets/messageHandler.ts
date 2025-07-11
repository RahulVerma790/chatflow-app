import { MongoStore } from "../store/MongoStore";
import { UserManager } from "../UserManager";
import { connection } from "websocket"
import { IncomingMessages, SupportedMessage as IncomingSupportedMessage } from "../messages/incomingMessages";
import { SupportedMessage as OutgoingSupportedMessage } from "../messages/outgoingMessages";
import { InitMessage, UserMessage, UpvoteMessage } from "../messages/incomingMessages";
import { Room } from "../features/room/room.model";
import { SendMessage } from "./utils";

export const createMessageHandler = (
    userManager: UserManager,
    store: MongoStore
) => {
    return async function messageHandler(ws: connection, IncomingMessage: IncomingMessages){
    switch (IncomingMessage.type){

        case IncomingSupportedMessage.JoinRoom: {
            const result = InitMessage.safeParse(IncomingMessage.payload);
            console.log("Check 1");

            if(!result.success){
                console.log("Room join error. Result was not successful.")
                SendMessage(ws, {
                    type: OutgoingSupportedMessage.RoomError,
                    payload: {message: "Invalid room join payload."}
                });
                return;
            }

            console.log("Check 2");

            const {userId, userName, roomId} = result.data;

            console.log(`[JOIN_ROOM] ${userName} ${userId} wants to join room ${roomId}`);

            const room = await Room.findOne({roomId});

            if(!room){
                SendMessage(ws, {
                    type: OutgoingSupportedMessage.RoomError,
                    payload: {message: "Room does not exist."}
                });
                return;
            }

            if(room.isPrivate && !room.allowedUsers.includes(userId)){
                SendMessage(ws, {
                    type: OutgoingSupportedMessage.RoomError,
                    payload: {message: "You are not allowed to join the room."}
                });
                return;
            }

            console.log("JOIN ROOM add user is being called successfully.")
            userManager.addUser(userId, roomId, userName, ws);

            const previousChats = await store.getChats(roomId, 50, 0);

            for(const chat of previousChats){
                SendMessage(ws, {
                    type: OutgoingSupportedMessage.AddChat,
                    payload: {
                        chatId: chat.chatId,
                        roomId: chat.roomId,
                        userId: chat.userId,
                        message: chat.message,
                        userName: chat.userName,
                        upvotes: chat.upvotes,
                    }
                });
            }

            userManager.broadcastToAllExcept(roomId, {
                type: OutgoingSupportedMessage.UserJoined,
                payload: {userId, userName}
            }, userId)
        }
        break;

        case IncomingSupportedMessage.SendMessage:{
            console.log("[SERVER] Received SEND_MESSAGE");
            const result = UserMessage.safeParse(IncomingMessage.payload);

            if(!result.success){
                SendMessage(ws, {
                    type: OutgoingSupportedMessage.RoomError,
                    payload: {message: "Invalid message format."}
                });
                return;
            }

            const {userId, userName, roomId, message} = result.data;

            const room = await Room.findOne({roomId});

            if(!room){
                SendMessage(ws, {
                    type: OutgoingSupportedMessage.RoomError,
                    payload: {message: "Room does not exist"}
                });
                return;
            }

            const isAllowed = room.allowedUsers.includes(userId) || !room.isPrivate;

            if(!isAllowed){
                SendMessage(ws, {
                    type: OutgoingSupportedMessage.RoomError,
                    payload: {message: "You are not the member of this room"}
                });
                return;
            }

            const savedChat = await store.addChat(roomId, userId, userName, message);

            if(!savedChat){
                console.error("Failed to save chat.");
                return;
            }

            console.log("[SERVER] Broadcasting ADD_CHAT to the room.", roomId);
            userManager.broadcastToAll(roomId, {
                type: OutgoingSupportedMessage.AddChat,
                payload: {
                    chatId: savedChat.chatId,
                    roomId: savedChat.roomId,
                    userId: savedChat.userId,
                    message: savedChat.message,
                    userName: savedChat.userName,
                    upvotes: savedChat.upvotes
                }
            });
        }
        break;

        case IncomingSupportedMessage.UpvoteMessage: {
            const result = UpvoteMessage.safeParse(IncomingMessage.payload);

            if(!result.success){
                SendMessage(ws, {
                    type: OutgoingSupportedMessage.RoomError,
                    payload: {message: "Invalid upvote payload."}
                });
                return;
            }

            const {userId, roomId, chatId} = result.data;

            const room = await Room.findOne({roomId});

            if(!room){
                SendMessage(ws, {
                    type: OutgoingSupportedMessage.RoomError,
                    payload: {message: "Room does not exist"}
                });
                return;
            }

            const isAllowed = room.allowedUsers.includes(userId) || !room.isPrivate;

            if(!isAllowed){
                SendMessage(ws, {
                    type: OutgoingSupportedMessage.RoomError,
                    payload: {message: "You are not the member of this room"}
                });
                return;
            }

            const upvotedChat = await store.upvote(userId, roomId, chatId );

            if(!upvotedChat){
                console.error("Error in upvoting chat.");
                return;
            }

            userManager.broadcastToAll(roomId, {
                type: OutgoingSupportedMessage.UpvoteChat,
                payload: {
                    chatId: upvotedChat.chatId,
                    upvotes: upvotedChat.upvotes
                }
            })
        }
        break;

        default:
            console.warn("Unknown message type:", IncomingMessage);
        break;
    }
}
}