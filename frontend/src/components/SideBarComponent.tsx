import { ApproveRequestIcon } from "../icons/ApproveRequest"
import { CreateRoomIcon } from "../icons/CreateRoom"
import { DashBoardIcon } from "../icons/Dashboard"
import { UserIcon } from "../icons/UserIcon"
import { ButtonComponent } from "./ButtonComponent"
import { JoinRoomIcon } from "../icons/JoinRoom"
import { useLocation, useNavigate } from "react-router-dom"

export const SideBarComponent = () => {

    const navigate = useNavigate();

    const {pathname} = useLocation();

    const navItems = [
    { size: "lg", naviUrl:"/dashboard", text: "Dashboard", icon: <DashBoardIcon size="sm" /> },
    { size: "lg", naviUrl:"/create", text: "Create Room", icon: <CreateRoomIcon size="sm" /> },
    { size: "lg", naviUrl:"/join", text: "Join Room", icon: <JoinRoomIcon size="sm" /> },
    { size: "lg", naviUrl:"/approve", text: "Approve Request", icon: <ApproveRequestIcon size="sm" /> },
  ];

    return <div className={`fixed bg-gray-900 min-h-screen w-64 shadow-xl border border-gray-800 border-r-gray-400`}>
        <div className={`p-8 flex justify-center`}>
            <span className={`text-white text-3xl border tracking-wide border-gray-400 p-2 pl-4 pr-4 rounded bg-gray-900 font-bold`}>ChatFlow</span>
        </div>
        <div>
            <nav>
                <ul>
                    {navItems.map(item => {
                        const isActive = pathname === item.naviUrl;
                    
                        return (
                            <li className={`flex justify-center mb-3`}>
                                <ButtonComponent
                                    text={item.text}
                                    icon={item.icon}
                                    size={item.size}
                                    onClick={() => navigate(item.naviUrl)}
                                    variant={isActive ? "active" : "default"}
                                />
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </div>
        <div className={`fixed w-64 flex justify-center p-8 bottom-0 left-0`}>
            <ButtonComponent 
                text="Sign Out" 
                size="lg" 
                icon={<UserIcon size="sm" />} 
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("userName");
                    navigate("/signin");
                }}
            />  
        </div>
    </div>
}