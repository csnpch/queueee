import SectionProcess from './sectionProcess';
import SectionManage from './sectionManage';


function Process({ SocketIo, playSound }) {


  SocketIo.on('requestReload', () => {
      window.location.reload()
  })


  return (
    <div className='pb-40 md:pb-0 -mt-10 md:mt-0 font-prompt relative flex-center w-full h-screen bg-stone-200 overflow-x-hidden'>
      <div className='w-[90%] h-5/6 grid md:grid-rows-[2fr_3fr] gap-4'>

        <SectionProcess SocketIo={SocketIo} playSound={playSound} />
        <SectionManage SocketIo={SocketIo} playSound={playSound} />

      </div>
    </div>
  )
}

export default Process