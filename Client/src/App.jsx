import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './features/Login/Login'
import Home from './features/Home/Home'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Index from './features/Index';
import {NavigationProvider} from './contexts/NavigationContext'


export default function App() {

  const navigate = useNavigate();
  const [authenticate , isAuthenticate] = useState(false);
  

  useEffect(()=>{
    const token = localStorage.getItem('LifeOs_token');
    const now = new Date();
    console.log(token.expiry);
    if(!token || now.getTime() > token.expiry){
      toast.error("You are not logged in !!");
      navigate("/login");
    }else{
      toast.success("You are logged in .. ")
    }
  }, []);

  return (
    <div className='h-screen w-screen flex justify-center items-center'>
      <NavigationProvider>
      {
        !authenticate ? <Routes>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/' element={<Index/>}></Route>
        </Routes> : <Routes><Route path='/' element={<Index/>}></Route></Routes>
      }
      </NavigationProvider>
    </div>
  )
}
