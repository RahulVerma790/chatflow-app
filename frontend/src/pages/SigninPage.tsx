import { useState } from "react"
import { ButtonComponent } from "../components/ButtonComponent"
import { InputComponent } from "../components/InputComponent"
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export const SigninPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    function send(){
        if(!email || !password){
            alert("Please fill all the fields.");
            return;
        }

        axios.post(`${import.meta.env.VITE_API_URL}/api/v1/signin`, {
            email: email,
            password: password,
        }).then((res) => {
            alert("Signin successful");
            localStorage.setItem("token", `Bearer ${res.data.token}`);
            storeInfo();

            setEmail("");
            setPassword("");
            navigate("/dashboard");
        }).catch((err) => {
            alert("Signin error: " + (err.response.data.message || "Unknown error"));
        })
    }

    function storeInfo(){
        const token = localStorage.getItem("token");

        if(!token) return;

        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/dashboard`, {
            headers: {
                authorization: token
            }
        }).then(res => {
            const {userId, userName} = res.data;
            localStorage.setItem("userId", userId);
            localStorage.setItem("userName", userName);
        }).catch(err => {
            console.log("Error in storing userId and userName locally. ",err);
        })
    }

    return <>
    <div className={`fixed m-8 rounded-2xl shadow-xl bg-gray-800 z-20 text-white p-10 text-3xl font-bold`}>
        Welcome to ChatFlow
    </div>
    <div className={`fixed bg-gray-900 min-h-screen w-screen flex justify-center items-center text-white`}>
        <div className={`bg-gray-800 w-auto h-96 rounded-xl shadow-xl p-6`}>
            <div className={`flex justify-center mb-12`}>
                <span className={`bg-gray-900 text-2xl font-bold p-2 pr-6 pl-6 rounded`}>Sign In</span>
            </div>
            <form className={``} onSubmit={(e) => {
                e.preventDefault();
                send();
            }}>
                <div className={`pt-5`}>
                    <InputComponent text="E-mail" value={email} onChange={(e) => setEmail(e.target.value.trim())} />
                </div>
                <div className={`mt-5`}>
                    <InputComponent text="Password" value={password} onChange={(e) => setPassword(e.target.value.trim())}/>
                </div>
                <div className={`flex justify-center mt-12`}>
                    <ButtonComponent text="Submit"/>
                </div>
            </form>
            <div className={`mt-5 text-gray-400 text-sm flex justify-center`}>
                <span>
                    If you haven't signed up yet, <Link className={`text-blue-500`} to="/signup">Register for free</Link>
                </span>
            </div>
        </div>
    </div>
    </>
}