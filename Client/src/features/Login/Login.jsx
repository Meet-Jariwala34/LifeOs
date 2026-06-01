import React, { useState } from 'react';
import bgVid from '../../assets/loginBackgroundVid.mp4';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';

export default function Login() {

  const navigate = useNavigate();

  const [password , setPassword] = useState("");

  const handlePasswordChange = (e) =>{
    setPassword(e.target.value);
  }
  
  const handleKeyDown = (event) => {
    // Check if the pressed key is Enter
    if (event.key === 'Enter') {
      handleOnLogin();
    }
  };

  const handleOnLogin = async () => {
    try {
      const res = await axios.post(import.meta.env.VITE_API_BACKEND_URL + "/auth/login", {password : password})
      if(res.data.success){
        console.log(res.data.message);
        const now = new Date();
        localStorage.setItem('LifeOs_token' , {token : res.data.token , expiry : (now.getTime() + 100*60*60*8) } );
        navigate('/');
      }else{
        console.log(res.data.message)
      }
    } catch (error) {
      console.log("The error from handle login, Error : "+ error);
    }
  }

  return (
    <div id='login-background' className='relative flex h-screen w-screen items-center justify-center overflow-hidden transition-all duration-1000'>
        {/* LAYER 1: The 90-Degree Rotated Full-Screen Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute h-screen w-screen min-h-[100vw] min-w-[100vh] z-2 -rotate-90 object-contain mix-blend-luminosity"
        >
          <source src={bgVid} type="video/mp4" />
        </video>

        {/* Displayed content */}
        <h1 className='text-white z-10'>Welcome Warrior</h1>
        <div className='h-32 w-80 rounded-2xl bg-[rgba(0,0,0,0.4)] z-10 flex flex-col p-2 items-center gap-2'>
          <input onKeyDown={handleKeyDown} onChange={handlePasswordChange} value={password} type="text" placeholder='Enter you password' className='h-12 w-full p-2 border-2 rounded-2xl outline-none text-2xl'/>
          <button onClick={handleOnLogin} className='h-12 w-full p-2 bg-blue-600 text-white font-bold text-3xl rounded-2xl flex justify-center items-center cursor-pointer hover:bg-blue-700'>Login</button>
        </div>

        {/* //Logo */}
        <div className='absolute top-0 left-0 h-auto w-auto flex justify-center items-center z-10 p-5 text-3xl'>
          LifeOs
        </div>
    </div>
  )
}
