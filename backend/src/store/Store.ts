export interface Chat {
    chatId: string;
    userId: string;
    userName: string;
    message: string;
    roomId: string;
    upvotes: string[]; // who has upvoted the chat
}

export abstract class Store {
    constructor() {

    }

    initRoom(roomName: string, createdBy: string, isPrivate: boolean){

    }
    
    getChats(roomId: string, limit: number, offset: number){

    }

    addChat(roomId: string, userId: string, userName: string, message: string){

    }

    upvote(userId: string, roomId: string, chatId: string){

    }
}