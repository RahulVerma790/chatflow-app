export enum SupportedMessage {
    UserJoined ="USER_JOINED",
    AddChat = "ADD_CHAT",
    UpvoteChat = "UPVOTE_CHAT",
    RoomError = "ROOM_ERROR",
    RoomCreated = "ROOM_CREATED",
}

type MessagePayload = {
    chatId: string,
    roomId: string,
    userId: string,
    message: string,
    userName: string,
    upvotes: string[],
}

export  type OutgoingMessages = {
    type: SupportedMessage.AddChat,
    payload: MessagePayload
} | {
    type: SupportedMessage.UpvoteChat,
    payload: Partial<MessagePayload>
} | {
    type: SupportedMessage.RoomError,
    payload: {
        message: string,
    }
} | {
    type: SupportedMessage.RoomCreated,
    payload: {
        roomName: string,
        roomId: string,
        isPrivate: boolean,
    };
} | {
    type: SupportedMessage.UserJoined,
    payload: {
        userId: string,
        userName: string,
    }
}