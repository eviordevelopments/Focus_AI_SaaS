export interface TimeSeriesPoint {
    date: string;
    value: number;
    personalBest: number;
    personalLow: number;
}

export interface OptimalRange {
    min: number;
    max: number;
    target: number;
}

export interface MetricStatistics {
    currentAvg: number;
    bestEver: number;
    lowestEver: number;
    variance?: number;
}

export interface MetricConfig {
    label: string;
    unit: string;
    optimal: OptimalRange;
    color: string;
    icon: string;
}

export const METRIC_CONFIGS: Record<string, Record<string, MetricConfig>> = {
    health: {
        sleep: {
            label: 'Sleep',
            unit: 'hours',
            optimal: { min: 7, max: 9, target: 8 },
            color: '#6366f1',
            icon: 'Moon'
        },
        mood: {
            label: 'Mood',
            unit: '/10',
            optimal: { min: 7, max: 10, target: 8 },
            color: '#10b981',
            icon: 'Smile'
        },
        stress: {
            label: 'Stress',
            unit: '/10',
            optimal: { min: 1, max: 3, target: 2 },
            color: '#ef4444',
            icon: 'Zap'
        },
        exercise: {
            label: 'Exercise',
            unit: 'minutes',
            optimal: { min: 30, max: 60, target: 45 },
            color: '#f97316',
            icon: 'Activity'
        },
        screen: {
            label: 'Screen Time',
            unit: 'hours',
            optimal: { min: 0, max: 8, target: 4 },
            color: '#06b6d4',
            icon: 'Monitor'
        }
    },
    work: {
        tasksCompleted: {
            label: 'Tasks Completed',
            unit: 'tasks/day',
            optimal: { min: 5, max: 8, target: 6 },
            color: '#3b82f6',
            icon: 'CheckSquare'
        },
        projectProgress: {
            label: 'Project Progress',
            unit: '%/week',
            optimal: { min: 10, max: 15, target: 12 },
            color: '#8b5cf6',
            icon: 'TrendingUp'
        },
        focusHours: {
            label: 'Focus Hours',
            unit: 'hours/day',
            optimal: { min: 4, max: 6, target: 5 },
            color: '#ec4899',
            icon: 'Target'
        }
    },
    personal: {
        habitsCompleted: {
            label: 'Habits Completed',
            unit: '%',
            optimal: { min: 80, max: 100, target: 90 },
            color: '#14b8a6',
            icon: 'CheckCircle2'
        },
        systemAdherence: {
            label: 'System Adherence',
            unit: '%',
            optimal: { min: 90, max: 100, target: 95 },
            color: '#a855f7',
            icon: 'Layers'
        }
    }
};
