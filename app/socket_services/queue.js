const fs = require('fs')
const pathFileQueueJSON = './data/queue.json'
var datenow = new Date()
var listQueue = []
var letterQueue = ''
var whereService = []
var currentIndexQueueNow = 0
var rangeQueue = {
  min: 1,
  max: 100
}


const getDataQueueToJSON = async () => {
  return {
    listQueue: await generateQueue(),
    letterQueue: letterQueue,
    whereService: whereService,
    currentIndexQueueNow: currentIndexQueueNow,
    rangeQueue: rangeQueue
  }
}


const generateQueue = async () => {
  listQueue = []
  for (let n = rangeQueue.min; n <= rangeQueue.max; n++) {
    listQueue.push(letterQueue + n.toString())
  }
  return listQueue
};


const writeJSON_toFile = async (pathFile, dataJSON, checkIfDataAlready = false ) => {

  const process = async () => {
    fs.writeFileSync(pathFile, JSON.stringify(dataJSON), (err) => {
      if (err) throw err
    })
  }

  if (!checkIfDataAlready) {
    await process()
  }

  console.log(`--------------------------- Event time : ${datenow.getHours().toString().length < 2 ? '0' + datenow.getHours() : datenow.getHours()}:${datenow.getMinutes()}`)

}


const readFile_toJSON = async (pathFile) => {

  if (!fs.existsSync(pathFileQueueJSON)) {
    await writeJSON_toFile(pathFileQueueJSON, await getDataQueueToJSON())
  }

  let dataQueue = JSON.parse(
    fs.readFileSync(pathFile, async (err) => {
      if (err) throw err
    })
  )
  
  return dataQueue

}


const getLocalDataToVariable = async () => {
  
  let dataQueueFromFile = await readFile_toJSON(pathFileQueueJSON)
  console.log(dataQueueFromFile)

  listQueue = dataQueueFromFile.listQueue
  letterQueue = dataQueueFromFile.letterQueue
  whereService = dataQueueFromFile.whereService
  currentIndexQueueNow = dataQueueFromFile.currentIndexQueueNow
  rangeQueue = dataQueueFromFile.rangeQueue

}



//? Main
(async () => {
  await writeJSON_toFile(pathFileQueueJSON, await getDataQueueToJSON())
  await getLocalDataToVariable()
})()



