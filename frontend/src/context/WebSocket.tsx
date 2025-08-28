import { createContext, useContext, useEffect, useRef, useState } from "react";

type WebSocketContextType = {
    socket: WebSocket | null;
    socketReady: boolean;
    sendMessage: (data: any) => void 
    registerHandler: (type: string , handler:(msg: any) => void) => void
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const socketRef = useRef<WebSocket | null>(null);
    const socketReadyRef = useRef<boolean>(false);
    const [socketReady, setSocketReady] = useState<boolean>(false);
    const messageHandlers = useRef(new Map <string, (payload: any) => void>());

    useEffect(() => {
        const socket = new WebSocket(`ws://${import.meta.env.VITE_API_URL.replace(/^http:\/\//, '')}`, 'echo-protocol');
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("[WEBSOCKET] is connected");
            socketReadyRef.current = true;
            setSocketReady(true);
        };

        socket.onmessage = (event) => {
            try {
                const {type, payload} = JSON.parse(event.data);
                
                const handler = messageHandlers.current.get(type);
                if(handler){
                    handler(payload);
                }
            } catch(err) {
                console.warn("WEBSOCKET: Malformed JSON ignored.", err);
            }
        };

        socket.onerror = (err) => {
            console.error("WEBSOCKET ERROR:", err);
        };

        socket.onclose = () => {
            console.log("[WEBSOCKET] is disconnected");
            socketReadyRef.current = false;
            setSocketReady(false);
        };

        return () => {
            socket.close();
        }
    },[]);

    const sendMessage = (data: any) => {
        if(socketReadyRef.current && socketRef.current?.readyState === WebSocket.OPEN){
            socketRef.current.send(JSON.stringify(data));
        } else {
            console.warn("WebSocket is not ready. Message not sent.");
        }
    }

    const registerHandler = (type: string, handler: (msg: any) => void) => {
        messageHandlers.current.set(type, handler);
    };

    return (
        <WebSocketContext.Provider value={{
            socket: socketRef.current,
            socketReady,
            sendMessage,
            registerHandler,
        }}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if(!context){
        throw new Error("useWebSocket must be used within a WebSocket Provider");
    }
    return context;
}