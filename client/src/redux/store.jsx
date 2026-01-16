import { configureStore } from "@reduxjs/toolkit";
import userReducer from './userSlice.jsx'; 

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore socket connection in serializable check
        ignoredActions: ['user/setSocketConnection'],
        ignoredPaths: ['user.socketConnection'],
      },
    }),
});