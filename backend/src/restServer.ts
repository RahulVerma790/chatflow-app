import express from "express";
import { User } from "./models/Users";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware/authMiddleware";
import { MongoStore } from "./store/MongoStore";
import { Room } from "./models/RoomModel";
import { connectToDB } from "./db";
import cors from "cors"

const app = express();
connectToDB();
const store = new MongoStore();

app.use(express.json());
app.use(cors());

export const JWT_PASS = "CHAT_FLOW_AUTH";

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

app.get("/api/v1/dashboard", authMiddleware, (req, res) => {
    const userId = (req as any).user.userId;
    res.status(200).json({
        message: `Welcome user ${userId}`
    })
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

        const accessibleRooms = await Room.find({
            $or: [
                {isPrivate: false},
                {allowedUsers: userId}
            ]
        })

        res.status(200).json({
            message: "Rooms are fetched successfully.",
            createdRooms: createdRooms,
            availableRooms: accessibleRooms,
        })
    } catch(err){
        console.log("Error in fetching rooms: ",err);
        res.status(500).json({
            message: "Internal server error: Fetching created rooms."
        });
    }
});

app.get("/api/v1/rooms/:roomId/join", authMiddleware, async (req, res) => {
    const userId = (req as any).user.userId;
    const roomId = req.params.roomId;

    try {
        const room = await Room.findOne({roomId});

        if(!room){
            res.status(404).json({message: "Room does not exist."});
            return;
        }

        if(room.allowedUsers.includes(userId)){
            res.status(200).json({message: "Already joined the room"});
            return;
        }

        if(!room.isPrivate){
            room.allowedUsers.push(userId);
            await room.save();
            res.status(200).json({message: "Joined public room successfully"});
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
        res.status(500).json({message: "Internal server error: Joining room endpoint"});
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
})

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

        if(room.createdBy === adminId){
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
        })
    } catch(err){
        console.log("Error in handling joining requests: ",err);
        res.status(500).json({
            message: "Internal server error: Error in handling requests endpoint."
        })
        return;
    }
})

function main(){
    app.listen(4000, () => {
        console.log("Rest Server is listening on port 3000");
    });
}

main();
