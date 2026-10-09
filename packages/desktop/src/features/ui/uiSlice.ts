import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AgentData {
    id: string;
    name: string;
    icon: string;
    capabilities: string;
    systemPrompt: string;
    area: string;
    project: string;
    apps: string[];
    plugins: string[];
    skills: string[];
    workflows: string[];
}

interface UiState {
    activeTab: 'dashboard' | 'calendar' | 'tasks' | 'eisenhower' | 'deepwork' | 'health' | 'learning' | 'focus-ai' | 'systems' | 'reviews' | 'planning' | 'areas' | 'quests' | 'habits' | 'crm' | 'settings' | 'references' | 'ai-agents' | 'automations' | 'gantt-studio';
    pendingSessionConfig?: { type: string; duration: number; taskId?: string };
    staticBackground: boolean;
    agents: AgentData[];
}

const initialAgents: AgentData[] = [];

const initialState: UiState = {
    activeTab: 'dashboard',
    staticBackground: false,
    agents: initialAgents,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<UiState['activeTab']>) => {
            state.activeTab = action.payload
        },
        setPendingSessionConfig: (state, action: PayloadAction<UiState['pendingSessionConfig']>) => {
            state.pendingSessionConfig = action.payload;
        },
        clearPendingSessionConfig: (state) => {
            state.pendingSessionConfig = undefined;
        },
        setStaticBackground: (state, action: PayloadAction<boolean>) => {
            state.staticBackground = action.payload;
        },
        saveAgent: (state, action: PayloadAction<AgentData>) => {
            const index = state.agents.findIndex(a => a.id === action.payload.id);
            if (index !== -1) {
                state.agents[index] = action.payload;
            } else {
                state.agents.push(action.payload);
            }
        },
        deleteAgent: (state, action: PayloadAction<string>) => {
            state.agents = state.agents.filter(a => a.id !== action.payload);
        },
        duplicateAgent: (state, action: PayloadAction<string>) => {
            const agentToDuplicate = state.agents.find(a => a.id === action.payload);
            if (agentToDuplicate) {
                const newAgent = { ...agentToDuplicate, id: Date.now().toString(), name: `${agentToDuplicate.name} (Copy)` };
                state.agents.push(newAgent);
            }
        }
    },
});

export const { setActiveTab, setPendingSessionConfig, clearPendingSessionConfig, setStaticBackground, saveAgent, deleteAgent, duplicateAgent } = uiSlice.actions;
export default uiSlice.reducer;
