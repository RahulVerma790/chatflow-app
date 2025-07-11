import { Request, Response } from "express";
import { MongoStore } from "../../store/MongoStore";
import { Room } from "./room.model";
import { User } from "../auth/auth.models";
import { ChatMessage } from "../chat/chat.model";
import { UserManager } from "../../UserManager";
import { SupportedMessage as OutgoingSupportedMessage } from "../../messages/outgoingMessages";

const store = new MongoStore();
const userManager = new UserManager();

export const createRoomController = async (req: Request, res: Response) => {
    const {roomName, isPrivate} = req.body;
    const userId = (req as any).user.userId;

    try {
        const createdRoom = await store.initRoom(roomName, userId, isPrivate);
        res.status(201).json({
            message: "Room created successfully.",
            room: {
                roomId: createdRoom.roomId,
                roomName: createdRoom.roomName,
                isPrivate: createdRoom.isPrivate,
            }
        });
    } catch(err){
        console.log("Error in creating room: ",err);
        res.status(500).json({message: "Internal server error: Rooms creating endpoint."});
        return;
    }
};

export const fetchRoomController = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try{
        const createdRooms = await Room.find({createdBy: userId});

        const availableRooms = await Room.find({
            allowedUsers: userId,
            createdBy: {$ne: userId}
        })

        res.status(200).json({
            message: "Rooms are fetched successfully.",
            createdRooms: createdRooms,
            availableRooms: availableRooms,
        })
    } catch(err){
        console.log("Error in fetching rooms: ",err);
        res.status(500).json({
            message: "Internal server error: Fetching created rooms."
        });
    }   
};

export const joinRoomController = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const roomId = req.params.roomId;

    try {
        const room = await Room.findOne({roomId});

        if(!room){
            res.status(404).json({message: "Room does not exist."});
            return;
        }

        if(room.allowedUsers.includes(userId)){
            res.status(200).json({message: "Already joined the room."});
            return;
        }

        if(!room.isPrivate){
            room.allowedUsers.push(userId);
            await room.save();
            res.status(200).json({message: "Joined public room successfully."});
            return;
        }

        if(room.joinRequests.includes(userId)){
            res.status(200).json({message: "Join request already sent."});
            return;
        }

        room.joinRequests.push(userId);
        await room.save();
        res.status(200).json({message: "Join request sent to the room admin."});
        return;
    }catch(err){
        console.log("Error in joining room: ",err);
        res.status(500).json({message: "Internal server error: Joining room endpoint."});
        return;
    }
};

export const fetchRoomRequestController = async (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    const adminId = (req as any).user.userId;

    try{
        const room = await Room.findOne({roomId});

        if(!room){
            res.status(404).json({message: "Room does not exist."});
            return;
        }

        if(adminId !== room.createdBy){
            res.status(403).json({message: "Only admins can allow user to enter the room."});
            return;
        }

        const joiningRequests = await User.find({_id: {$in: room.joinRequests}}).select("name email _id");

        res.status(200).json({
            message: "Join requests are fetched successfully.",
            joiningRequests
        });

    }catch(err){
        console.log("Error in fetching joining request: ", err);
        res.status(500).json({message: "Internal server error: Fetching joining request endpoint"});
        return;
    }
};

export const handleRoomRequestController = async (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    const adminId = (req as any).user.userId;
    const {userId, approve} = req.body;

    try {
        const room = await Room.findOne({roomId});

        if(!room){
            res.status(404).json({message: "Room does not exist"});
            return;
        }

        if(room.createdBy !== adminId){
            res.status(403).json({message: "Only admin is allowed to handle joining requests"});
            return;
        }

        if(!room.joinRequests.includes(userId)){
            res.status(400).json({message: "This user does not request to join the room"});
            return;
        }

        if(approve){
            room.allowedUsers.push(userId);
        }

        room.joinRequests = room.joinRequests.filter(id => id!==userId);
        await room.save();

        res.status(200).json({
            message: approve
            ? "User approved and added to the room."
            : "User is rejected by the admin to enter the room."
        });

        if(approve){
            userManager.sendToUser(userId, {
                type: OutgoingSupportedMessage.RoomCreated,
                payload: {
                    roomName: room.roomName,
                    roomId: room.roomId,
                    isPrivate: room.isPrivate,
                }
            });
        }
    } catch(err){
        console.log("Error in handling joining requests: ",err);
        res.status(500).json({
            message: "Internal server error: Error in handling requests endpoint."
        })
        return;
    }
};

export const fetchOldChatsController = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const roomId = req.params.roomId;

    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;

    try {
        const room = await Room.findOne({roomId});

        if(!room){
            res.status(404).json({message: "Room does not exist."});
            return;
        }

        if(room.isPrivate && !room.allowedUsers.includes(userId)){
            res.status(403).json({message: "Access denied"});
            return;
        }

        const messages = await ChatMessage.find({roomId})
        .sort({createdAt: -1})
        .skip(offset)
        .limit(limit)
        .lean() // return plain JS object

        messages.reverse();

        res.status(200).json({
            payload: {messages}
        })
    }catch(err){
        console.log("Error in fetching messages: ",err);
        res.status(500).json({message: "Internal server error: Fetching old messages endpoint."});
    } 
};

export const searchRoomController = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        const {roomId, roomName} = req.query;

        if(!roomId && !roomName){
            res.status(400).json({message: "Both roomId and roomName are not provided."});
            return;
        }

        let filter;
        if(roomId){
            filter = {roomId: {$regex: `^${roomId}`}}
        } else {
            filter = {roomName: {$regex: `^${roomName}`, $options: "i"}}
        }

        const rooms = await Room
        .find({
            $and: [
                filter,
                {createdBy: {$ne: userId}}
            ]
        })
        .limit(50)
        .select("roomId roomName isPrivate");

        res.status(200).json({
            messages: rooms.length ? "Rooms found" : "No room found",
            payload: {rooms}
        });

    }catch(err){
        console.log("Error in searching room: ",err);
        res.status(500).json({message: "Internal server error: Searching room endpoint."});
    }
}