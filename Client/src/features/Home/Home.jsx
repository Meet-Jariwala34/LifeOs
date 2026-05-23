import React from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Row1 from './Row1';
import Row2 from './Row2';
import Row3 from './Row3';

export default function Home() {
  return (
    <div className='h-screen w-78/100 flex flex-col items-center bg-[#131313] p-10'>
          <Row1/>
          <Row2/>
          <Row3/>
        
    </div>
  )
}
