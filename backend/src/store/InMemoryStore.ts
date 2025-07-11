import { Chat, Store} from "./Store"

let globalState = 0;

export interface Room {
    roomId: string,
    chats: Chat[] 
}
export class InMemoryStore implements Store {
    private store: Map<string, Room>

    constructor () {
        this.store = new Map<string, Room>();
    }

    initRoom(roomId: string){
        this.store.set(roomId, {
            roomId,
            chats: []
        })
    }

    getChats(roomId: string, limit: number, offset: number){
        const room = this.store.get(roomId);

        if(!room){
            return [];
        }

        return [...room.chats].reverse().slice(0, offset).slice(-limit);
    }

    addChat(roomId: string, userId: string, userName: string, message: string ){
        if(!this.store.get(roomId)){
            this.initRoom(roomId);
        }
        const room = this.store.get(roomId);

        if(!room){
            return;
        }

        const chat: Chat = {
            chatId: (globalState++).toString(),
            userId,
            userName,
            message,
            roomId,
            upvotes: []
        }

        room.chats.push(chat);

        return chat;
    }

    upvote(userId: string, roomId: string, chatId: string) {
        const room = this.store.get(roomId);

        if(!room){
            return null;
        }

        const chat = room.chats.find((chat) => chat.chatId === chatId);

        if(chat && !chat.upvotes.includes(userId)){
            chat.upvotes.push(userId);
        }

        return chat;
    }
}