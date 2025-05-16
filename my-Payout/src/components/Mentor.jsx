import React from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../slice/AuthSlice";
import { useNavigate } from "react-router-dom";

function Mentor(){

    const dispatch = useDispatch()
    const navigate = useNavigate()

    function handleLogout(){
        dispatch(logoutUser())
        navigate("/")
    }
    return(
        <>
        <button className="m-20 bg-red-700 p-3 text-black" onClick={handleLogout}>Logout</button>
        <h1>Mentor Page</h1>
        </>
    )
}

export default Mentor