module.exports = (io, socket) => {

    const broadcastRelaod = async () => {
      socket.broadcast.emit('requestReload')
    } 


    socket.on('queue:getListQueue', async () => {
      console.log('- getListQueue')
      socket.emit('queue:getListQueue', { listQueue: await generateQueue() })
    })


    socket.on('queue:getRangeQueue', () => {
      console.log('- getRangeQueue')
      socket.emit('queue:getRangeQueue', { rangeQueue: rangeQueue })
    })


    socket.on('queue:getLetterQueue', () => {
      console.log('- getLetterQueue')
      socket.emit('queue:getLetterQueue', { letterQueue: letterQueue })
    })


    socket.on('queue:setLetterQueue', async ({ letter = '' }) => {
      console.log('- setLetterQueue')
      letterQueue = letter
      socket.emit('queue:setLetterQueue:watch', { letterQueue: letterQueue })
      await writeJSON_toFile(pathFileQueueJSON, await getDataQueueToJSON())
    })


    socket.on('queue:setRangeQueue', async ({ type, value }) => {
      console.log('- setRangeQueue')
      if (type === 'min') { rangeQueue.min = value } 
      else if (type === 'max') { rangeQueue.max = value }
      console.log('queue:setRangeQueue:watch')
      socket.broadcast.emit('queue:setRangeQueue:watch', { 
        listQueue: await generateQueue(),
        rangeQueue: rangeQueue, 
      })
      await writeJSON_toFile(pathFileQueueJSON, await getDataQueueToJSON())
    })


    socket.on('queue:jumpQueue', async ({ value }) => {
      console.log('- jumpQueue -----------', value)
      let tmpListQueue = await generateQueue();
      currentIndexQueueNow = tmpListQueue.indexOf(value.toString()) === -1 ? 0 : tmpListQueue.indexOf(value.toString())
      console.log('currentIndexQueueNow jump -> ', currentIndexQueueNow)
      socket.broadcast.emit('queue:jumpQueue:watch', { index: currentIndexQueueNow })
      await broadcastRelaod()
      socket.emit('queue:jumpQueue', { currentIndexQueueNow: currentIndexQueueNow })
    })


    socket.on('queue:getCurrentIndex', () => {
      console.log('- getCurrentIndex')
      socket.emit('queue:getCurrentIndex', { index: currentIndexQueueNow})
    })


    socket.on('queue:setCurrentIndex', ({ index }) => {
      currentIndexQueueNow = index
      socket.broadcast.emit('queue:currentIndex::watch', { index: currentIndexQueueNow })
      console.log('- setCurrentIndex', currentIndexQueueNow)
    })


    socket.on('queue:updateLetterQueue', async ({ letter }) => {
      console.log('- updateLetterQueue')
      letterQueue = letter || ''
      await writeJSON_toFile(pathFileQueueJSON, await getDataQueueToJSON())
    })


    socket.on('queue:onRunQueue', async ({ indexQueue, indexWhereService, statusCallServiceWhere }) => {
      currentIndexQueueNow = indexQueue
      console.log('- onRunQueue -> ', indexQueue, statusCallServiceWhere)
      
      socket.broadcast.emit('queue:getListQueue', { listQueue: await generateQueue() })
      socket.broadcast.emit('queue:getCurrentIndex', { index: currentIndexQueueNow})
      socket.broadcast.emit('queue:getLetterQueue', { letterQueue: letterQueue })
      socket.broadcast.emit('queue:getRangeQueue', { rangeQueue: rangeQueue })
      
      // socket.emit('queue:onRunQueue', { indexQueue: indexQueue })
      // socket.broadcast.emit('requestReload')
      
      let tmpListQueue = await generateQueue()
      socket.broadcast.emit('queue:displayShow', {
        queueNow: tmpListQueue[currentIndexQueueNow],
        currentIndexQueueNow: currentIndexQueueNow,
        letterQueue: letterQueue,
        whereService: whereService[indexWhereService] || '',
        statusCallServiceWhere: statusCallServiceWhere
      })

    })


    socket.on('queue:callQueueAgain', async ({ indexWhereService }) => {
      let tmpListQueue = await generateQueue()
      socket.broadcast.emit('queue:displayShow', {
        queueNow: tmpListQueue[currentIndexQueueNow],
        currentIndexQueueNow: currentIndexQueueNow,
        letterQueue: letterQueue,
        whereService: whereService[indexWhereService] || ''
      })
      console.log('indexWhereService', indexWhereService) 
      console.log('whereService[indexWhereService]', whereService[indexWhereService]) 
      console.log('whereService[indexWhereService]', whereService[indexWhereService]) 
    })


    socket.on('queue:getWhereService', async () => {
      console.log('- getWhereService')
      socket.emit('queue:getWhereService', { whereService: whereService })
    })


    socket.on('queue:addWhereService', async ({ value }) => {
      console.log('- addWhereService', value)
      whereService.push(value)
      await writeJSON_toFile(pathFileQueueJSON, await getDataQueueToJSON())
      await broadcastRelaod()
    })


    socket.on('queue:editWhereService', async ({ index, value }) => {
      whereService[index] = value
      await writeJSON_toFile(pathFileQueueJSON, await getDataQueueToJSON())
      await broadcastRelaod()
    })


    socket.on('queue:removeWhereService', async ({ index }) => {
      whereService.splice(index, 1)
      await writeJSON_toFile(pathFileQueueJSON, await getDataQueueToJSON())
      await broadcastRelaod()
    })
    
}