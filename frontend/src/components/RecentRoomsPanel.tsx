import { ArrowLeftIcon } from "../icons/arrowLeft"
import { ConversationsIcon } from "../icons/ConversationIcon"
import { ButtonComponent } from "./ButtonComponent"
import { ArrowRightIcon } from "../icons/arrowRight";

interface RecentRoomsProps {
    showConversation: boolean;
    setShowConversation: (value: boolean) => void
}

export const RecentRoomsPanelComponent = (props: RecentRoomsProps) => {

    return (
        <div className={`fixed right-0 top-0 transition-all duration-300 ease-in-out bg-gray-900 h-screen border-l border-gray-400 flex flex-col ${
            props.showConversation ? "w-96" : "w-16"
        }`}>
            <div className={`p-2 flex justify-end`}>
                <ButtonComponent
                    onClick={() => props.setShowConversation(!props.showConversation)}
                    text=""
                    icon={props.showConversation ? <ArrowRightIcon size="md"/> : <ArrowLeftIcon size="md"/>}
                    size="onlyIcon"
                />
            </div>

            <div>
                <div className={`text-white flex ${props.showConversation ? "justify-center" : "justify-end pr-2"}`}>
                        <span className={`text-3xl flex gap-2 items-center font-bold transition-all duration-300 ease-in-out`}>
                            <ConversationsIcon size="lg"/>
                            <span className={`${props.showConversation ? "opacity-100" : "opacity-0 w-0 overflow-hidden"} transition-all duration-300`}>
                                Conversations
                            </span>
                        </span>
                </div>

                {props.showConversation && 
                <div className={`border-t border-gray-700 mt-8`}>

                </div>}
            </div>
        </div>
    )
}