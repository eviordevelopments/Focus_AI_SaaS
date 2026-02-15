import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './features/api/apiSlice';
import authReducer from './features/auth/authSlice';
import uiReducer from './features/ui/uiSlice';
import themeReducer from './features/theme/themeSlice';
import timerReducer from './features/timer/timerSlice';

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        ui: uiReducer,
        theme: themeReducer,
        timer: timerReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
