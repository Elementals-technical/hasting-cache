import { configureStore, createSlice } from '@reduxjs/toolkit';

const displayAttributesSlice = createSlice({
  name: 'displayAttributes',
  initialState: [],
  reducers: {
    setDisplayAttributes: (_state, action) => action.payload || [],
    clearDisplayAttributes: () => [],
  },
});

export const { setDisplayAttributes, clearDisplayAttributes } = displayAttributesSlice.actions;

export const store = configureStore({
  reducer: {
    displayAttributes: displayAttributesSlice.reducer,
  },
});
