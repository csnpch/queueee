import { NavLink } from 'react-router-dom'

function Queue() {

  return (
    <div className='font-prompt w-full h-screen grid grid-rows-[60px_1fr]'>
      
      <div className='navbar'>
        ระบบคิว
      </div>

      <div className='grid max-xl:grid-rows-[5fr_1fr] xl:grid-cols-[2fr_5fr]'>
        <NavLink to='/processQueue' className='xl:order-1'>
          <div className='cardRole bg-purple-800 hover:bg-purple-900'>
            เจ้าหน้าที่ควบคุมคิว
          </div>
        </NavLink>
        <NavLink to='/displayQueue'>
          <div className='cardRole bg-indigo-700 hover:bg-indigo-800'>
            หน้าจอแสดงผลคิว
          </div>
        </NavLink>
      </div>

    </div>
  )
}

export default Queue