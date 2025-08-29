import { useEffect, useState } from "react"
import { SideBarComponent } from "../components/SideBarComponent"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RecentRoomsPanelComponent } from "../components/RecentRoomsPanel";
import { RoomItemComponent } from "../components/RoomItem";

export interface Room {
    roomId: string,
    roomName: string,
    isPrivate: boolean
}

export const DashboardPage = () => {
    const [userName, setUserName] = useState<string>("");
    const [_recentRooms, setRecentRooms] = useState<Room[]>([]);
    const [showConversation, setShowConversation] = useState(false)
    const [createdRooms, setCreatedRooms] = useState<Room[]>([]);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/recent-rooms`, {
            headers: {
                authorization: token
            }
        }).then((res) => {
            setRecentRooms(res.data.payload.rooms);
        }).catch((err) => {
            console.error("Error in fetching recent-rooms. ",err);
        })
    },[])

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/dashboard`, {
            headers: {
                authorization: token,
            }
        }).then((res) => {
            setUserName(res.data.userName);
        }).catch((err) => {
            console.error("Error in fetching users data.", err);
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            navigate("/signin");
        })
    },[]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/rooms`, {
            headers: {
                authorization: token,
            }
        }).then((res) => {
            setCreatedRooms(res.data.createdRooms);
            setAvailableRooms(res.data.availableRooms);
        }).catch((err) => {
            console.error("Error in fetching created and available Rooms: ",err);
        })
    },[]);

    return <>
    <div className="flex h-screen">
        <div className="w-64">
            <SideBarComponent/>
        </div>

        <div className={`flex-1 flex flex-col bg-gray-900 text-white`}>
            <div className="flex-none p-10">
                <span className={`text-4xl tracking-wide font-bold`}>
                    Welcome back, {userName}
                </span>
            </div>
            
            <div className={`grid grid-cols-2 min-h-0 flex-1 mx-10 mb-7 transition-all duration-300 ease-in-out 
                ${
                    showConversation ? "gap-6" : "gap-12"
                }`} >

                <div className={`flex flex-col h-full min-h-0 bg-gray-800 rounded overflow-hidden`}>
                    <div className={`flex flex-none justify-center p-5 border-b border-gray-500`}>
                        <span className={`text-2xl font-semibold tracking-wide`}>Created Rooms</span>
                    </div>

                    <div className={`flex-1 px-5 py-3 overflow-y-auto`}>
                        {createdRooms.length === 0 ? (
                            <div className={`text-2xl text-center text-gray-400`} >No rooms created</div>
                        ):  (
                            createdRooms
                            .slice()
                            .reverse()
                            .map(room => (
                                <RoomItemComponent
                                key={room.roomId}
                                roomId={room.roomId}
                                roomName={room.roomName}
                                isPrivate={room.isPrivate}
                                />
                            ))
                        )} 
                    </div>
                </div>

                <div className={`flex flex-col h-full min-h-0 bg-gray-800 rounded overflow-hidden`}>
                    <div className="flex flex-none justify-center p-5 border-b border-gray-500">
                        <span className={`text-2xl font-semibold tracking-wide`}>Available Rooms</span>
                    </div>

                    <div className={`flex-1 px-5 py-3 overflow-y-auto`}>
                        {availableRooms.length === 0 ? (
                            <div className={`text-2xl text-center text-gray-400`}>No available Rooms</div>
                        ) : (
                            availableRooms.map(room => (
                                <RoomItemComponent
                                key={room.roomId}
                                roomId={room.roomId}
                                roomName={room.roomName}
                                isPrivate={room.isPrivate}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className={`transition-all duration-300 ease-in-out bg-gray-900
            ${showConversation ? "w-96" : "w-16"}`}>
            <RecentRoomsPanelComponent showConversation={showConversation}
            setShowConversation={setShowConversation}/>
        </div>
    </div>
    </>
}