import { useNavigate } from "react-router-dom"
import { SideBarComponent } from "../components/SideBarComponent"
import { useEffect } from "react";

export const ApproveRequestPage = () => {
    
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            navigate("/signin");
        }
    },[]);
    return <div className={`flex h-screen`}>
        <div className={`w-64`}>
            <SideBarComponent/>
        </div>

        <div className={`flex-1 bg-gray-900`}>

        </div>
    </div>
}