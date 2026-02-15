import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TimerState {
    isActive: boolean;
    isPaused: boolean;
    timeLeft: number;
    plannedMinutes: number;
    mode: 'pomodoro' | 'deepwork' | 'custom';
    currentSessionId: string | null;
    showPostSession: boolean;
    lastTick: number;
    isStopwatch: boolean;
}

const initialState: TimerState = {
    isActive: false,
    isPaused: false,
    timeLeft: 25 * 60,
    plannedMinutes: 25,
    mode: 'pomodoro',
    currentSessionId: null,
    showPostSession: false,
    lastTick: Date.now(),
    isStopwatch: false,
};

export const timerSlice = createSlice({
    name: 'timer',
    initialState,
    reducers: {
        startTimer: (state, action: PayloadAction<{ id: string, minutes: number, mode: 'pomodoro' | 'deepwork' | 'custom' }>) => {
            state.isActive = true;
            state.isPaused = false;
            state.currentSessionId = action.payload.id;
            state.plannedMinutes = action.payload.minutes;
            state.timeLeft = action.payload.minutes * 60;
            state.isStopwatch = action.payload.minutes === 0;
            state.mode = action.payload.mode;
            state.lastTick = Date.now();
        },
        resumeTimer: (state) => {
            state.isPaused = false;
            state.lastTick = Date.now();
        },
        pauseTimer: (state) => {
            state.isPaused = true;
        },
        stopTimer: (state) => {
            state.isActive = false;
            state.isPaused = false;
            state.currentSessionId = null;
        },
        completeTimer: (state) => {
            state.isActive = false;
            state.isPaused = false;
            state.showPostSession = true;
        },
        tick: (state) => {
            if (state.isActive && !state.isPaused) {
                const now = Date.now();
                const delta = Math.floor((now - state.lastTick) / 1000);
                if (delta >= 1) {
                    if (state.isStopwatch) {
                        state.timeLeft += delta;
                    } else {
                        state.timeLeft = Math.max(0, state.timeLeft - delta);
                        if (state.timeLeft === 0) {
                            state.isActive = false;
                            state.showPostSession = true;
                        }
                    }
                    state.lastTick = now;
                }
            }
        },
        setShowPostSession: (state, action: PayloadAction<boolean>) => {
            state.showPostSession = action.payload;
        },
        setTimerConfig: (state, action: PayloadAction<{ minutes: number, mode: 'pomodoro' | 'deepwork' | 'custom' }>) => {
            if (!state.isActive) {
                state.mode = action.payload.mode;
                state.plannedMinutes = action.payload.minutes;
                state.timeLeft = action.payload.minutes * 60;
            }
        }
    },
});

export const {
    startTimer, resumeTimer, pauseTimer, stopTimer, tick,
    setShowPostSession, setTimerConfig, completeTimer
} = timerSlice.actions;

export default timerSlice.reducer;
