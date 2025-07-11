import { Response, Request } from "express";
import { User } from "../auth/auth.models";
import { Room } from "../room/room.model";
import { ChatMessage } from "../chat/chat.model";

export const dashboardController = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    res.status(200).json({ userName: user.userName, userId: user._id });
  } catch (err) {
    console.log("Dashboard error:", err);
    res.status(500).json({ message: "Internal server error: Dashboard" });
  }
};

export const dashboardRecentRoomsController = async (req: Request, res: Response) => {
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
};