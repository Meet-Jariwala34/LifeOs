import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './features/Login/Login'
import Home from './features/Home/Home'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Index from './features/Index';
import NotFound from './error/NotFound';
import {NavigationProvider} from './contexts/NavigationContext'


export default function App() {

  const navigate = useNavigate();
  const [authenticate , isAuthenticate] = useState(false);
  

  useEffect(() => {
  const rawData = localStorage.getItem('LifeOs_token');
  const now = new Date();

  // If nothing exists in storage, boot straight to login
  if (!rawData) {
    toast.error("You are not logged in !!");
    navigate("/login");
    return;
  }

  // 🚀 THE FIX: Parse the raw string back into a working object
  try {
    const session = JSON.parse(rawData);
    console.log("Session Expiry Time:", session.expiry);

    if (now.getTime() > session.expiry) {
      toast.error("Session expired! Please log in again.");
      localStorage.removeItem('LifeOs_token'); // Clean up stale data
      navigate("/login");
    } else {
      toast.success("Welcome back! Synchronized.");
    }
  } catch (err) {
    console.error("Corrupted session token string data cleared:", err);
    localStorage.removeItem('LifeOs_token');
    navigate("/login");
  }
}, []);

  return (
    <div className='h-screen w-screen flex justify-center items-center'>
      <NavigationProvider>
      {
        !authenticate ? <Routes>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/' element={<Index/>}></Route>
          <Route path="*" element={<NotFound />} />
        </Routes> : <Routes><Route path='/' element={<Index/>}></Route><Route path="*" element={<NotFound />} /></Routes>
      }
      </NavigationProvider>
    </div>
  )
}
