import React , {useState, useEffect} from 'react'
import LoaderAnimation from '../../assets/Loader3.mp4';

export default function Loader() {
    const [isMonochrome, setIsMonochrome] = useState(true);

  return (
    <div className='absolute bg-[#111111] top-0 left-0 z-12 h-screen w-screen flex justify-center items-center overflow-hidden'>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute h-screen w-screen z-22 min-h-[100vw] min-w-[100vh] object-contain `}
        >
          <source src={LoaderAnimation} type="video/mp4" />
        </video>
    </div>
  )
}
