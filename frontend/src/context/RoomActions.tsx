import axios from "axios";
import { createContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface RoomActions {
    joinRoom: (roomId: string, isPrivate: boolean) => void;
    requestMessage: string | null;
}

export const RoomActionsContext = createContext<RoomActions | null>(null);

export const RoomActionsProvider: React.FC<{children: React.ReactNode}> = ({children}) => {

    const navigate = useNavigate();
    const location = useLocation();
    const [requestMessage, setRequestMessage] = useState<string | null>(null);

    async function joinRoom (roomId: string) {
        const token = localStorage.getItem("token");

        if(!token){
            navigate("/signin", {replace: true});
            return;
        }

        axios.post(`http://localhost:3000/api/v1/rooms/${roomId}/join`,{},{
            headers: {
                authorization: token
            }
        }).then((res) => {
            const {message} = res.data;

            if(message === "Already joined the room." ||
               message === "Joined public room successfully."){
                sessionStorage.setItem("fromRoute", location.pathname);
                setRequestMessage("Already joined.")
                navigate(`/rooms/${roomId}`, {replace: true});
            }

            if(message === "Join request already sent." ||
               message === "Join request sent to the room admin."){
                alert("Join request send to the admin.");
                setRequestMessage("Join request send.")
            }
        }).catch((err) => {
            alert(err.response.data.message || "Failed to join room. Please try again.");
            setRequestMessage("Failed to join Room. Please try again.")
        })
    ''}

    return <RoomActionsContext.Provider value={{joinRoom, requestMessage: requestMessage}}>
        {children}
    </RoomActionsContext.Provider>
}