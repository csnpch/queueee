import { createSlice } from '@reduxjs/toolkit';
import io from 'socket.io-client';

const initialState = {
  socket: io('http://192.168.1.10:5555')
}

const scoketSlice = createSlice({
  name: 'socketIo',
  initialState,
  reducers: {
    setNew: (state, { payload }) => {
      state.socketIo = payload
    }
  }

});

export const {
} = scoketSlice.actions;

export default scoketSlice.reducer;
