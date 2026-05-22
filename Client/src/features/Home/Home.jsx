import React from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'

export default function Home() {
  return (
    <div className='h-screen w-screen flex flex-row items-center'>
        <Sidebar/>
        <div className='h-full w-auto flex justify-center items-center'>

        </div>
    </div>
  )
}
