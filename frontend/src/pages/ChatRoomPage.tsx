import { useParams } from "react-router-dom"
import { SideBarComponent } from "../components/SideBarComponent";
import { RecentRoomsPanelComponent } from "../components/RecentRoomsPanel";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MessageItemComponent } from "../components/MessageItem";
import { useWebSocket } from "../context/WebSocket";
import { ButtonComponent } from "../components/ButtonComponent";
import { ConversationsIcon } from "../icons/ConversationIcon";
import { groupMessagesByDate } from "../utils/groupMessages";

export interface ChatMessage {
    message: string,
    userId: string,
    userName: string,
    roomId: string,
    chatId: string,
    upvotes: string[],
    createdAt: Date
}

export const ChatRoomPage = () => {
    const {roomId} = useParams <{roomId: string}> ();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [showConversation, setShowConversation] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef<number>(0);

    messages.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const groupedMessages = groupMessagesByDate(messages);

    const currentUserId = localStorage.getItem("userId");

    const {registerHandler, socketReady, sendMessage} = useWebSocket();

    useEffect(() => { // sending JOIN_ROOM message
        if(!roomId || !socketReady) return;

        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName");

        sendMessage({
            type: "JOIN_ROOM",
            payload: {
                roomId: roomId,
                userId: userId,
                userName: userName,
            }
        });

    }, [socketReady, roomId]);

    async function fetchMessages (initial = false) {
        const token = localStorage.getItem("token");

        if(!token) return;

        setLoadingMore(true);

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/rooms/${roomId}/messages?offset=${offsetRef.current}&limit=50`,{
                headers: { authorization: token }
            });

            const newMessages = res.data.payload.messages;

            setMessages(prev => initial ? newMessages : [...newMessages, ...prev]);

            offsetRef.current += newMessages.length;

            if(newMessages.length < 50){
                setHasMore(false);
            }
        } catch(err) {
            console.error("Error in fetching old messages: ",err);
        } finally {
            setLoadingMore(false);
        }
    }

    useEffect(() => {
        fetchMessages(true);
    }, [roomId]);

    const previousLengthRef = useRef(0);

    useEffect(() => { // handling scrolling
        const container = containerRef.current;
        if(!container) return;
        if(messages.length === 0) return;
        
        if(messages.length > previousLengthRef.current){
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
        }
        previousLengthRef.current = messages.length;
    },[messages]);

    useEffect(() => { // handling lazy loading
        const container = containerRef.current;

        if(!container) return;

        const handleScroll = () => {
            if(container.scrollTop < 100 && hasMore && !loadingMore){
                fetchMessages();
            }
        };

        container.addEventListener("scroll", handleScroll);

        return () => {
            container.removeEventListener("scroll", handleScroll);
        };

    },[hasMore, loadingMore]);

    useEffect(() => {
        if(!roomId) return;

        registerHandler("UPVOTE_CHAT", ({chatId, upvotes}) => {
            setMessages(prev =>
                prev.map(msg => 
                    msg.chatId === chatId ? {...msg, upvotes} : msg
                )
            )
        });

        registerHandler("ADD_CHAT", (payload) => {
            const newMessage = {
                chatId: payload.chatId,
                userName: payload.userName,
                userId: payload.userId,
                roomId: payload.roomId,
                message: payload.message,
                upvotes: payload.upvotes,
                createdAt: payload.createdAt
            };

            setMessages(prev => [...prev, newMessage])
        })
    },[roomId, registerHandler]);

    function handleSend(){
        if(!newMessage.trim()) return;

        if(!roomId) return;

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
                <div>
                    {groupedMessages.map(({dateHeader, messages}) => (
                        <div key={dateHeader}>
                            <div className={`text-center my-2 bg-gray-900 rounded border border-gray-400`}>{dateHeader}</div>

                            <div className="space-y-3">
                                {messages.map(msg => (
                                    <div className={`flex ${msg.userId === currentUserId ? "justify-end" : "justify-start"}`}>
                                        <MessageItemComponent
                                            key={msg.chatId}
                                            message={msg.message}
                                            userId={msg.userId}
                                            userName={msg.userName}
                                            roomId={msg.roomId}
                                            chatId={msg.chatId}
                                            upvotes={msg.upvotes}
                                            createdAt = {msg.createdAt}
                                            currentUserId= {currentUserId}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
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