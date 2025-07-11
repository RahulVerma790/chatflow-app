import { OutgoingMessages } from "../messages/outgoingMessages";
import { connection } from "websocket";

export function SendMessage(ws: connection, message: OutgoingMessages){
    ws.sendUTF(JSON.stringify(message));
}