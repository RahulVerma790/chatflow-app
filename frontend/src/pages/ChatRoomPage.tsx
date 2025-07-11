import { useParams } from "react-router-dom"
import { SideBarComponent } from "../components/SideBarComponent";
import { RecentRoomsPanelComponent } from "../components/RecentRoomsPanel";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MessageItemComponent } from "../components/MessageItem";
import { useWebSocket } from "../context/WebSocket";
import { ButtonComponent } from "../components/ButtonComponent";
import { ConversationsIcon } from "../icons/ConversationIcon";

interface ChatMessage {
    message: string,
    userId: string,
    userName: string,
    roomId: string,
    chatId: string,
    upvotes: string[]
}

export const ChatRoomPage = () => {
    const {roomId} = useParams<{roomId: string}>();

    const {sendMessage, socketReady, messages: incomingMessage} = useWebSocket();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [showConversation, setShowConversation] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number>(0);
    const offsetRef = useRef<number>(0);

    async function fetchMessages(initial=false){
        const token = localStorage.getItem("token");

        if(!token || !roomId){
            return;
        }

        setLoadingMore(true);

        try {
            const res = await axios.get(`http://localhost:3000/api/v1/rooms/${roomId}/messages?offset=${offsetRef.current}&limit=50`,{
                headers: {
                    authorization: token
                } 
            })

            const newMessages: ChatMessage[] = res.data.payload.messages;

            setMessages((prev) => initial ? newMessages : [...newMessages, ...prev]);
            offsetRef.current += newMessages.length;

            if(newMessages.length < 50){
                setHasMore(false);
            }
        }catch(err){
            console.error("Error in fetching initial messages", err);
        } finally {
            setLoadingMore(false);
        }
    }

    useEffect(() => {
        const container = containerRef.current;
        if(!container){
            return;
        }

        const handleScroll = () => {
            scrollPositionRef.current = container.scrollTop;

            if(container.scrollTop<100 && hasMore && !loadingMore){
                fetchMessages();
            }
        };

        container.addEventListener("scroll", handleScroll);

        return () => {
            container.removeEventListener("scroll", handleScroll);
        }

    },[hasMore, loadingMore]);

    useEffect(() => {
        fetchMessages(true);
    },[roomId])

    useEffect(() => {
        const container = containerRef.current;

        if(!container){
            return;
        }

        requestAnimationFrame(() => {
            if(scrollPositionRef.current === 0){
                container.scrollTop = container.scrollHeight;
            } else {
                container.scrollTop = container.scrollHeight - scrollPositionRef.current;
            }
        })
    },[messages]);

    useEffect(() => {
        const container = containerRef.current;

        if(!container || !roomId) return;

        const newChats = incomingMessage
        .filter((msg) => msg.type === "ADD_CHAT" && msg.payload.roomId === roomId)
        .map((msg) => ({
                message: msg.payload.message,
                userId: msg.payload.userId,
                userName: msg.payload.userName,
                roomId: msg.payload.roomId,
                chatId: msg.payload.chatId,
                upvotes: msg.payload.upvotes as string[]
            }));

            if(newChats.length === 0) return;
            
            setMessages((prev) => {
                const unseen = newChats.filter(nc => !prev.some(pm => pm.chatId === nc.chatId));
                return [...prev, ...unseen];
            });

            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
    },[incomingMessage, roomId]);

    function handleSend(){
        if(!roomId || !newMessage.trim()) return;

        const token = localStorage.getItem("token");

        if(!token) return;

        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName");

        sendMessage({
            type: "SEND_MESSAGE",
            payload: {
                userId: userId,
                userName: userName,
                roomId: roomId,
                message: newMessage.trim()
            }
        });

        setNewMessage("");

        requestAnimationFrame(() => {
            const container = containerRef.current;

            if(container){
                container.scrollTop = container.scrollHeight;
            }
        });
    }

    return <>
    <div className="flex h-screen">
        <div className="w-64">
            <SideBarComponent/>
        </div>

        <div className={`flex-1 flex flex-col bg-gray-900 text-white min-h-0`}>
            <header className={`p-10 flex-none border-b border-gray-700`}>
                <h1 className={`font-bold text-4xl`}>Room: {roomId?.slice(0,8)}</h1>
            </header>

            {loadingMore && (
                <div className="text-center text-gray-400 text-sm">Loading more...</div>
            )}

            <main
            ref={containerRef}
             className={`flex-1 overflow-y-auto bg-gray-800 min-h-0 px-4 py-4 space-y-3 mx-8`}>
                {messages.map(msg => (
                    <MessageItemComponent
                        message={msg.message}
                        userId={msg.userId}
                        userName={msg.userName}
                        roomId={msg.roomId}
                        chatId={msg.chatId}
                        upvotes={msg.upvotes.length}
                    />
                ))}
            </main>

            <footer className={`flex-none p-1 border-t border-gray-700 flex gap-2`}>
                <input 
                    className={`flex-1 p-2 bg-gray-900 border border-gray-400 rounded outline-none`}
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === "Enter"){
                            handleSend();
                        }
                    }}
                />
                <ButtonComponent onClick={() => handleSend()} text="Send Message" size="lg" icon={<ConversationsIcon size="sm"/>}/>
            </footer>
        </div>

        <div className={`bg-gray-900 transtion-all duration-300 ease-in-out
            ${showConversation ? "w-96" : "w-16"}`}>

            <RecentRoomsPanelComponent
                showConversation={showConversation}
                setShowConversation={setShowConversation}
            />
        </div>
    </div>
    </>
}