import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  whereSerivce: [],
  currentIndexWhereService: 0,
  currentIndexQueue: 0,
  letterQueue: '',
  listQueue: [],
  rangeQueue: {
    min: 1,
    max: 100
  }
}

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {


    setCurrentIndexWhereService: (state, { payload }) => {
      state.currentIndexWhereService = payload || 0
      localStorage.setItem('currentIndexWhereService', JSON.stringify(payload))
      getCurrentIndexWhereService()
    },
    
    getCurrentIndexWhereService: (state) => {
      state.currentIndexWhereService = JSON.parse(localStorage.getItem('currentIndexWhereService'))
    },

    
    getWhereSerivce: (state) => state.whereSerivce,
    setWhereSerivce: (state, { payload = [] }) => {
      state.whereSerivce = payload
    },
    addWhereSerivce: (state, { payload = null }) => {
      payload && state.whereSerivce.push(payload)
    },
    editWhereService: (state, { payload }) => {
      state.whereSerivce[payload.index] = payload.value
    },
    removeWhereService: (state, { payload }) => {
      state.whereSerivce.splice(payload, 1)
    },

    setCurrentIndexQueue: (state, { payload }) => {
      state.currentIndexQueue = payload || 0
    },
    increment: (state) => { state.currentIndexQueue++ },
    decrement: (state) => { state.currentIndexQueue-- },
    jumpToQueue: (state, { index = null}) => {
      state.currentIndexQueue = (index === null ? state.currentIndexQueue : index)
    },
    jumpToQueueByValue: (state, {value = null}) => {
      if (!value) return;
      state.currentIndexQueue = state.listQueue.indexOf(value) === -1 ? 0 : state.listQueue.indexOf(value)
    },
    setCurrentIndex: (state, { payload }) => {
      state.currentIndexQueue = parseInt(payload || 0)
    },
    getListQueue: (state) => state.listQueue,
    setListQueue: (state, { payload }) => {
      // console.log('store.setListQueeu -> paylaod', payload)
      state.listQueue = payload || []
    },
    pushListQueue: (state, { payload }) => {
      state.listQueue.push(payload)
    },
    removeItemListQueue: (state, { payload }) => {
      state.listQueue = state.listQueue.filter(item => item !== payload)
    },


    setMinRangeQueue: (state, { payload }) => {
      state.rangeQueue.min = payload
    },
    setMaxRangeQueue: (state, { payload }) => {
      state.rangeQueue.max = payload
    },


    setLetterQueue: (state, { payload }) => {
      state.letterQueue = payload
    },
    
  }

});

export const {
  setCurrentIndexQueue,
  increment, 
  decrement,
  jumpToQueue,
  jumpToQueueByValue,
  setCurrentIndex,
  
  getListQueue,
  setListQueue,
  pushListQueue,
  removeItemListQueue,
  
  setMinRangeQueue,
  setMaxRangeQueue,

  setLetterQueue,

  setWhereSerivce,
  addWhereSerivce,
  editWhereService,
  removeWhereService,
  getWhereSerivce,
  setCurrentIndexWhereService,
  getCurrentIndexWhereService

} = queueSlice.actions;

export default queueSlice.reducer;
