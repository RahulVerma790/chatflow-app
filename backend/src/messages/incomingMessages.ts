import z from "zod";

export enum SupportedMessage {
    JoinRoom = "JOIN_ROOM",
    SendMessage = "SEND_MESSAGE",
    UpvoteMessage = "UPVOTE_MESSAGE",
}

export  type IncomingMessages = {
     type: SupportedMessage.JoinRoom,
     payload: InitMessageType 
} | {
     type: SupportedMessage.SendMessage,
     payload: UserMessageType
} | {
     type: SupportedMessage.UpvoteMessage,
     payload: UpvoteMessageType  
};
 
export const InitMessage = z.object({
    userId: z.string(),
    userName: z.string(),
    roomId: z.string(),
})

export type InitMessageType = z.infer<typeof InitMessage>;

export const UserMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    userName: z.string(),
    message: z.string(),
}) 

export type UserMessageType = z.infer<typeof UserMessage>;

export const UpvoteMessage = z.object({
    userId: z.string(),
    chatId: z.string(),
    roomId: z.string(),
})

export type UpvoteMessageType = z.infer<typeof UpvoteMessage>; 