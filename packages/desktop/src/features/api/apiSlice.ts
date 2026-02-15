import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: number;
    area_id: string;
    due_date: string;
    created_at: string;
    // Enhanced Fields
    start_time?: string;
    end_time?: string;
    is_recurring?: boolean;
    recurring_days?: string; // JSON string
    location?: string;
    links?: string; // JSON string
    color?: string;
    session_config?: string; // JSON string
}

export interface Area {
    id: string;
    name: string;
    color_hex?: string;
    icon_key?: string;
    identity_statement?: string;
    importance_rating?: number;
    is_active?: boolean;
    // Computed stats
    completion_rate?: number;
    active_systems?: number;
    open_projects?: number;
}

export interface WorkflowStep {
    id: string;
    workflow_id: string;
    order: number;
    step_type: 'app' | 'agent' | 'function' | 'timer' | 'note';
    config: any;
}

export interface Workflow {
    id: string;
    user_id: string;
    life_area_id: string;
    system_id?: string;
    project_id?: string;
    name: string;
    emoji?: string;
    color?: string;
    description?: string;
    tags?: string[];
    type: 'manual' | 'block';
    status: 'active' | 'draft' | 'archived';
    steps: WorkflowStep[];
    created_at: string;
    updated_at: string;
    suggestionScore?: number;
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api',
    }),
    tagTypes: ['Task', 'Area', 'Session', 'Health', 'Learning', 'Log', 'System', 'Review', 'Identity', 'Streak', 'Achievement', 'Burnout', 'Habit', 'Eisenhower', 'Deck', 'Project', 'Resource', 'Reference', 'User', 'Workflow', 'WorkflowRun', 'Tree', 'Asset'],
    endpoints: (builder) => ({
        // ... (existing endpoints)
        // FOCUS AI - Systems
        getSystems: builder.query<any[], void>({
            query: () => '/focus/systems',
            providesTags: ['System']
        }),
        createSystem: builder.mutation<any, Partial<any>>({
            query: (body) => ({
                url: '/focus/systems',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['System'],
        }),
        updateSystem: builder.mutation<any, { id: string; updates: Partial<any> }>({
            query: ({ id, updates }) => ({
                url: `/focus/systems/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: ['System'],
        }),
        deleteSystem: builder.mutation<any, string>({
            query: (id) => ({
                url: `/focus/systems/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['System'],
        }),

        // Workflows
        getWorkflows: builder.query<Workflow[], void>({
            query: () => '/workflows',
            providesTags: ['Workflow']
        }),
        getSmartSuggestions: builder.query<Workflow[], void>({
            query: () => '/workflows/suggestions',
            providesTags: ['WorkflowRun', 'Workflow']
        }),
        createWorkflow: builder.mutation<Workflow, Partial<Workflow>>({
            query: (body) => ({
                url: '/workflows',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Workflow'],
        }),
        updateWorkflow: builder.mutation<Workflow, { id: string; updates: Partial<Workflow> }>({
            query: ({ id, updates }) => ({
                url: `/workflows/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['Workflow'],
        }),
        deleteWorkflow: builder.mutation<any, string>({
            query: (id) => ({
                url: `/workflows/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Workflow'],
        }),
        startWorkflowRun: builder.mutation<any, string>({
            query: (id) => ({
                url: `/workflows/${id}/run`,
                method: 'POST',
            }),
            invalidatesTags: ['WorkflowRun'],
        }),
        completeWorkflowRun: builder.mutation<any, { runId: string; completed_steps: string[]; xp_earned: number }>({
            query: ({ runId, ...body }) => ({
                url: `/workflows/runs/${runId}/complete`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['WorkflowRun', 'Identity', 'Log', 'Area'],
        }),

        // Rewards & Gamification
        getPlantedTrees: builder.query<any[], void>({
            query: () => '/rewards/trees',
            providesTags: ['Tree']
        }),
        plantTree: builder.mutation<any, { session_id: string; tree_type: string; x: number; y: number }>({
            query: (body) => ({
                url: '/rewards/plant',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Tree']
        }),

        // FOCUS AI - Daily Logs
        getLogs: builder.query<any[], { date?: string; system_id?: string }>({
            query: (params) => ({
                url: '/focus/logs',
                params
            }),
            providesTags: ['Log']
        }),
        createLog: builder.mutation<any, Partial<any>>({
            query: (body) => ({
                url: '/focus/logs',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Log', 'Burnout', 'Streak', 'Identity', 'Achievement', 'Habit', 'Area', 'Health'],
        }),
        createBatchLog: builder.mutation<any, any>({
            query: (body) => ({
                url: '/focus/logs/batch',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Log', 'Burnout', 'Streak', 'Identity', 'Achievement', 'Habit', 'Area', 'Health'],
        }),

        // FOCUS AI - Burnout
        getBurnoutStatus: builder.query<any, void>({
            query: () => '/focus/burnout/score',
            providesTags: ['Burnout']
        }),

        // FOCUS AI - Weekly Reviews
        getWeeklyReviews: builder.query<any[], void>({
            query: () => '/focus/reviews',
            providesTags: ['Log'] // Or specialized tag
        }),
        createWeeklyReview: builder.mutation<any, any>({
            query: (body) => ({
                url: '/focus/reviews',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Log']
        }),

        // FOCUS AI - Identity (Planning)
        getQuarterlyIdentities: builder.query<any[], void>({
            query: () => '/planning/identity-shifts',
            providesTags: ['Identity']
        }),
        createQuarterlyIdentity: builder.mutation<any, any>({
            query: (body) => ({
                url: '/planning/identity-shifts',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Identity']
        }),

        // Planning Outcomes
        createOutcome: builder.mutation<any, any>({
            query: (body) => ({
                url: '/planning/outcomes',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Identity']
        }),
        updateOutcome: builder.mutation<any, { id: string; updates: any }>({
            query: ({ id, updates }) => ({
                url: `/planning/outcomes/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: ['Identity']
        }),
        deleteOutcome: builder.mutation<any, string>({
            query: (id) => ({
                url: `/planning/outcomes/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Identity']
        }),

        // 10-Year Vision
        getFutureVision: builder.query<any, void>({
            query: () => '/planning/future-vision',
            providesTags: ['Identity']
        }),
        updateFutureVision: builder.mutation<any, any>({
            query: (body) => ({
                url: '/planning/future-vision',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Identity']
        }),

        getPlanningStats: builder.query<any[], void>({
            query: () => '/planning/stats',
            providesTags: ['Identity']
        }),

        // Eisenhower Matrix
        getEisenhowerSnapshot: builder.query<any, string | void>({
            query: (date) => date ? `/eisenhower?date=${date}` : '/eisenhower',
            providesTags: ['Eisenhower']
        }),
        upsertEisenhowerItem: builder.mutation<any, Partial<any>>({
            query: (body) => ({
                url: '/eisenhower/items',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Eisenhower', 'Task']
        }),
        updateEisenhowerItem: builder.mutation<any, { id: string; updates: any; date?: string }>({
            query: ({ id, updates }) => ({
                url: `/eisenhower/items/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: ['Eisenhower', 'Task']
        }),
        batchUpdateEisenhowerItems: builder.mutation<any, { items: any[]; date: string }>({
            query: ({ items }) => ({
                url: '/eisenhower/items/bulk?bulk=true',
                method: 'PUT',
                body: items
            }),
            invalidatesTags: ['Eisenhower', 'Task']
        }),
        deleteEisenhowerItem: builder.mutation<any, { id: string; date: string }>({
            query: ({ id }) => ({
                url: `/eisenhower/items/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Eisenhower', 'Task']
        }),
        getEisenhowerSummary: builder.query<any, string | void>({
            query: (date) => date ? `/eisenhower/summary?date=${date}` : '/eisenhower/summary',
            providesTags: ['Eisenhower']
        }),
        getTasks: builder.query<Task[], void>({
            query: () => '/tasks',
            providesTags: ['Task'],
        }),
        addTask: builder.mutation<Task, Partial<Task>>({
            query: (body) => ({
                url: '/tasks',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Task'],
        }),
        updateTask: builder.mutation<Task, { id: string; updates: Partial<Task> }>({
            query: ({ id, updates }) => ({
                url: `/tasks/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: ['Task'],
        }),
        deleteTask: builder.mutation<any, string>({
            query: (id) => ({
                url: `/tasks/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Task'],
        }),
        getAreas: builder.query<Area[], void>({
            query: () => '/areas',
            providesTags: ['Area']
        }),
        getAreaWorkspace: builder.query<any, string>({
            query: (id) => `/areas/${id}/workspace`,
            providesTags: ['Area', 'Project', 'Log', 'Identity', 'Habit', 'System']
        }),
        createArea: builder.mutation<Area, Partial<Area>>({
            query: (body) => ({
                url: '/areas',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Area'],
        }),
        updateArea: builder.mutation<Area, { id: string; updates: Partial<Area> }>({
            query: ({ id, updates }) => ({
                url: `/areas/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: ['Area'],
        }),
        deleteArea: builder.mutation<any, string>({
            query: (id) => ({
                url: `/areas/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Area'],
        }),
        getAreaStats: builder.query<Area[], void>({
            query: () => '/focus/stats/areas/overview',
            providesTags: ['Area']
        }),
        // Projects
        getProjects: builder.query<any[], { lifeAreaId?: string }>({
            query: (params) => ({
                url: '/projects',
                params
            }),
            providesTags: ['Project']
        }),
        createProject: builder.mutation<any, any>({
            query: (body) => ({
                url: '/projects',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Project', 'Area']
        }),
        updateProject: builder.mutation<any, { id: string; updates: any }>({
            query: ({ id, updates }) => ({
                url: `/projects/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: ['Project', 'Area']
        }),
        deleteProject: builder.mutation<any, string>({
            query: (id) => ({
                url: `/projects/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Project', 'Area']
        }),

        // Resources
        getResourcesByArea: builder.query<any[], string>({
            query: (areaId) => `/resources/area/${areaId}`,
            providesTags: ['Resource']
        }),
        createResource: builder.mutation<any, any>({
            query: (body) => ({
                url: '/resources',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Resource', 'Area']
        }),
        deleteResource: builder.mutation<any, string>({
            query: (id) => ({
                url: `/resources/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Resource', 'Area']
        }),

        // References
        getReferences: builder.query<any[], { lifeAreaId?: string; projectId?: string; type?: string }>({
            query: (params) => ({
                url: '/references',
                params
            }),
            providesTags: ['Reference']
        }),
        createReference: builder.mutation<any, any>({
            query: (body) => ({
                url: '/references',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Reference']
        }),
        updateReference: builder.mutation<any, { id: string; updates: any }>({
            query: ({ id, updates }) => ({
                url: `/references/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: ['Reference']
        }),
        deleteReference: builder.mutation<any, string>({
            query: (id) => ({
                url: `/references/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Reference']
        }),

        // User Profile
        getProfile: builder.query<any, void>({
            query: () => '/users/profile',
            providesTags: ['User']
        }),
        updateProfile: builder.mutation<any, any>({
            query: (body) => ({
                url: '/users/profile',
                method: 'PUT',
                body
            }),
            invalidatesTags: ['User']
        }),
        resetPassword: builder.mutation<any, any>({
            query: (body) => ({
                url: '/users/reset-password',
                method: 'POST',
                body
            })
        }),
        // Artifacts (Books, Notes, Reviews)
        getArtifacts: builder.query<any[], { type: string; lifeAreaId?: string }>({
            query: ({ type, ...params }) => ({
                url: `/focus/artifacts/${type}`,
                params
            }),
            providesTags: ['Log']
        }),
        createArtifact: builder.mutation<any, { type: string; body: any }>({
            query: ({ type, body }) => ({
                url: `/focus/artifacts/${type}`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['Log']
        }),
        // Sessions
        startSession: builder.mutation<any, { task_id?: string; type: string; planned_minutes: number }>({
            query: (body) => ({
                url: '/sessions/start',
                method: 'POST',
                body
            })
        }),
        finishSession: builder.mutation<any, { id: string; actual_minutes: number; focus_quality: number; distractions: number; notes: string }>({
            query: ({ id, ...body }) => ({
                url: `/sessions/${id}/finish`,
                method: 'POST',
                body
            })
        }),
        getRecentSessions: builder.query<any[], void>({
            query: () => '/sessions/recent'
        }),
        // Health
        logHealth: builder.mutation<any, any>({
            query: (body) => ({
                url: '/health',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Health', 'Area']
        }),
        getTodayHealth: builder.query<any, void>({
            query: () => '/health/today',
            providesTags: ['Health']
        }),
        getHealthHistory: builder.query<any[], void>({
            query: () => '/health/history',
            providesTags: ['Health']
        }),
        getHealthAnalytics: builder.query<any, { period?: string }>({
            query: (params) => ({
                url: '/health/analytics',
                params
            }),
            providesTags: ['Health']
        }),
        getVarianceAnalytics: builder.query<any, { areaId: string; period?: string; metric?: string }>({
            query: ({ areaId, ...params }) => ({
                url: `/analytics/variance/${areaId}`,
                params
            }),
            providesTags: ['Health']
        }),
        getBurnoutScore: builder.query<any, void>({
            query: () => '/health/burnout-score',
            providesTags: ['Health']
        }),
        // Learning
        getDecks: builder.query<any[], string | void>({
            query: (userId) => userId ? `/learning/decks?userId=${userId}` : '/learning/decks',
            providesTags: ['Deck']
        }),
        createDeck: builder.mutation<any, { title: string; description?: string; userId?: string }>({
            query: (body) => ({
                url: '/learning/decks',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Deck']
        }),
        createCard: builder.mutation<any, { deckId: string; front: string; back: string }>({
            query: ({ deckId, ...body }) => ({
                url: `/learning/decks/${deckId}/cards`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['Deck']
        }),
        getDueCards: builder.query<any[], string>({
            query: (deckId) => `/learning/decks/${deckId}/review`
        }),
        reviewCard: builder.mutation<any, { cardId: string; grade: number }>({
            query: ({ cardId, grade }) => ({
                url: `/learning/cards/${cardId}/review`,
                method: 'POST',
                body: { grade }
            })
        }),
        // AI Agent
        sendMessage: builder.mutation<{ reply: string }, { message: string }>({
            query: (body) => ({
                url: '/agent/chat',
                method: 'POST',
                body
            })
        }),
        // Auth
        login: builder.mutation<any, any>({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body
            })
        }),
        register: builder.mutation<any, any>({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                body
            })
        }),
        // GAMIFICATION
        getGamifiedIdentities: builder.query<any[], void>({
            query: () => '/gamification/identities',
            providesTags: ['Identity']
        }),
        createGamifiedIdentity: builder.mutation<any, any>({
            query: (body) => ({
                url: '/gamification/identities',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Identity']
        }),
        getStreaks: builder.query<any[], void>({
            query: () => '/gamification/streaks',
            providesTags: ['Streak']
        }),
        getAchievements: builder.query<any[], void>({
            query: () => '/gamification/achievements',
            providesTags: ['Achievement']
        }),
        getGamifiedDashboard: builder.query<any, void>({
            query: () => '/gamification/dashboard',
            providesTags: ['Identity', 'Streak', 'Achievement']
        }),
        getAnalyticsTrends: builder.query<any[], void>({
            query: () => '/gamification/analytics/trends',
            providesTags: ['Burnout', 'Log']
        }),
        // Habits
        getHabits: builder.query<any[], { system_id?: string }>({
            query: (params) => ({
                url: '/focus/habits',
                params
            }),
            providesTags: ['Habit']
        }),
        createHabit: builder.mutation<any, any>({
            query: (body) => ({
                url: '/focus/habits',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Habit']
        }),
        updateHabit: builder.mutation<any, { id: string; updates: any }>({
            query: ({ id, updates }) => ({
                url: `/focus/habits/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: ['Habit', 'Log', 'Area']
        }),
        deleteHabit: builder.mutation<any, string>({
            query: (id) => ({
                url: `/focus/habits/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Habit']
        }),
        getHabitAnalytics: builder.query<any, string>({
            query: (id) => `/focus/habits/${id}/analytics`,
            providesTags: ['Habit', 'Log']
        }),
        getHabitOverview: builder.query<any, { period: string }>({
            query: (params) => ({
                url: '/focus/stats/habits/overview',
                params
            }),
            providesTags: ['Habit', 'Log']
        }),
        getHabitBreakdown: builder.query<any[], { period: string }>({
            query: (params) => ({
                url: '/focus/stats/habits/breakdown',
                params
            }),
            providesTags: ['Habit', 'Log']
        }),
        // Roadmap
        getRoadmapStatus: builder.query<any[], { year?: number }>({
            query: (params) => ({
                url: '/focus/roadmap/status',
                params
            }),
            providesTags: ['Log', 'Achievement']
        }),
        getMonthlyRoadmap: builder.query<any, { year: number; month: number }>({
            query: ({ year, month }) => `/focus/roadmap/monthly/${year}/${month}`,
            providesTags: ['Log', 'Health', 'Habit']
        }),
        saveRoadmapConfig: builder.mutation<any, any>({
            query: (body) => ({
                url: '/focus/roadmap/config',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Log']
        })
    }),
});

export const {
    useGetTasksQuery,
    useAddTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
    useGetAreasQuery,
    useGetAreaWorkspaceQuery,
    useStartSessionMutation,
    useFinishSessionMutation,
    useGetRecentSessionsQuery,
    useLogHealthMutation,
    useGetTodayHealthQuery,
    useGetHealthHistoryQuery,
    useGetBurnoutScoreQuery,
    useGetDecksQuery,
    useCreateDeckMutation,
    useCreateCardMutation,
    useGetDueCardsQuery,
    useReviewCardMutation,
    useSendMessageMutation,
    useLoginMutation,
    useRegisterMutation,
    useGetEisenhowerSnapshotQuery,
    useUpsertEisenhowerItemMutation,
    useUpdateEisenhowerItemMutation,
    useBatchUpdateEisenhowerItemsMutation,
    useDeleteEisenhowerItemMutation,
    useGetEisenhowerSummaryQuery,
    useGetSystemsQuery,
    useCreateSystemMutation,
    useUpdateSystemMutation,
    useDeleteSystemMutation,
    useGetLogsQuery,
    useCreateLogMutation,
    useCreateBatchLogMutation,
    useGetBurnoutStatusQuery,
    useGetWeeklyReviewsQuery,
    useCreateWeeklyReviewMutation,
    useGetQuarterlyIdentitiesQuery,
    useCreateQuarterlyIdentityMutation,
    useCreateOutcomeMutation,
    useUpdateOutcomeMutation,
    useDeleteOutcomeMutation,
    useGetFutureVisionQuery,
    useUpdateFutureVisionMutation,
    useGetGamifiedIdentitiesQuery,
    useCreateGamifiedIdentityMutation,
    useGetStreaksQuery,
    useGetAchievementsQuery,
    useGetGamifiedDashboardQuery,
    useGetAnalyticsTrendsQuery,
    useGetHabitsQuery,
    useCreateHabitMutation,
    useUpdateHabitMutation,
    useDeleteHabitMutation,
    useGetHabitAnalyticsQuery,
    useGetHabitOverviewQuery,
    useGetHabitBreakdownQuery,
    useGetPlanningStatsQuery,
    useCreateAreaMutation,
    useUpdateAreaMutation,
    useDeleteAreaMutation,
    useGetAreaStatsQuery,
    useGetProjectsQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
    useGetResourcesByAreaQuery,
    useCreateResourceMutation,
    useDeleteResourceMutation,
    useGetReferencesQuery,
    useCreateReferenceMutation,
    useUpdateReferenceMutation,
    useDeleteReferenceMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
    useResetPasswordMutation,
    useGetArtifactsQuery,
    useCreateArtifactMutation,
    useGetHealthAnalyticsQuery,
    useGetVarianceAnalyticsQuery,
    useGetWorkflowsQuery,
    useGetSmartSuggestionsQuery,
    useCreateWorkflowMutation,
    useUpdateWorkflowMutation,
    useDeleteWorkflowMutation,
    useStartWorkflowRunMutation,
    useCompleteWorkflowRunMutation,
    useGetPlantedTreesQuery,
    usePlantTreeMutation,
    useGetRoadmapStatusQuery,
    useGetMonthlyRoadmapQuery,
    useSaveRoadmapConfigMutation
} = apiSlice;
