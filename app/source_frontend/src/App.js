import config from './config'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

//? Store
import { useDispatch } from 'react-redux'
import { 
  setListQueue,
  setCurrentIndex,
  setLetterQueue
} from './store/queueSlice'

//? Components
import Queue from './Queue'
import DisplayQueue from './Queue/display'
import Process from './Queue/services'

//? Toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import io from 'socket.io-client';
const SocketIo = io(config.urlBackend)


const playSound = (messageSpeech) => {
  var speechSynthesis = new SpeechSynthesisUtterance();
  speechSynthesis.lang = 'th-TH';
  speechSynthesis.text = messageSpeech;
  window.screen.width > 1800 && window.speechSynthesis.speak(speechSynthesis);
}


function App() {

  const dispatch = useDispatch()
  
  SocketIo.emit('queue:getListQueue')
  SocketIo.on('queue:getListQueue', ({ listQueue }) => {
      dispatch(setListQueue(listQueue))
  })


  SocketIo.emit('queue:getCurrentIndex')
  SocketIo.on('queue:getCurrentIndex', ({ index }) => {
    dispatch(setCurrentIndex(index))
  })


  SocketIo.emit('queue:getLetterQueue')
  SocketIo.on('queue:getLetterQueue', ({ letterQueue }) => {
    dispatch(setLetterQueue(letterQueue))
  })


  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={
              <Queue 
                SocketIo={SocketIo} 
                playSound={playSound} 
              />
            } 
          />
          <Route path='/DisplayQueue' element={
              <DisplayQueue 
              SocketIo={SocketIo} 
              playSound={playSound} 
              />
            } 
          />
          <Route path='/processQueue' element={
              <Process 
                SocketIo={SocketIo} 
                playSound={playSound} 
              />
            } 
          />
          <Route path='/*' element={
              <p className='w-full h-screen flex-center text-4xl font-prompt'>
                404 PAGE NOT FOUND
              </p>
            } 
          />
        </Routes>
        {/* <p className='font-prompt text-center text-4xl text-red-600 mt-40 uppercase tracking-wide'>
          Please &nbsp; start &nbsp; server &nbsp; backend &nbsp; first
        </p> */}
      </BrowserRouter>
    </>
  )
}




export default App
