import { useState } from 'react'
import { useSelector } from 'react-redux'
import { MdOutlineZoomOutMap } from 'react-icons/md'


function DisplayQueue({ SocketIo }) {

  const currentIndexQueue = useSelector((state) => state.queue.currentIndexQueue)
  const listQueue = useSelector((state) => state.queue.listQueue)
  const [queueNow, setQueueNow] = useState(listQueue[currentIndexQueue] || '000')
  const [statusFullScreen, setStatusFullScreen] = useState(false)

  const listPlaySound = []
  const playSound = async (messageSpeech, eventEndCancel = false) => {
    let objectVoice = window.speechSynthesis.getVoices()
    objectVoice = objectVoice.filter(item => item.voiceURI === "Microsoft Premwadee Online (Natural) - Thai (Thailand)")[0]

    listPlaySound.push(new SpeechSynthesisUtterance());
    listPlaySound[0].voice = objectVoice.lang === 'th-TH' ? objectVoice : null
    listPlaySound[0].lang = 'th-TH';
    listPlaySound[0].text = messageSpeech;
    window.screen.width > 800 && window.speechSynthesis.speak(listPlaySound[0]);
    listPlaySound[0].addEventListener('end', () => {
      eventEndCancel && window.speechSynthesis.cancel()
    })
  }

  const getQueueToVoiceThai = async (queue) => {
    console.log('firstLetter', queue[0])
    switch (queue[0]) {
        case 'A':
            return 'เอ' + queue.substring(1);
        case 'B':
            return 'บี' + queue.substring(1);
        case 'C':
            return 'ซี' + queue.substring(1);
        case 'D':
            return 'ดี' + queue.substring(1);
        default:
            return queue;
    }
  }

  const playSoundRunQueue = async (queue, whereService, statusCallServiceWhere) => {

    whereService = whereService.replaceAll(' ', '')
    whereService = whereService.replaceAll('_', ' ')
    console.log('where service ----------- > ', whereService)
    console.log('status in playsound run queue', statusCallServiceWhere)

    let msg = `ขอเชิญหมายเลข  ${await getQueueToVoiceThai(queue)}` + (statusCallServiceWhere && whereService ? `,ที่${whereService}ค่ะ` : 'ค่ะ')
    console.log(msg)
    let msgSplit = msg.split(',')
    for (let i = 0; i < msgSplit.length; i++) {
      playSound(msgSplit, (i === msgSplit.length - 1))
    }
  }

  SocketIo.on('queue:displayShow', async ({ queueNow, whereService, statusCallServiceWhere }) => {
    console.log('statusCallServiceWhere', statusCallServiceWhere)
    setQueueNow(queueNow)
    document.querySelector('.whereService').innerHTML = statusCallServiceWhere && whereService ? `" เชิญที่${whereService} "` : ''
    await playSoundRunQueue(queueNow, whereService, statusCallServiceWhere)
  })

  return (
    <>
      <div className='
          font-prompt relative w-full h-screen flex-center flex-col
          bg-black text-white gap-y-12 overflow-hidden select-none
        '
      >

        <p className='-mt-36 md:mt-0 text-[1.4rem] md:text-[4rem]'>หมายเลขคิวที่เรียก</p>

        <div className='cardNumberQueue py-6 md:py-16 break15_6:py-18 w-11/12 break15_6:w-8/12'>
          <p className='
            tracking-wider text-[8rem] md:text-[20rem] break15_6:text-[30rem] text-red-600
          '
          >
            {/* {queueNow} */}
            {
              (() => {
                let regNumber = /^\d+$/;
                let tmpItem = queueNow  //listQueue[currentIndexQueue]
                
                console.log(regNumber.test(tmpItem))
                if (regNumber.test(tmpItem)) {
                  return tmpItem.length === 2 ? '0' + tmpItem
                    : tmpItem.length === 1 ? '00' + tmpItem : tmpItem
                }
                return tmpItem
              })()
            }
          </p>
        </div>
          
        <p className='text-[1.4rem] md:text-[4rem]'><span className='whereService'></span></p>

        {
          !statusFullScreen && 
          <MdOutlineZoomOutMap className='btnActionScreenScale' 
              onClick={() => {
                setStatusFullScreen(true)
                setTimeout(() => { 
                  document.body.requestFullscreen()
                }, 300)
              }}
          />
        }

      </div>
    </>
  )
}

export default DisplayQueue