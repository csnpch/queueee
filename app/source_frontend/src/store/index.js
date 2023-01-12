import { configureStore } from "@reduxjs/toolkit"
import queueSlice from './queueSlice'
// import socket_ioSlice from './socket_ioSlice'

export const store = configureStore({

  reducer: {
    queue: queueSlice,
    // socketIo: socket_ioSlice
  }

});
