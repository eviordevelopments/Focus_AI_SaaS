import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    activeTab: 'dashboard' | 'calendar' | 'tasks' | 'deepwork' | 'health' | 'learning' | 'focus-ai' | 'eisenhower' | 'systems' | 'reviews' | 'planning' | 'areas' | 'quests' | 'habits';
    pendingSessionConfig?: { type: string; duration: number; taskId?: string };
}

const initialState: UiState = {
    activeTab: 'dashboard',
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<UiState['activeTab']>) => {
            state.activeTab = action.payload
        },
        setPendingSessionConfig: (state, action: PayloadAction<UiState['pendingSessionConfig']>) => {
            state.pendingSessionConfig = action.payload;
        }
    },
})

export const { setActiveTab, setPendingSessionConfig } = uiSlice.actions;
export default uiSlice.reducer;
