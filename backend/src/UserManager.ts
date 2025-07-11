import { connection } from "websocket";
import { OutgoingMessages, SupportedMessage as OutgoingSupportedMessage} from "./messages/outgoingMessages";
import { IncomingMessages } from "./messages/incomingMessages";

interface ConnectedUser {
    userId: string;
    userName: string;
    conn: connection
}

interface Room {
    users: ConnectedUser[]
}

export class UserManager {
    private rooms: Map<string, Room>;

    constructor(){
        this.rooms = new Map<string, Room>();
    }

    attachEvents(conn: connection, handler: (conn: connection, msg: IncomingMessages) => void){
        conn.on('message', function(message) {
            // Todo add rate limiting logic
            if (message.type === 'utf8') {
                const data = message.utf8Data;
                if(!data){
                    return;
                }

                let parsed;

                try {
                    parsed = JSON.parse(data) as IncomingMessages;
                }catch{
                    conn.sendUTF(JSON.stringify({
                        type: OutgoingSupportedMessage.RoomError,
                        payload: {message: "Malformed JSON"}
                    }));
                    return;
                }
                handler(conn, parsed);
            }
            if(message.type !== 'utf8'){
                console.warn("Unsupported Message Type received: ", message.type);
                return;
            }
        });

        conn.on('close', (reasonCode, description) => {
            this.removeConnection(conn);
            console.log(`WebSocket connection closed. Reason: ${reasonCode}, ${description}`);
        })
    }

    removeConnection(conn: connection){
        for(const [roomId, room] of this.rooms.entries()){
            const matches = room.users.filter(u => u.conn === conn);
            for(const u of matches){
                this.removeUser(u.userId, roomId);
            }
        }
    }

    addUser(userId: string, roomId: string, userName: string, conn: connection){
        let room = this.rooms.get(roomId);

        if(!room){
            room = {users: []}
            this.rooms.set(roomId, room);
        }

        room.users = room.users.filter(user => user.userId !== userId); // Replace older connection for the same user

        room.users.push({userId, userName, conn}); // Add new connection

        conn.on("close", () => {
            this.removeUser(userId, roomId);
            console.log(`User ${userId} disconnected from the room ${roomId}.`);
        });
    }

    removeUser(userId: string, roomId: string){
        const room = this.rooms.get(roomId);

        if(!room) return;

        room.users = room.users.filter(user => user.userId !== userId);

        if(room.users.length === 0){
            this.rooms.delete(roomId);
        }
    }

    broadcastToAll(roomId: string, message: OutgoingMessages){
        const room = this.rooms.get(roomId);

        if(!room) {
            console.warn("[SERVER broadcastToAll: no room found for", roomId);
            return;
        }

        const messageString = JSON.stringify(message);
        console.log(`[SERVER] Sending to ${room.users.length} clients in room ${roomId}:`, message);

        for(const user of room.users){
            try {
                user.conn.sendUTF(messageString);
            }catch(err){
                console.error(`Failed to send message to the user ${user.userId}`, err);
            }
        }
    }

    broadcastToAllExcept(roomId: string, message: OutgoingMessages, excludedUserId: string){
        const room = this.rooms.get(roomId);

        if(!room) return;

        const messageString = JSON.stringify(message);

        for(const user of room.users){
            if(user.userId === excludedUserId) continue;

            try{
                user.conn.sendUTF(messageString);
            }catch(err){
                console.error(`Failed to send message.`, err);
            }
        }
    }

    sendToUser(userId: string, message: OutgoingMessages){
        
    }
}