import { useContext } from "react";
import { AccessConstComponent } from "./AccessIcon";
import { ButtonComponent } from "./ButtonComponent";
import { RoomActionsContext } from "../context/RoomActions";

export interface RoomItemProps {
    roomName: string;
    isPrivate: boolean;
    roomId?: string
    createdRooms?: boolean;
    searchedRooms?: boolean;
    message?: string
    setMessage?:(msg: string) => void
}

export const RoomItemComponent = (props: RoomItemProps) => {

    const roomActions = useContext(RoomActionsContext);

    if(!roomActions){
        return null;
    }

    const handleJoin = () => {
        if(!props.roomId) return;
        roomActions.joinRoom(props.roomId, props.isPrivate);
    }

    return <div className={`text-white pl-2 pr-2 p-1 bg-gray-900 border border-gray-400 mb-3`}>
        <div className={`flex justify-between items-center`}>
            <div className={`text-sm w-80`}>
                <div className={`font-bold`}>
                    {props.roomName}
                </div>
                <div className={`text-white text-sm font-light`}>
                    Room Id: {props.roomId?.slice(0,8)}
                </div>
            </div>
            <div className={`pl-4`}>
                <AccessConstComponent text={props.isPrivate ? "Private" : "Public"}/>
            </div>
        </div> 
        <div className={`mt-2 mb-2 flex justify-between`}>
            <ButtonComponent text={props.searchedRooms && props.isPrivate ? "Send Request" : "Enter Room"} 
                size="sm"
                onClick={handleJoin}
            />

            {props.message && <div className="text-white">
                {props.message}
            </div>}
        </div>
    </div>
}