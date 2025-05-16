import React from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'
import Admin from './components/Admin'
import Mentor from './components/Mentor'

function App() {
   

  return (
    <>
       <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/admin' element={<Admin/>}/>
        <Route path='/mentor' element={<Mentor/>}/>
       </Routes>
    </>
  )
}

export default App
