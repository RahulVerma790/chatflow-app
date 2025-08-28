import { useWebSocket } from "../context/WebSocket";
import { ThumbUpIcon } from "../icons/thumbUp";
import { ButtonComponent } from "./ButtonComponent";
import { ThumbDownIcon } from "../icons/thumbDown";

interface MessageProps {
    message: string;
    userId: string,
    userName: string,
    roomId: string,
    chatId: string,
    upvotes: string[],
    createdAt: Date
    currentUserId?: string | null
}

export const MessageItemComponent = (props: MessageProps) => {

    const {sendMessage} = useWebSocket();

    const hasUpvoted = props.upvotes.includes(props.currentUserId ?? "");

    const handleUpvote = () => {
        sendMessage({
            type: "UPVOTE_MESSAGE",
            payload: {
                userId: props.currentUserId,
                chatId: props.chatId,
                roomId: props.roomId
            }
        })
    }

    return <>
        <div className={`flex-1 max-w-80 bg-gray-900 border border-gray-400 px-3 py-1 rounded`}>
            <div className={`flex justify-between text-sm text-blue-400`}>
                <div>
                    {props.userName}
                </div>
                <div>
                    {new Date(props.createdAt).toLocaleTimeString("en-IN", {
                        hour: "numeric",
                        minute: "numeric"
                    })}
                </div>
            </div>
            <div>
                {props.message}
            </div>
            <div className={`flex justify-between mt-2`}>
                <div className={`flex gap-2 items-center`}>
                    Upvotes
                    <ButtonComponent 
                        variant="upvote" 
                        onClick={handleUpvote} 
                        text="" 
                        size="upVote" 
                        icon={hasUpvoted ? <ThumbDownIcon size="sm"/> :<ThumbUpIcon size="sm"/>}
                    />
                </div>
                <div>
                    {props.upvotes.length}
                </div>
            </div>
        </div>
    </>
}