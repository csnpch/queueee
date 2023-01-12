/* eslint-disable */
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  increment as incrementQueue, 
  decrement as decrementQueue,
  setLetterQueue,
  setListQueue,
  setWhereSerivce,
  addWhereSerivce,
  editWhereService,
  removeWhereService,
  setCurrentIndexWhereService,
  getCurrentIndexWhereService,
  setCurrentIndexQueue
} from './../../store/queueSlice'

import { Modal, message, Switch, notification } from 'antd'
import { List, SwipeAction, PullToRefresh } from 'antd-mobile'
import { sleep } from 'antd-mobile/es/utils/sleep'

import { 
    Select, Button, MenuItem, 
    ToggleButtonGroup, 
    TextField
} from '@mui/material'

import withReactContent from 'sweetalert2-react-content'

import Swal from 'sweetalert2'
const swalAlert = withReactContent(Swal)

const synth = window.speechSynthesis;


function SectionProcess({ SocketIo, playSound }) {

    // AntD
    const [messageApi, contextHolder] = message.useMessage()
    const [api, contextHolderNoti] = notification.useNotification();
    
    const currentIndexQueue = useSelector(state => state.queue.currentIndexQueue)
    const listQueue = useSelector(state => state.queue.listQueue)
    const whereSerivce = useSelector(state => state.queue.whereSerivce)
    const currentIndexWhereService = useSelector(state => state.queue.currentIndexWhereService)
    const dispatch = useDispatch()


    const [valueJumpQueue, setValueJumpQueue] = useState(0)
    const [valueAddWhereService, setValueAddWhereService] = useState('')
    const [valueEditWhereService, setValueEditWhereService] = useState('')
    const [valueIndexEditWhere, setValueIndexEditWhere] = useState(0)
    const [statusAddWhere, setStatusAddWhere] = useState(false)
    const [statusEditWhereService, setStatusEditWhereService] = useState(false)
    const [statusCallWhereService, setStatusCallWhereService] = useState(true)
    const [statusPlaySound, setStatusPlaySound] = useState(false)
    const [dialogJumpQueue, setDialogJumpQueue] = useState(false)
    const [dialogWhereService, setDialogWhereService] = useState(false)


    SocketIo.on('queue:getListQueue', ({ listQueue }) => {
        dispatch(setListQueue(listQueue))
    })
    

    SocketIo.on('queue:getCurrentIndex', ({ index }) => {
        dispatch(setCurrentIndexQueue(index))
    })


    SocketIo.on('queue:getLetterQueue', ({ letterQueue }) => {
        dispatch(setLetterQueue(letterQueue))
    })


    SocketIo.on('queue:updateWhereService::watch', ({ item }) => {
        dispatch(addWhereSerivce(item))
    })


    SocketIo.on('queue:jumpQueue:watch', async () => {
        SocketIo.emit('requestReload')
    })


    SocketIo.on('queue:currentIndex::watch', ({ index }) => {
        dispatch(setCurrentIndexQueue(index))
    })


    useEffect(() => {
        if (!localStorage.getItem('statusCallToService')) {
            localStorage.setItem('statusCallToService', JSON.stringify(statusCallWhereService))
        } else {
            setStatusCallWhereService(JSON.parse(localStorage.getItem('statusCallToService')))
        }
    }, [])


    useEffect(() => {
        
        if (!localStorage.getItem('currentIndexWhereService')) {
            dispatch(setCurrentIndexWhereService(0))
        } else {
            dispatch(getCurrentIndexWhereService())
        }
        
        SocketIo.emit('queue:getWhereService')
        SocketIo.on('queue:getWhereService', (payload) => {
            dispatch(setWhereSerivce(payload.whereService))
            if ((JSON.parse(localStorage.getItem('currentIndexWhereService'))) > payload.whereService.length - 1) {
                dispatch(setCurrentIndexWhereService(0))
            }
            clearInterval(intervalCheckConnected)
        })
        
        let intervalCheckConnected = setInterval(() => {
            if (listQueue.length === 0) {
                api.error({
                    message: `แจ้งเตือน`,
                    description:
                        'ไม่สามารถเชื่อมต่อกับเครื่องหลักได้ในขณะนี้',
                    placement: 'top',
                })
            } else {
                clearInterval(intervalCheckConnected)
            }
        }, 5000)

    }, [])


    useEffect(() => {
        if (whereSerivce.length !== 0) {
            setDialogWhereService(true)
        }
    }, [whereSerivce])
    
    
    useEffect(() => {
        setValueJumpQueue(listQueue[currentIndexQueue])
    }, [listQueue])
    
    
    useEffect(() => {
        if ((!dialogJumpQueue || !statusAddWhere) || currentIndexWhereService !== -1) {
            window.scrollTo(0, 0)
        }
    }, [dialogJumpQueue, statusAddWhere, currentIndexWhereService])


    const handleSetCallWhereStatus = () => {
        setStatusCallWhereService(prevState => !prevState)
    }


    const handleOnEditWhere = () => {
        SocketIo.emit('queue:editWhereService', {
            index: valueIndexEditWhere, 
            value: valueEditWhereService
        })
        dispatch(editWhereService({
            index: valueIndexEditWhere, 
            value: valueEditWhereService
        }))
        setValueEditWhereService('')
        setStatusEditWhereService(false)
    }


    const handdleJumpQueue = () => {
        SocketIo.emit('queue:setCurrentIndex', { index : valueJumpQueue })
        console.log('handdleJumpQueue', valueJumpQueue)
        dispatch(setCurrentIndexQueue(valueJumpQueue))
        setDialogJumpQueue(false)
    }


    const handleOnAddWhere = () => {
        if (valueAddWhereService === '') { 
            messageApi.open({ type: 'error', content: 'ชื่อช่องบริการต้องไม่เป็นค่าว่าง' }); return
        }

        if (whereSerivce.filter(item => item === valueAddWhereService).length !== 0) {
            messageApi.open({ type: 'error', content: 'มีช่องบริการนี้อยู่ในระบบแล้ว' }); return
        }

        dispatch(addWhereSerivce(valueAddWhereService))
        dispatch(setCurrentIndexWhereService(whereSerivce.length))
        setStatusAddWhere(false)
        setValueAddWhereService('')
        SocketIo.emit('queue:addWhereService', { value: valueAddWhereService })
    }


    const handleSetValueServiceWhere = (index = 0) => {
        dispatch(setCurrentIndexWhereService(index))
        setTimeout(() => {
            setDialogWhereService(false)
        }, 300);
    } 


    const swipeActionServiceWhere = (type, index) => {
        if (type === 'edit') {
            swalAlert('edit')
            setStatusEditWhereService(true)
        } else if (type === 'del') {
            dispatch(removeWhereService(index))
            SocketIo.emit('queue:removeWhereService', { index: index })
            window.location.reload()
        }
        console.log('swipeActionServiceWhere', type, index)
    }


    const onClickButtonProcessQueue = () => {
        synth.cancel()
        setStatusPlaySound(true)
        messageApi.open({
            type: 'success',
            content: 'กำลังเรียกคิวด้วยเสียงสังเคราะห์',
        })
        setTimeout(() => {
            setStatusPlaySound(false)
        }, 800)
    }
    

    const handlePlaySound = async (queue) => {
        // let msg = `ขอเชิญหมายเลข  ${await getQueueToVoiceThai(queue)},ที่ช่องบริการ2ครับ`
        onClickButtonProcessQueue()
        // for (let item of msg.split(',')) {
        //     playSound(item)
        // }
    }


    const emitEventSocketOnRunQueue = (indexOnRun) => {
        SocketIo.emit('queue:onRunQueue', { indexQueue: indexOnRun, indexWhereService: currentIndexWhereService, statusCallServiceWhere: statusCallWhereService })
    }


    const onIncrementQueue = async () => {
        if (statusPlaySound) return 
        if (currentIndexQueue >= listQueue.length - 1) return

        dispatch(incrementQueue())
        await handlePlaySound(listQueue[currentIndexQueue + 1])
        emitEventSocketOnRunQueue(currentIndexQueue + 1)
    }


    const onDecrementQueue = async () => {
        if (statusPlaySound) return
        if (currentIndexQueue <= 0) return
        
        dispatch(decrementQueue())
        await handlePlaySound(listQueue[currentIndexQueue - 1])
        emitEventSocketOnRunQueue(currentIndexQueue - 1)
    }


    const onCallQueueAgain = async () => {
        if (statusPlaySound) return 
        
        await handlePlaySound(listQueue[currentIndexQueue])
        emitEventSocketOnRunQueue(currentIndexQueue)
    }


    return (
        <PullToRefresh
            onRefresh={async () => {
                await sleep(1000)
                window.location.reload()
            }}
            pullingText={'รีโหลดหน้า'}
            refreshingText={'รีโหลดหน้า'}
            canReleaseText={'รีโหลดหน้า'}
            completeText={'รีโหลดหน้า'}
        >
            <div className={`grid grid-rows-[1fr_1fr] h-[90vh] md:h-full md:grid-rows-1 md:grid-cols-[3fr_1fr] gap-4
                ${dialogJumpQueue && 'overflow-hidden'}
            `}>
            
                <div className='w-full h-[20rem] md:h-full rounded-2xl shadow-md text-center bg-white grid grid-rows-3 select-none'>
                    <div className='w-full flex-center text-2xl'>
                        หมายเลขคิวปัจจุบัน
                    </div>
                    <div className='flex-center flex-col duration-300'>
                        <p onClick={() => { setDialogWhereService(true) }} className={`
                                text-[6rem] md:text-[8rem] cursor-pointer
                                ${
                                    (currentIndexQueue >= listQueue.length - 1)
                                    ? 'text-red-600' : (currentIndexQueue >= listQueue.length - 2)
                                    ? 'text-orange-600' : 'text-blue-700'
                                } 
                            `}
                        >
                            {listQueue[currentIndexQueue] || '-'}
                        </p>
                        <div onClick={() => { setDialogWhereService(true) }} className='text-lg cursor-pointer text-center'>
                            <p className='flex-center gap-x-1.5'>
                                {whereSerivce.length !== 0 && <>เรียกมาที่</>}
                                { 
                                    whereSerivce[currentIndexWhereService] 
                                    ? (
                                        <span className='text-red-700 '>{`${whereSerivce[currentIndexWhereService]}`}</span>
                                    )
                                    : 'เพิ่มช่องบริการ'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex-center flex-col">
                        <p className='text-gray-400 py-4'>
                            ก่อนหน้า : &nbsp;{listQueue[currentIndexQueue-1] || '-'}
                            &nbsp;&nbsp; / &nbsp;
                            ถัดไป : &nbsp;{listQueue[currentIndexQueue+1] || '-'}
                        </p>
                    </div>
                </div>
                
                <div className='flex flex-col rounded-2xl gap-y-2 md:gap-y-1.5 shadow-none h-5/6 md:h-full'>
                    <Button 
                        onClick={onIncrementQueue}
                        variant="contained" 
                        // color="secondary"
                        className='font-light h-full bg-pink-700 hover:bg-pink-800 text-2xl tracking-wide font-prompt'
                    >
                        คิวถัดไป
                    </Button>
                    <Button
                        onClick={onCallQueueAgain}
                        variant="contained" 
                        color="success"
                        className='font-light h-full text-2xl tracking-wide font-prompt'
                    >
                        เรียกอีกครั้ง
                    </Button>
                    <Button
                        onClick={onDecrementQueue}
                        variant="contained"
                        // color="success"
                        className='font-light h-full bg-indigo-700 hover:bg-indigo-800 bg-grayy-600 hover:bg-grayy-700 text-2xl tracking-wide font-prompt'
                    >
                        คิวก่อนหน้า
                    </Button>
                    <Button
                        onClick={() => { 
                            document.body.style.overflow = 'hidden'
                            setDialogJumpQueue(true) 
                        }}
                        variant="contained"
                        // color="primary"
                        className='font-light h-full bg-gray-600 hover:bg-gray-700 text-2xl tracking-wide font-prompt'
                    >
                        ข้ามคิว
                    </Button>
                </div>


                <div className='' style={{'zIndex': '-moz-initial'}}>
                    <Modal
                        title="ข้ามคิว"
                        centered
                        open={dialogJumpQueue}
                        okText='ทำการข้ามคิว'
                        cancelText='ยกเลิก'
                        onOk={async () => { 
                            document.body.style.overflow = 'auto'
                            handdleJumpQueue();
                        }}
                        onCancel={() => {
                            document.body.style.overflow = 'auto'
                            setDialogJumpQueue(false)
                        }}
                        closeIcon={<>X</>}
                    >
                        <div className='w-full flex flex-col md:flex-row justify-center items-center py-6 gap-2 md:gap-4'>
                            <p className='mt-1 text-[1rem]'>เลือกคิวที่ต้องการจะข้ามไป</p>
                            
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                className='text-black w-[10rem] text-center'
                                defaultValue={currentIndexQueue || 0}
                                onChange={(e) => {
                                    setValueJumpQueue(parseInt(e.target.value || '0'))
                                }}
                            >
                                {
                                    listQueue.map((item, index) => {
                                        return <MenuItem className='tracking-widest' key={index} value={index}>{item}</MenuItem>
                                    })
                                }
                            </Select>

                        </div>
                    </Modal>
                </div>


                <div className='w-full' style={{'zIndex': '-moz-initial'}}>
                    <Modal
                        title={<>
                            {!statusEditWhereService ?
                                <>
                                    <p>เลือกช่องบริการ</p>
                                    {whereSerivce.length !== 0 &&
                                        <p className='font-light text-sm tracking-wider'>หากต้องการลบหรือแก้ไข <br className='block md:hidden' />ให้จิ้มค้างแล้วลากไปทางซ้ายหรือทางขวา</p>
                                    } 
                                </>
                                : <p>แก้ไขชื่อช่องบริการ</p>
                            }
                        </>}
                        centered
                        open={dialogWhereService}
                        onCancel={() => {
                            document.body.style.overflow = 'auto'
                            setDialogWhereService(false)
                        }}
                        footer={null}
                        // className='w-full md:w-[40rem]'
                    >
                        {
                            !statusEditWhereService &&
                            <div className='w-full flex flex-col justify-center items-center pt-2 pb-4 gap-2 md:gap-4'>
                                {
                                    whereSerivce.length === 0 && !statusAddWhere && 
                                    <div className='flex mt-4'>
                                        ไม่มีข้อมูลช่องบริการ&nbsp;
                                        <p onClick={() => setStatusAddWhere(true)} className='cursor-pointer underline text-blue-600 hover:text-blue-700'>
                                            เพิ่มข้อมูล
                                        </p>
                                    </div>
                                }


                                {
                                    whereSerivce.length !== 0 && !statusAddWhere && 
                                    <div className='flex-center gap-2 mt-2 mb-4 md:mt-2 md:mb-2 '>
                                        <p className='text-[1rem]'>การเรียกเข้าช่องบริการ</p>
                                        <Switch checked={statusCallWhereService} onChange={handleSetCallWhereStatus} />
                                    </div>
                                }
                                
                                {
                                    !statusAddWhere ?
                                    <ToggleButtonGroup
                                        color='error'
                                        orientation="vertical"
                                        value={currentIndexWhereService}
                                        exclusive
                                        onChange={handleSetValueServiceWhere}
                                        className="w-full"
                                    >
                                        <List>
                                        {
                                            whereSerivce.map((item, index) => {
                                                return(
                                                    <SwipeAction
                                                        key={index}
                                                        leftActions={[
                                                            {
                                                                key: 'pin',
                                                                text: 'แก้ไข',
                                                                color: 'warning',
                                                                onClick: () => {
                                                                    setValueIndexEditWhere(index)
                                                                    setValueEditWhereService(item)
                                                                    setStatusEditWhereService(true)
                                                                }
                                                            },
                                                        ]}
                                                        rightActions={[
                                                            {
                                                                key: 'pin',
                                                                text: 'ลบ',
                                                                color: 'danger',
                                                                onClick: () => 
                                                                    Swal.fire({
                                                                        title: `ลบ ${item} ใช่ไหม?`,
                                                                        // text: `คุณต้องการที่จะ`,
                                                                        icon: 'warning',
                                                                        showCancelButton: true,
                                                                        confirmButtonColor: '#3085d6',
                                                                        cancelButtonColor: '#d33',
                                                                        confirmButtonText: 'ยืนยัน',
                                                                        cancelButtonText: 'ยกเลิก'
                                                                    }).then((result) => {
                                                                        if (result.isConfirmed) {
                                                                            swipeActionServiceWhere('del', index)
                                                                        }
                                                                    })
                                                            },
                                                        ]}
                                                    >
                                                        <List.Item 
                                                            arrow={false}
                                                            onClick={() => handleSetValueServiceWhere(index)}
                                                            className={`
                                                                borderNone flex-center text-xl h-[4.4rem] mb-1.5 rounded-md shadow-sm duration-200 select-none 
                                                                active:bg-gray-200 text-center
                                                                ${currentIndexWhereService === index 
                                                                    ? 'bg-green-700 hover:bg-green-800 text-white' 
                                                                    : 'bg-gray-300 hover:bg-gray-400 hover:text-black'}
                                                            `}
                                                        >
                                                            {item}
                                                        </List.Item>
                                                    </SwipeAction>
                                                )
                                            })
                                        }
                                        </List> 
                                    </ToggleButtonGroup>
                                    :
                                    <div className='w-full flex-center flex-col'>
                                        <TextField 
                                            value={valueAddWhereService} onChange={(e) => setValueAddWhereService(e.target.value)} 
                                            label="ชื่อช่องบริการ (ภาษาไทย)" className='w-full' variant="outlined"
                                        />
                                        <div className='w-full flex-center mt-2 gap-2'>
                                            <Button variant="outlined" className='w-full' onClick={() => setStatusAddWhere(false)}>ยกเลิก</Button>
                                            <Button variant="contained" className='w-full' onClick={handleOnAddWhere}>บันทึก</Button>
                                        </div>
                                    </div>
                                }

                                {
                                    whereSerivce.length !== 0 && !statusAddWhere && <>
                                    
                                        <p onClick={() => setStatusAddWhere(true)} className='mt-4 text-[1rem] cursor-pointer underline text-blue-600 hover:text-blue-700'>
                                            เพิ่มช่องบริการ
                                        </p>
                                    
                                    </>
                                    
                                }
                            </div>
                        }

                        {
                            statusEditWhereService &&
                            <div className='w-full flex flex-col justify-center items-center pt-2 pb-4 gap-2 md:gap-4'>
                                <div className='w-full flex-center flex-col'>
                                    <TextField 
                                        value={valueEditWhereService} onChange={(e) => setValueEditWhereService(e.target.value)} 
                                        label="ชื่อช่องบริการ (ภาษาไทย)" className='w-full' variant="outlined"
                                    />
                                    <div className='w-full flex-center mt-2 gap-2'>
                                        <Button variant="outlined" className='w-full' onClick={() => setStatusEditWhereService(false)}>ยกเลิก</Button>
                                        <Button variant="contained" className='w-full' onClick={() => handleOnEditWhere() }>บันทึก</Button>
                                    </div>
                                </div>
                            </div>
                        }

                    </Modal>
                </div>

                {contextHolder}
                {contextHolderNoti}

            </div>
        </PullToRefresh>
    )
}

export default SectionProcess