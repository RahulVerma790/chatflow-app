import { ArrowUpIcon } from "../icons/arrowUp";
import { ButtonComponent } from "./ButtonComponent";

interface MessageProps {
    message: string;
    userId: string,
    userName: string,
    roomId: string,
    chatId: string,
    upvotes: number
}

export const MessageItemComponent = (props: MessageProps) => {
    return <>
        <div className={`flex-1 max-w-80 bg-gray-900 border border-gray-400 px-3 py-1 rounded`}>
            <div className={`flex justify-end text-sm`}>
                {props.userName}
            </div>
            <div>
                {props.message}
            </div>
            <div className={`flex justify-between mt-2`}>
                <div className={`flex gap-2 items-center`}>
                    Upvotes
                    <ButtonComponent text="" size="upVote" icon={<ArrowUpIcon size="sm"/>}/>
                </div>
                <div>
                    {props.upvotes}
                </div>
            </div>
        </div>
    </>
}