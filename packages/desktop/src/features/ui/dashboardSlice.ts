import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DashboardWidgetType = 
    | 'ai-insights'
    | 'agents-shortcut'
    | 'automations-shortcut'
    | 'gantts-shortcut'
    | 'recent-notes';

export interface DashboardWidget {
    id: string; // Unique instance ID
    type: DashboardWidgetType;
}

interface DashboardState {
    activeWidgets: DashboardWidget[];
    isWidgetSelectorOpen: boolean;
}

const initialState: DashboardState = {
    // Default widgets for empty state
    activeWidgets: [
        { id: 'default-insights', type: 'ai-insights' },
        { id: 'default-agents', type: 'agents-shortcut' },
    ],
    isWidgetSelectorOpen: false,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        addWidget: (state, action: PayloadAction<DashboardWidgetType>) => {
            state.activeWidgets.push({
                id: `${action.payload}-${Date.now()}`,
                type: action.payload,
            });
        },
        removeWidget: (state, action: PayloadAction<string>) => {
            state.activeWidgets = state.activeWidgets.filter(w => w.id !== action.payload);
        },
        reorderWidgets: (state, action: PayloadAction<DashboardWidget[]>) => {
            state.activeWidgets = action.payload;
        },
        toggleWidgetSelector: (state) => {
            state.isWidgetSelectorOpen = !state.isWidgetSelectorOpen;
        },
        setWidgetSelectorOpen: (state, action: PayloadAction<boolean>) => {
            state.isWidgetSelectorOpen = action.payload;
        }
    },
});

export const { 
    addWidget, 
    removeWidget, 
    reorderWidgets, 
    toggleWidgetSelector, 
    setWidgetSelectorOpen 
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
