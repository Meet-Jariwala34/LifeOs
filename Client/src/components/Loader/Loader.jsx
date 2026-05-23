import React , {useState, useEffect} from 'react'
import LoaderAnimation from '../../assets/Loader.mp4';

export default function Loader() {
    const [isMonochrome, setIsMonochrome] = useState(true);

    useEffect(() => {
    // Trigger the color transition after 1.5 seconds
    const timer = setTimeout(() => {
      setIsMonochrome(false);
    }, 1000);

    return () => clearTimeout(timer); // Clean up timer on unmount
  }, []);

  return (
    <div className='absolute top-0 left-0 z-20 h-screen w-screen flex justify-center items-center overflow-hidden'>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute fade-video ${isMonochrome ? 'grayscale' : 'color'} h-screen w-screen min-h-[100vw] min-w-[100vh] z-2 object-contain mix-blend-luminosity`}
        >
          <source src={LoaderAnimation} type="video/mp4" />
        </video>
    </div>
  )
}
