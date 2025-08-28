import axios from "axios"
import { ButtonComponent } from "../components/ButtonComponent"
import { InputComponent } from "../components/InputComponent"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export const SignupPage = () => {

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    function send(){
        if(!userName || !email || !password){
            alert("Please fill all the fields.");
            return;
        }

        axios.post(`${import.meta.env.VITE_API_URL}/api/v1/signup`, {
            userName: userName,
            email: email,
            password: password,
        }).then((res) => {
            alert("Signup successful");
            console.log(res.data);

            setUserName("");
            setEmail("");
            setPassword("");
            navigate("/signin");
        }).catch(err => {
            alert("Signup failed: " + (err?.response?.data.message || "Unknown error"));
        });
    }

    return<>
    <div>
        <div className={` m-8 rounded-2xl shadow-xl bg-gray-800 fixed z-20 text-white p-10 text-3xl font-bold`}>
            Welcome to ChatFlow
        </div>
    </div>
    <div className={`bg-gray-900 w-screen min-h-screen text-white flex justify-center items-center`}>
            <div className={` m-2 w-96 h-96 bg-gray-800 rounded-xl shadow-xl p-8`}>
                <div className={`flex justify-center`}>
                    <span className={`text-2xl pl-6 pr-6 font-bold mb-8 bg-gray-900 p-2 rounded`}>Sign Up</span>
                </div>
                <form className={`space-y-6`} onSubmit={(e) => {
                    e.preventDefault();
                    send();
                }}>
                    <InputComponent value={userName} text="Name" onChange={(e) => setUserName(e.target.value)}/>
                    <InputComponent value={email} text="E-mail" onChange={(e) => setEmail(e.target.value)}/>
                    <InputComponent value={password} text="Password" onChange={(e) => setPassword(e.target.value)}/>
                    <div className={`flex justify-center`}>
                        <ButtonComponent text="Submit"/>
                    </div>
                </form>
        </div>
    </div>
    </>
}