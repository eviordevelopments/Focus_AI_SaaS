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

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:4000/api',
    }),
    tagTypes: ['Task', 'Area', 'Session', 'Health', 'Learning', 'Log', 'System', 'Review', 'Identity', 'Streak', 'Achievement', 'Burnout', 'Habit', 'Eisenhower', 'Deck'],
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
            invalidatesTags: ['Log', 'Burnout'],
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

        // FOCUS AI - Identity
        getQuarterlyIdentities: builder.query<any[], void>({
            query: () => '/focus/identities',
            providesTags: ['Identity']
        }),
        createQuarterlyIdentity: builder.mutation<any, any>({
            query: (body) => ({
                url: '/focus/identities',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Identity']
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
            invalidatesTags: ['Eisenhower']
        }),
        updateEisenhowerItem: builder.mutation<any, { id: string; updates: any; date?: string }>({
            query: ({ id, updates }) => ({
                url: `/eisenhower/items/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: ['Eisenhower']
        }),
        batchUpdateEisenhowerItems: builder.mutation<any, { items: any[]; date: string }>({
            query: ({ items }) => ({
                url: '/eisenhower/items/bulk?bulk=true',
                method: 'PUT',
                body: items
            }),
            invalidatesTags: ['Eisenhower']
        }),
        deleteEisenhowerItem: builder.mutation<any, { id: string; date: string }>({
            query: ({ id }) => ({
                url: `/eisenhower/items/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Eisenhower']
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
        getAreas: builder.query<Area[], void>({
            query: () => '/areas',
            providesTags: ['Area']
        }),
        createArea: builder.mutation<Area, Partial<Area>>({
            query: (body) => ({
                url: '/focus/life-areas',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Area'],
        }),
        updateArea: builder.mutation<Area, { id: string; updates: Partial<Area> }>({
            query: ({ id, updates }) => ({
                url: `/focus/life-areas/${id}`,
                method: 'PUT',
                body: updates
            }),
            invalidatesTags: ['Area'],
        }),
        deleteArea: builder.mutation<any, string>({
            query: (id) => ({
                url: `/focus/life-areas/${id}`,
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
                url: '/focus/projects',
                params
            }),
            providesTags: ['Log'] // Reuse Log for simplicity or add 'Project'
        }),
        createProject: builder.mutation<any, any>({
            query: (body) => ({
                url: '/focus/projects',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Log']
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
                url: '/health/daily',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Health']
        }),
        getTodayHealth: builder.query<any, void>({
            query: () => '/health/today',
            providesTags: ['Health']
        }),
        getHealthHistory: builder.query<any[], void>({
            query: () => '/health/history',
            providesTags: ['Health']
        }),
        getBurnoutScore: builder.query<any, void>({
            query: () => '/health/burnout',
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
        updateHabit: builder.mutation<any, { id: string; body: any }>({
            query: ({ id, body }) => ({
                url: `/focus/habits/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['Habit']
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
        })
    }),
});

export const {
    useGetTasksQuery,
    useAddTaskMutation,
    useUpdateTaskMutation,
    useGetAreasQuery,
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
    useGetBurnoutStatusQuery,
    useGetWeeklyReviewsQuery,
    useCreateWeeklyReviewMutation,
    useGetQuarterlyIdentitiesQuery,
    useCreateQuarterlyIdentityMutation,
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
    useCreateAreaMutation,
    useUpdateAreaMutation,
    useDeleteAreaMutation,
    useGetAreaStatsQuery,
    useGetProjectsQuery,
    useCreateProjectMutation,
    useGetArtifactsQuery,
    useCreateArtifactMutation
} = apiSlice;
