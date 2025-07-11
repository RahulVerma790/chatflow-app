import { useEffect, useState } from "react";
import { InputComponent } from "../components/InputComponent"
import { SideBarComponent } from "../components/SideBarComponent"
import { ButtonComponent } from "../components/ButtonComponent";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const CreateRoomPage = () => {

    const [roomName, setRoomName] = useState<string>("");
    const [privateRoom, setPrivateRoom] = useState<boolean>(false);
    const [resultMessage, setResultMessage] = useState<string>("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(!token){
            navigate("/signin", {replace: true});
        }
    },[]);

    function createRoom(){
        if(!roomName){
            setResultMessage("Room Name must be provided.");
            return;
        }

        setResultMessage("");

        const token = localStorage.getItem("token");

        if(!token){
            navigate("/signin");
        }

        axios.post("http://localhost:3000/api/v1/rooms",{
            roomName: roomName,
            isPrivate: privateRoom
        }, {
            headers: {
                authorization: token
            }
        }).then(() => {
            setRoomName("");
            setPrivateRoom(false);
            setResultMessage("Room successfully created.");
        }).catch((err) => {
            setResultMessage("Something went wrong. Please try again.");
            console.error("Error in creating room.", err);
        })
    }

    return <>
    <div className={'fixed z-10 text-white ml-64 p-10'}>
        <span className={`text-4xl font-bold tracking-wide`}>Create Room</span>
    </div>

    <div className={`flex h-screen`}>
        <div className={`w-64`}>
            <SideBarComponent/>
        </div>

        <div className={`flex-1 bg-gray-900 h-screen w-screen text-white flex items-center justify-center`}>
            <div className="w-96 h-96 bg-gray-800 rounded-xl px-5 py-8 border border-gray-400">
                <div className={`flex flex-col`}>
                    <div className="flex justify-center">
                        <span className={`text-2xl font-semibold tracking-wide bg-gray-900 px-2 py-1 mb-14 rounded border border-gray-400`}>
                            Create Room
                        </span>
                    </div>

                    <form className={`space-y-4`}>
                        <div className="flex justify-center">
                            <InputComponent 
                                text="Room Name" 
                                value={roomName} 
                                onChange={(e) => setRoomName(e.target.value)} 
                            />
                        </div>

                        <div className={`flex justify-center`}>
                            <div className={`bg-gray-900 p-2 w-80 rounded border border-gray-400 flex justify-between items-center`}>
                                <label className={`text-gray-400`}>Private Room</label>
                                <input className="size-4" 
                                    type="checkbox" 
                                    checked={privateRoom} 
                                    onChange={(e) => setPrivateRoom(e.target.checked)}>
                                </input>
                            </div>
                        </div>
                    </form>
                    <div className={`flex mt-1 justify-end text-sm text-red-500 pr-3`}>
                        {resultMessage && <div>
                            {resultMessage}
                        </div>}
                    </div>

                    <div className="flex justify-center mt-10">
                        <ButtonComponent text="Create Room" size="default" onClick={createRoom}/>
                    </div>
                </div>
            </div>
        </div>   
    </div>
    </>
}