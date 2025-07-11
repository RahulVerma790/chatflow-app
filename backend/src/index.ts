import {connection, server as WebSocketServer} from "websocket"
import express from "express";
import { User } from "./models/Users";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware/authMiddleware";
import cors from "cors"
import http from "http"
import { UserManager} from "./UserManager";
import { connectToDB } from "./db";
import { MongoStore } from "./store/MongoStore";
import { Room } from "./models/RoomModel";
import { JWT_PASS } from "./config";
import { IncomingMessages, SupportedMessage as IncomingSupportedMessage, InitMessage, UpvoteMessage, UserMessage } from "./messages/incomingMessages";
import { OutgoingMessages, SupportedMessage as OutgoingSupportedMessage } from "./messages/outgoingMessages";
import { ChatMessage } from "./models/ChatMessages";

const app = express();
const server = http.createServer(app);
connectToDB();

const userManager = new UserManager();
const store = new MongoStore();

server.listen(3000, function() {
    console.log((new Date()) + 'Combined HTTP + WebSocket server running on port 3000.');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin: string) {
  // put logic here to detect whether the specified origin is allowed.
  const allowed = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ];

  return allowed.includes(origin);
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    const connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
        // Todo add rate limiting logic
        if (message.type === 'utf8') {
            const data = message.utf8Data;
            if(!data){
                return;
            }

            let parsed;

            try {
                parsed = JSON.parse(data);
            }catch{
                connection.sendUTF(JSON.stringify({
                    type: OutgoingSupportedMessage.RoomError,
                    payload: {message: "Malformed JSON"}
                }));
                return;
            }
            messageHandler(connection, parsed);
        }
        if(message.type !== 'utf8'){
            return;
        }
    });

    connection.on('close', function(reasonCode, description){
        userManager.removeConnection(connection);
        console.log(`WebSocket connection closed. Reason: ${reasonCode}, ${description}`);
        // Todo add remove user Logic here
    })
});

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"]
}));

app.post("/api/v1/signup", async function(req, res){
    const {userName, email, password} = req.body;

    try {
        const user = await User.findOne({email});

        if(user){
            res.status(409).json({
                message: "User has already signed-up"
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            userName, 
            email,
            password: hashedPassword
        })

        res.status(201).json({
            message: "User has successfully signed up;"
        });

    } catch(err){
        console.log("Signup error: ", err);
        res.status(501).json({
            message: "Internal error: Signup end point"
        });
        return;
    }
});

app.post("/api/v1/signin", async function(req, res){
    const {email, password} = req.body;

    try {

        const user = await User.findOne({email});

        if(!user){
            res.status(409).json({
                message: "User does not exist"
            });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(passwordMatch){
            const token = jwt.sign({
                userId: user._id
            }, JWT_PASS, 
            {expiresIn: "1h"});

            res.status(201).json({
                message: "You are successfully signed in.",
                token: token
            })
        } else {
            res.status(401).json({
                message: "Invalid credentials."
            })
            return;
        }

    }catch(err){
        console.log("Signin error: ",err);
        res.status(501).json({
            message: "Internal error: Signin endpoint"
        });
        return;
    }
});

app.get("/api/v1/dashboard", authMiddleware, async (req, res) => {
    const userId = (req as any).user.userId;
    
    try {
        const user = await User.findOne({_id: userId});

        if(!user){
            res.status(404).json({
                message: "User does not exist."
            });
            return;
        }

        res.status(200).json({
            userName: user.userName,
            userId: userId
        });
    }catch(err){
        console.log("Error from the dashboard endpoint", err);
        res.status(500).json({
            message: "Internal error: Dashboard endpoint."
        })
    }
});

app.get("/api/v1/dashboard/recent-rooms", authMiddleware, async(req, res) => {
    const userId = (req as any).user.userId;

    try {
        const recentMessages = await ChatMessage.aggregate([
            {$match: {userId}},
            {$sort: {createdAt: -1}},
            {$group: {
                _id: "$roomId",
                lastMessage: {$first: "$createdAt"}
            }},
            {$limit: 10}
        ]);

        const roomIds = recentMessages.map((msg) => msg._id);

        const rooms = await Room.find({roomId: {$in: roomIds}});

        res.status(200).json({
            message: "Recent rooms fetched successfully.",
            payload: {rooms}
        })
    }catch(err){
        console.log("Error in fetching recent-rooms. ", err);
        res.status(500).json({
            message: "Internal server error: Recent Rooms endpoint."
        });
    }
});

app.post("/api/v1/rooms", authMiddleware, async (req, res) => {
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
});

app.get("/api/v1/rooms", authMiddleware, async (req, res) => {
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
});

app.post("/api/v1/rooms/:roomId/join", authMiddleware, async (req, res) => {
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
});

app.get("/api/v1/rooms/:roomId/requests", authMiddleware, async(req, res) => {
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
});

app.post("/api/v1/rooms/:roomId/requests/handle", authMiddleware, async (req, res) => {
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
});

app.get("/api/v1/rooms/:roomId/messages", authMiddleware, async(req, res) => {
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
});

app.get("/api/v1/rooms/search", authMiddleware, async(req, res) => {
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
});

function SendMessage(ws: connection, message: OutgoingMessages){
    ws.sendUTF(JSON.stringify(message));
}

async function messageHandler(ws: connection, IncomingMessage: IncomingMessages){
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
  