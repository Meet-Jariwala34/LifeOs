import React, { useEffect, useState } from 'react'
import { 
  HomeRegular, 
  CodeRegular, 
  BriefcaseRegular, // Commonly used for "Project"
  ListRegular, 
  SettingsRegular 
} from '@fluentui/react-icons';
import { useNavigation } from '../../contexts/NavigationContext';

export default function Sidebar({currentTab}) {

  const { activeTab, setActiveTab } = useNavigation();

  return (
    <div className='h-screen w-22/100 bg-[#131313] flex flex-col items-center gap-8 border-r border-r-gray-500 shadow-amber-50'>
      {/* LOGO */}
      <div className='h-auto w-full p-5 pl-10 text-4xl font-bold text-white'>
        <h1>LifeOs</h1>
        <p className='text-sm text-gray-400 font-medium'>Commond Center</p>
      </div>

      {/* Menu */}
      <div className='h-auto w-full flex flex-col gap-3 items-center text-2xl font-medium'>
        <div onClick={()=> setActiveTab("dashboard")} className={`h-auto w-full p-3 pl-10 text-white cursor-pointer ${currentTab == "dashboard" ? "bg-[#2a2c2c] border-r-2 border-r-white" : ""}`}><HomeRegular/> &nbsp;Home</div>
        <div onClick={()=> setActiveTab("dsa")} className={`h-auto w-full p-3 pl-10 text-white cursor-pointer ${currentTab == "dsa" ? "bg-[#2a2c2c] border-r-2 border-r-white" : ""}`}><CodeRegular/>&nbsp;DSA</div>
        <div onClick={()=> setActiveTab("project")} className={`h-auto w-full p-3 pl-10 text-white cursor-pointer ${currentTab == "project" ? "bg-[#2a2c2c] border-r-2 border-r-white" : ""}`}><BriefcaseRegular/>&nbsp;Project</div>
        <div onClick={()=> setActiveTab("content")} className={`h-auto w-full p-3 pl-10 text-white cursor-pointer ${currentTab == "content" ? "bg-[#2a2c2c] border-r-2 border-r-white" : ""}`}><ListRegular/>&nbsp;Content</div>
        <div onClick={()=> setActiveTab("setting")} className={`h-auto w-full p-3 pl-10 text-white cursor-pointer ${currentTab == "setting" ? "bg-[#2a2c2c] border-r-2 border-r-white" : ""}`}><SettingsRegular/>&nbsp;Setting</div>
      </div>
    </div>
  )
}
