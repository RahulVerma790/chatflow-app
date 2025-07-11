import http from "http"
import { UserManager } from "../UserManager"
import { server as WebSocketServer } from "websocket";
import { createMessageHandler } from "./messageHandler";
import { MongoStore } from "../store/MongoStore";

const store = new MongoStore();

export const setupWebSocketServer = (server: http.Server, userManager: UserManager) => {
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

        const handler = createMessageHandler(userManager, store);
        userManager.attachEvents(connection, handler);
    });
}