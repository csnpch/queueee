require('dotenv').config()

const express = require('express');
const app = express();
const server = require("http").createServer(app);
const router = require('./routes')
const PORT = process.env.PORT;


const socketIoOption = { cors: { origin: '*' } }
const io = require("socket.io")(server, socketIoOption);
const socketService = (socket) => {
  
  console.log('a user connected');
  socket.on('message', (data) => console.log(data.msg) );
  
  require('./socket_services/queue')(io, socket);
  
  socket.on('requestReload', () => {
    socket.broadcast.emit('requestReload')
  })
  
}

io.on("connection", socketService);
app.use(express.static(__dirname + '/www'))


app.use(router)
router.get('/check', (req, res) => res.status(200).json({status: 'ok', msg: `Server runing on PORT ${PORT}`}) );


server.listen(PORT, () => {
  console.log('\n SERVER RUNING ON PORT : ' + PORT + '\n');
});
