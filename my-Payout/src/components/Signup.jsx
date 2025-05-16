import React, { useState } from "react";
import {useSelector,useDispatch} from "react-redux"
import { signup } from "../slice/AuthSlice";
import {useNavigate } from "react-router-dom";

function Signup(){
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [role,setRole] = useState("")
    const [formerror,setFormerror] = useState("")
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {loading,error} = useSelector(state => state.auth);

    async function HandleSubmit(e){
        e.preventDefault()
        if(!email || !password || !role){
            return setFormerror("Please fill all Fields")
        }
        if(password.length < 6){
            return setFormerror("Password must contain atleast 6 charcters")
        }
        setFormerror("")
        try {
            await dispatch(signup({email,password,role})).unwrap()
            navigate("/")
            setEmail("")
            setPassword("")
            setRole("")
        } catch (error) {
            console.log(error.message)
        }
    }
     
    return(
        <>
        <div className="flex justify-center items-center mt-60">
        <div className="max-w-md mx-auto flex flex-col justify-center items-center rounded-2xl p-10 bg-slate-300 ">
        <h2 className="font-bold m-1">SignUp</h2>
        <form onSubmit={HandleSubmit}>
        <div>
            <input className="bg-gray-600 p-2 m-2 justify-center rounded-md text-white" type="email" value={email} placeholder="email" 
            onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div>
             <select  name="role" className="bg-gray-500 w-48 rounded-md p-1 m-2 justify-center" 
             onChange={(e) => setRole(e.target.value)} value={role}>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="mentor">mentor</option>
             </select>
        </div>
        <div>
            <input className="bg-gray-600 p-2 m-2 justify-center rounded-md text-white" type="password" value={password} placeholder="password" 
            onChange={(e) => setPassword(e.target.value)}/>
        </div>
        {formerror && (<p>{formerror}</p>)}
        <div>
            <button className="bg-blue-400 rounded-2xl m-2 p-2 w-48 " type="submit">{loading ? "Signin...":"SignUp"}</button>
        </div>
        </form>
        <p>Already have account?<a className="text-blue-800" href="/">Login</a></p>
        </div>
        {error && <p>{error}</p>}

        </div>
        </>
    )
}

export default Signup

