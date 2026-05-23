import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Home/Home'
import Sidebar from '../components/Sidebar/Sidebar'
import DSA from './DSA/DSA';
import Project from './Project/Project';
import Content from './Content/Content';
import Setting from './Setting/Setting';
import { NavigationProvider, useNavigation } from '../contexts/NavigationContext'

export default function Index() {

    const { activeTab } = useNavigation();
    

  return (
    <div className='h-screen w-screen flex flex-row items-center justify-start'>
        <Sidebar currentTab={activeTab}/>

        { activeTab == "dashboard" ? <Home/> : <></> }
        { activeTab == "dsa" ? <DSA/> : <></> }
        { activeTab == "project" ? <Project/> : <></> }
        { activeTab == "content" ? <Content/> : <></> }
        { activeTab == "setting" ? <Setting/> : <></> }
        
    </div>
  )
}
