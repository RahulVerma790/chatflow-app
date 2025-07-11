import { createContext, useContext, useEffect, useRef, useState } from "react";

type WebSocketContextType = {
    socket: WebSocket | null;
    socketReady: boolean
    sendMessage: (data: any) => void;
    messages: any[];
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const socketRef = useRef<WebSocket | null>(null);
    const [socketReady, setSocketReady] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const token = localStorage.getItem("token");

    useEffect(() => {

        if(!token) return;

        const socket = new WebSocket(`ws://localhost:3000`, 'echo-protocol');
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Websocket connected");
            setSocketReady(true);
        }

        socket.onmessage = (event) => {
            const data = event.data;

            if(!data){
                console.warn("WS: empty frame-ignoring");
                return;
            }

            let parsed;

            try {
                parsed = JSON.parse(data);
            }catch{
                console.warn("WS: malformes JSON-ignoring");
                return;
            }

            setMessages(prev => [...prev, parsed]);
        }

        socket.onclose = () => {
            console.log("Websocket disconnected");
            setSocketReady(false);
        }

        socket.onerror = (err) => {
            console.log("WebSocket error: ",err)
        }

        return () => {
            socket.close();
        };
    },[token]);

    useEffect(() => {
        let retryTimer: number;

        function connect(){
            const ws = new WebSocket("ws://localhost:3000", 'echo-protocol');
            socketRef.current = ws;
            
            ws.onopen = () => {
                console.log("WebSocket connected");
                setSocketReady(true);
                clearTimeout(retryTimer);
            };

            ws.onmessage = (event) => {
                const data = event.data;

                if(!data){
                    console.warn("WS: empty frame-ignoring");
                    return;
                }

                let parsed;

                try{
                    parsed = JSON.parse(data);
                }catch{
                    console.warn("WS: malformed JSON-ignoring");
                    return;
                }

                setMessages(prev => [...prev, parsed]);
            }

            ws.onerror = (event) => {
                console.error("WS error", event);
            }
 
            ws.onclose = () => {
                console.log("WS closed- retrying in 1s");
                setSocketReady(false);
                retryTimer = window.setTimeout(connect, 1000);
            };
        }

        if(token) connect;
        
        return () => {
            clearTimeout(retryTimer);
            socketRef.current?.close();
        };
    }, [token]);

    const sendMessage = (data: any) => {
        if(socketReady && socketRef.current){
            socketRef.current.send(JSON.stringify(data));
            console.log("Received data: ", data);
        }
    }

    return (
        <WebSocketContext.Provider value={{
            socket: socketRef.current, 
            socketReady,
            sendMessage, 
            messages}} >
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if(!context){
        throw new Error("useWebSocket must be within used between WebSocketProvider");
    }
    return context;
}

