/* eslint-disable */
import { useState, forwardRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// State 
import { 
    setListQueue, 
    setLetterQueue 
} from './../../store/queueSlice'

//? Componenets
import { Tooltip, InputNumber } from 'antd'
// React icon
import { BsSave } from 'react-icons/bs'
import { toast } from 'react-toastify'
// MUI
import Dialog from '@mui/material/Dialog'
import ListItem from '@mui/material/ListItem'
import List from '@mui/material/List'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Slide from '@mui/material/Slide'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup';


const clientWidth = window.screen.width;


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

const callToast = (type = 'error', msg = 'เกิดข้อผิดพลาด', position= 'top-right', autoClose = 4000) => {
    toast.dismiss()
    if (type === 'error') {
        toast.error(msg, {
            position: position,
            autoClose: autoClose,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        })
    } else {
        toast.warn(msg, {
            position: position,
            autoClose: autoClose,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        })
    }
}




function SectionManageQueue({ SocketIo, playSound }) {

    const listQueue = useSelector(state => state.queue.listQueue)
    const letterQueue = useSelector(state => state.queue.letterQueue)
    const dispatch = useDispatch()
    
    const [rangeQueue, setRangeQueue] = useState({
        min: 0, max: 100
    })
    
    const [openDialogJumpQueue, setStatusDialogJumpQueue] = useState(false)
    const [statusValidateQueueRange, setStatusValidateQueueRange] = useState(true)
   

    useEffect(() => {
        // watchChangeRangeQueue()
        getRangeQueue()
    }, [])


    SocketIo.on('queue:setRangeQueue:watch', (payload) => {
        console.log('queue:setRangeQueue:watch -> payload', payload)
        setRangeQueue(payload.rangeQueue)
        setListQueue(payload.listQueue)
        console.log('listQueue after set on watch ->', listQueue)
    })

    
    const getRangeQueue = () => {
        SocketIo.emit('queue:getRangeQueue')
        SocketIo.on('queue:getRangeQueue', (payload) => {
            setRangeQueue(payload.rangeQueue)
        })
    }

    const getListQueue = () => {
        SocketIo.emit('queue:getListQueue')
        SocketIo.on('queue:getListQueue', (payload) => {
            dispatch(setListQueue(payload.listQueue))
        })
    }
    
    const handleSetLetterQueue = (letter) => {
        dispatch(setLetterQueue(letter || ''))
    }

    const handleClickOpenDialog = () => {
        getRangeQueue()
        setStatusDialogJumpQueue(true)
    }

    const relaodRequestIo = async () => {
        SocketIo.emit('requestReload')
    }

    const updateLetterQueue = async (letter) => {
        SocketIo.emit('queue:updateLetterQueue', { letter: letter || '' })
    }


    const handleCloseDialog = async () => {
        statusValidateQueueRange && setStatusDialogJumpQueue(false)
        statusValidateQueueRange && getListQueue()
        
        await updateLetterQueue(letterQueue)
        await relaodRequestIo()
        window.location.reload();
    }

    const onChangeRangeQueue = (type, value) => {
        
        if (!value) value = (type === 'min' ? 1 : 100)

        value = parseInt(value)

        if (type === 'min' && rangeQueue.max < value) {
            callToast('warn', 'ค่าเริ่มต้องไม่น้อยกว่าค่าเริ่มต้น')
            return
        }
        if (type === 'max' && rangeQueue.min > value) {
            callToast('warn', 'ค่าสิ้นสุดต้องไม่น้อยกว่าค่าเริ่มต้น')
            return
        }

        setStatusValidateQueueRange(true)

        setRangeQueue(prevState => ({
            min: type === 'min' ? value : prevState.min,
            max: type === 'max' ? value : prevState.max,
        }))
        SocketIo.emit('queue:setRangeQueue', {
            type: type, value: value
        })
    }

    

    return (
        <>

            <div className={`flex flex-col gap-y-10 pb-20 select-none ${clientWidth < 400 && 'mt-5'}`}>
                <Tooltip 
                    zIndex={1}
                    open={true}
                    color={'#737373'}
                    placement={`${clientWidth < 400 ? 'top' : 'bottom'}`} 
                    title={`
                     ลำดับคิว ${listQueue[0]} ถึง ${listQueue[listQueue.length - 1]}
                    `}
                >
                    <Button
                        onClick={handleClickOpenDialog}
                        variant="contained"
                        color="primary" 
                        className='w-full -mt-12 md:mt-0 h-[48px] text-lg font-light tracking-wide font-prompt'
                    >
                        จัดการลำดับคิว
                    </Button>
                </Tooltip>

            </div>
            


            <Dialog
                className='w-full rounded-xl'
                open={openDialogJumpQueue}
                // onClose={handleCloseDialog}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative' }} color='transparent' className=' bg-gray-700 text-white'>
                    <Toolbar>
                        <Typography variant="h6" component="div" className='w-full font-prompt font-light text-center'>
                            จัดการลำดับคิว
                        </Typography>
                    </Toolbar>
                </AppBar>
                <List
                    className='w-full py-10'
                >
                    <ListItem
                        className='w-full relative'
                    >
                        <div className='w-full flex flex-col gap-y-10 py-4 md:px-10'>
                        <div className='flex-center gap-x-6'>
                                <div className='flex-col flex-center gap-y-2'>
                                    {
                                        letterQueue &&
                                        <p className='mb-4 text-xl text-center'>ตัวอย่าง : &nbsp;
                                            {
                                                (letterQueue || '') + '002'
                                            }
                                        </p>
                                    }
                                    <p className='text-blue-800'>ตัวอักษรหน้าคิว (ถ้าต้องการ)</p>
                                    <ButtonGroup variant="outlined" aria-label="outlined primary button group">
                                        <Button onClick={() => handleSetLetterQueue(null)} variant={`${letterQueue === '' ? 'contained' : 'outlined'}`}>-</Button>
                                        <Button onClick={() => handleSetLetterQueue('A')} variant={`${letterQueue === 'A' ? 'contained' : 'outlined'}`}>A</Button>
                                        <Button onClick={() => handleSetLetterQueue('B')} variant={`${letterQueue === 'B' ? 'contained' : 'outlined'}`}>B</Button>
                                        <Button onClick={() => handleSetLetterQueue('C')} variant={`${letterQueue === 'C' ? 'contained' : 'outlined'}`}>C</Button>
                                        <Button onClick={() => handleSetLetterQueue('D')} variant={`${letterQueue === 'D' ? 'contained' : 'outlined'}`}>D</Button>
                                    </ButtonGroup>
                                </div>
                            </div>
                            <div className='flex-center gap-x-6'>
                                <div className='flex-col flex-center gap-y-2'>
                                    <p className='text-blue-800'>เริ่ม</p>
                                    <InputNumber 
                                        type='tel'
                                        size="large" 
                                        min={1} 
                                        max={999} 
                                        defaultValue={1} 
                                        value={rangeQueue.min}
                                        onClick={(e) => e.target.select()}
                                        onKeyDown={(e) => onChangeRangeQueue('min', e.target.value)}
                                        onChange={(value) => onChangeRangeQueue('min', value)} 
                                    />
                                </div>
                                <div className='text-2xl text-black mt-6'>
                                    -
                                </div>
                                <div className='flex-col flex-center gap-y-2'>
                                    <p className='text-blue-800'>สิ้นสุด</p>
                                    <InputNumber 
                                        type='tel'
                                        size="large" 
                                        min={1} 
                                        max={999} 
                                        value={rangeQueue.max}
                                        defaultValue={rangeQueue.max} 
                                        onClick={(e) => e.target.select()}
                                        onKeyDown={(e) => onChangeRangeQueue('max', e.target.value)}
                                        onChange={(value) => onChangeRangeQueue('max',value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </ListItem>
                    {/* <Divider className='bg-blackk' /> */}
                </List>
                <Button 
                    color="info" 
                    variant="contained"
                    onClick={() => setTimeout(() => {
                        handleCloseDialog()
                    }, 200)}
                    className='w-full flex-center gap-x-2 bg-teal-700 hover:bg-teal-800 text-white'
                >
                    <BsSave className='text-xl' />
                    <p className='text-lg font-prompt  font-light'>
                        บันทึก
                    </p>
                </Button>
            </Dialog>

        </>
    )
}

export default SectionManageQueue









