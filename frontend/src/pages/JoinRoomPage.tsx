import { useEffect, useState } from "react"
import { SideBarComponent } from "../components/SideBarComponent"
import { useNavigate } from "react-router-dom"
import { SearchResultPanelComponent } from "../components/SearchResultBar";
import { InputComponent } from "../components/InputComponent";
import { ButtonComponent } from "../components/ButtonComponent";
import axios from "axios";
import type { Room } from "./DashboardPage";

export const JoinRoomPage = () => {

    const [showSearch, setShowSearch] = useState(false);
    const [roomName, setRoomName] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [resultMessage, setResultMessage] = useState<string>("");
    const [searchResult, setSearchResult] = useState<Room[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            navigate("/signin", {replace: true})
        }
    },[]);

    function joinRoom() {
        if(!roomId && !roomName){
            setResultMessage("Should atleast provide Room Id or Room Name.");
            return;
        }

        if(roomId && roomId.length < 8){
            setResultMessage("Room Id must have atleast 8 characters.");
            return;
        }

        const token = localStorage.getItem("token");

        if(!token){
            navigate("/signin");
        }

        axios.get("http://localhost:3000/api/v1/rooms/search", {
            params: {
                roomId: roomId || undefined,
                roomName: roomName || undefined
            }, 
            headers: {
                authorization: token
            }
        }).then((res) => {
            setSearchResult(res.data.payload.rooms);
            setResultMessage("");
            setShowSearch(true);
        }).catch((err) => {
            console.error("Error in fetching searched Rooms.", err);
            setResultMessage("Something went wrong. Pleae try again.")
        })
    }
    
    return <>
    <div className={'fixed z-10 text-white ml-64 p-10'}>
        <span className={`text-4xl font-bold tracking-wide`}>Join Room</span>
    </div>

    <div className={`flex h-screen`}>
        <div className={`w-64`}>
            <SideBarComponent/>
        </div>

        <div className={`flex-1 bg-gray-900 h-screen w-screen text-white flex items-center justify-center`}>
            <div className={`w-96 h-96 bg-gray-800 py-8 px-5 rounded-xl transition-all duration-300 ease-in-out
                ${showSearch ? "mr-96" : "mr-16"} border border-gray-400`}>
                <div className="flex flex-col">
                    <div className={`flex justify-center`}>
                        <span className={`text-2xl font-semibold bg-gray-900 px-2 py-1 border border-gray-400 rounded mb-14`}>
                            Join Room
                        </span>
                    </div>

                    <form className={`space-y-4`} onSubmit={(e) => {
                        e.preventDefault();
                        joinRoom();
                    }}>
                        <div className="flex justify-center">
                            <InputComponent
                                text="Room Id"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-center">
                            <InputComponent
                                text="Room Name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                            />
                        </div>
                    </form>
                    <div className={`flex justify-end text-sm text-red-500 pt-1 pr-3`}>
                        {resultMessage}
                    </div>

                    <div className="flex justify-center mt-10">
                        <ButtonComponent text="Search Room" onClick={joinRoom}/>
                    </div>
                </div>
            </div>
        </div>   

        <div>
            <SearchResultPanelComponent
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                rooms={searchResult}
            />
        </div>
    </div>
    </>
}