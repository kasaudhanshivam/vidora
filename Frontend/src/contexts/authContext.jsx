import { createContext, useContext } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate} from "react-router-dom";
import httpStatus from "http-status";
import env from "../environment";

export const AuthContext = createContext();

const client = axios.create({
    baseURL : env.serverURL
})

export const AuthProvider = ({children}) => {

    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext);

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            });
            if(request.status === httpStatus.CREATED){
                return request.data.message;
            }
            
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    };

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });
            if(request.status === httpStatus.OK){
                localStorage.setItem("token", request.data.token);
                return request.data.message;
            }

        } catch (error) {
            console.error("Error logging in user:", error);
            throw error;
        }
    };

    const router = useNavigate();

    const getUserHistory = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data;
        } catch (error) {
            console.error("Error fetching user history:", error);
            throw error;
        }
    };

    const addToHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request.data;
        } catch (error) {
            throw error;
        }
    };

    const data = {
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        getUserHistory,
        addToHistory
    }


    return <AuthContext.Provider value={data}>
        {children}
    </AuthContext.Provider>;

    
}