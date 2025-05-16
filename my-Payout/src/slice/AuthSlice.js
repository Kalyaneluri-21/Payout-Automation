import React from "react";
import {createAsyncThunk,createSlice} from '@reduxjs/toolkit'
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,} from 'firebase/auth'
import {auth, db} from "../Js-Files/Firebase"
import { doc, getDoc, setDoc } from "firebase/firestore";
 

 
export const signup =  createAsyncThunk(
    'auth/signup',
     async({email,password,role}, thunkAPI)=>{
       try {
         const userCredential = await createUserWithEmailAndPassword(
             auth,
             email,
             password
         );
         const user =  userCredential.user
         await setDoc(doc(db,"users",user.uid),{
            uid: user.uid,
            email:user.email,
            role: role
         });
         return {...user,role}
       } catch (error) {
         return thunkAPI.rejectWithValue(error.message)
       }
    }
);


export const login = createAsyncThunk(
    'auth/login',
     async({email,password}, thunkAPI)=>{
       try {
         const userCredential = await signInWithEmailAndPassword(
             auth,
             email,
             password
         );
         const user =  userCredential.user
         const userData = await getDoc(doc(db,"users",user.uid))
         if(!userData.exists()) throw new Error("user role not Found")
            const details = userData.data()
        return {...user, role: details.role}
       } catch (error) {
         return thunkAPI.rejectWithValue(error.message)
       }
    }
);


const AuthSlice = createSlice({
    name: 'auth',
    initialState:{
        user:null,
        loading: false,
        error: null,
    },
    reducers:{
        logoutUser:(state)=>{
            state.user = null,
            state.error = null
        }
    },
    extraReducers: (builder)=> {
        builder
        .addCase(signup.pending, state => {
            state.loading = true
        })
        .addCase(signup.fulfilled, (state,action) =>{
            state.loading = false,
            state.user = action.payload
        })
        .addCase(signup.rejected, (state,action)=>{
            state.loading = false,
            state.error = action.payload
        })
         .addCase(login.pending, state => {
            state.loading = true
        })
        .addCase( login.fulfilled, (state,action) =>{
            state.loading = false,
            state.user = action.payload
        })
        .addCase( login.rejected, (state,action)=>{
            state.loading = false,
            state.error = action.payload
        })
    }
});

export const { logoutUser } = AuthSlice.actions;
export default AuthSlice.reducer;
