import React, { useState } from "react";
import {useSelector,useDispatch} from "react-redux"
import { login} from "../slice/AuthSlice";
import { useNavigate } from "react-router-dom";
 
function Login(){
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [formerror,setFormerror] = useState("")
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {loading,error} = useSelector(state => state.auth);

    async function HandleSubmit(e){
        e.preventDefault()
        if(!email || !password){
            return setFormerror("Please fill all Fields")
        }
        if(password.length < 6){
            return setFormerror("Password must contain atleast 6 charcters")
        }
        setFormerror("")
         try {
              const logDetails =  await dispatch(login({email,password})).unwrap()
            if(logDetails.role == "admin"){
                navigate("/admin")
            }else{
                navigate("/mentor")
            }
            return;
         } catch (error) {
             alert(error.message)
            
         }
        
        setEmail("")
        setPassword("")
    }
     
    return(
        <>
        <div className="flex justify-center items-center mt-60">
        <div className="max-w-md mx-auto flex flex-col justify-center items-center rounded-2xl p-10 bg-slate-300 ">
        <h2 className="font-bold m-1">Login</h2>
        <form onSubmit={HandleSubmit}>
        <div>
            <input className="bg-gray-600 p-2 m-2 justify-center rounded-md text-white" type="email" value={email} placeholder="email" 
            onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div>
            <input className="bg-gray-600 p-2 m-2 justify-center rounded-md text-white" type="password" value={password} placeholder="password" 
            onChange={(e) => setPassword(e.target.value)}/>
        </div>
        {formerror && (<p>{formerror}</p>)}
        <div>
            <button className="bg-blue-400 rounded-2xl m-2 p-2 w-45 w-48" type="submit">{loading ? "Logging...":"Login"}</button>
        </div>
        </form>
        <p>Don't have any account?<a className="text-blue-800" href="/signup">Signup</a></p>
        </div>

        {error && <p>{error}</p>}

        </div>
        </>
    )
}

export default Login

