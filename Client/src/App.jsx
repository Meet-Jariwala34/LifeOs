import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './features/Login/Login'
import Home from './features/Home/Home'

export default function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/' element={<Home/>}></Route>
    </Routes>
  )
}
