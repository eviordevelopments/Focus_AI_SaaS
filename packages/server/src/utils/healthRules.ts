// Health metric scoring rules and burnout calculation

export interface HealthMetrics {
    sleep_hours: number;
    mood: number;
    stress: number;
    exercise_minutes: number;
    screen_time_hours: number;
}

export interface BurnoutScore {
    overall_score: number;
    risk_level: 'optimal' | 'moderate' | 'warning' | 'critical';
    breakdown: {
        sleep: number;
        stress: number;
        mood: number;
        exercise: number;
        screen: number;
    };
    recommendations: string[];
    doctor_referral: boolean;
}

// Scoring weights
const WEIGHTS = {
    sleep: 0.30,
    stress: 0.25,
    mood: 0.20,
    exercise: 0.15,
    screen: 0.10
};

// Calculate individual metric scores (0-100)
function scoreSleep(hours: number): number {
    if (hours >= 7 && hours <= 9) return 100;
    if (hours >= 6 && hours < 7) return 75;
    if (hours >= 5 && hours < 6) return 50;
    if (hours >= 4 && hours < 5) return 25;
    return 10;
}

function scoreStress(level: number): number {
    if (level <= 3) return 100;
    if (level <= 5) return 75;
    if (level <= 7) return 50;
    if (level <= 9) return 25;
    return 10;
}

function scoreMood(level: number): number {
    if (level >= 8) return 100;
    if (level >= 6) return 75;
    if (level >= 4) return 50;
    if (level >= 2) return 25;
    return 10;
}

function scoreExercise(minutes: number): number {
    if (minutes >= 30 && minutes <= 90) return 100;
    if (minutes >= 15 && minutes < 30) return 75;
    if (minutes >= 5 && minutes < 15) return 50;
    if (minutes > 0) return 25;
    return 10;
}

function scoreScreen(hours: number): number {
    if (hours <= 6) return 100;
    if (hours <= 8) return 75;
    if (hours <= 10) return 50;
    if (hours <= 12) return 25;
    return 10;
}

// Calculate overall burnout score
export function calculateBurnoutScore(metrics: HealthMetrics): BurnoutScore {
    const breakdown = {
        sleep: scoreSleep(metrics.sleep_hours),
        stress: scoreStress(metrics.stress),
        mood: scoreMood(metrics.mood),
        exercise: scoreExercise(metrics.exercise_minutes),
        screen: scoreScreen(metrics.screen_time_hours)
    };

    const overall_score =
        breakdown.sleep * WEIGHTS.sleep +
        breakdown.stress * WEIGHTS.stress +
        breakdown.mood * WEIGHTS.mood +
        breakdown.exercise * WEIGHTS.exercise +
        breakdown.screen * WEIGHTS.screen;

    let risk_level: 'optimal' | 'moderate' | 'warning' | 'critical';
    if (overall_score >= 80) risk_level = 'optimal';
    else if (overall_score >= 60) risk_level = 'moderate';
    else if (overall_score >= 40) risk_level = 'warning';
    else risk_level = 'critical';

    const recommendations = generateRecommendations(metrics, breakdown, risk_level);
    const doctor_referral = shouldReferToDoctor(metrics, risk_level);

    return {
        overall_score: Math.round(overall_score),
        risk_level,
        breakdown,
        recommendations,
        doctor_referral
    };
}

// Generate personalized recommendations
function generateRecommendations(
    metrics: HealthMetrics,
    breakdown: any,
    risk_level: string
): string[] {
    const recommendations: string[] = [];

    // Sleep recommendations
    if (breakdown.sleep < 75) {
        if (metrics.sleep_hours < 6) {
            recommendations.push('🚨 Critical: Prioritize 7-8 hours of sleep tonight');
        } else if (metrics.sleep_hours < 7) {
            recommendations.push('💤 Aim for 7-9 hours of sleep for optimal recovery');
        }
    }

    // Stress recommendations
    if (breakdown.stress < 75) {
        if (metrics.stress >= 8) {
            recommendations.push('🧘 High stress detected - try 10min meditation or deep breathing');
        } else if (metrics.stress >= 6) {
            recommendations.push('😌 Consider stress management: walks, journaling, or talking to someone');
        }
    }

    // Mood recommendations
    if (breakdown.mood < 75) {
        if (metrics.mood <= 3) {
            recommendations.push('💙 Low mood persisting - consider reaching out to a mental health professional');
        } else if (metrics.mood <= 5) {
            recommendations.push('🌟 Boost mood: connect with friends, get sunlight, or do something you enjoy');
        }
    }

    // Exercise recommendations
    if (breakdown.exercise < 75) {
        if (metrics.exercise_minutes < 15) {
            recommendations.push('🏃 Start small: 10-minute walk can boost energy and mood');
        } else if (metrics.exercise_minutes < 30) {
            recommendations.push('💪 Increase activity to 30min/day for optimal health benefits');
        }
    }

    // Screen time recommendations
    if (breakdown.screen < 75) {
        if (metrics.screen_time_hours > 10) {
            recommendations.push('📱 High screen time - try reducing by 2 hours, especially before bed');
        } else if (metrics.screen_time_hours > 8) {
            recommendations.push('👀 Consider screen breaks every hour to reduce eye strain');
        }
    }

    // Risk-level specific recommendations
    if (risk_level === 'critical') {
        recommendations.unshift('⚠️ BURNOUT ALERT: Multiple health metrics are critical - take immediate action');
    } else if (risk_level === 'warning') {
        recommendations.unshift('⚡ Warning: You\'re at risk of burnout - prioritize self-care this week');
    } else if (risk_level === 'optimal') {
        recommendations.push('✨ Great job! Keep maintaining these healthy habits');
    }

    return recommendations;
}

// Determine if doctor referral is needed
function shouldReferToDoctor(metrics: HealthMetrics, risk_level: string): boolean {
    // Critical burnout score
    if (risk_level === 'critical') return true;

    // Severe sleep deprivation
    if (metrics.sleep_hours < 5) return true;

    // Severe mood issues
    if (metrics.mood <= 2) return true;

    // Extreme stress
    if (metrics.stress >= 9) return true;

    return false;
}

// Check for achievement unlocks
export function checkAchievements(
    recentEntries: HealthMetrics[],
    currentStreak: number
): { key: string; name: string; xp: number }[] {
    const achievements: { key: string; name: string; xp: number }[] = [];

    // 7-day streak
    if (currentStreak === 7) {
        achievements.push({ key: '7_day_streak', name: '🔥 7-Day Warrior', xp: 100 });
    }

    // 30-day streak
    if (currentStreak === 30) {
        achievements.push({ key: '30_day_streak', name: '🏆 Monthly Champion', xp: 500 });
    }

    // Sleep champion (7 days of optimal sleep)
    if (recentEntries.length >= 7) {
        const last7 = recentEntries.slice(0, 7);
        if (last7.every(e => e.sleep_hours >= 7 && e.sleep_hours <= 9)) {
            achievements.push({ key: 'sleep_champion', name: '😴 Sleep Champion', xp: 150 });
        }
    }

    // Stress master (14 days of low stress)
    if (recentEntries.length >= 14) {
        const last14 = recentEntries.slice(0, 14);
        if (last14.every(e => e.stress <= 3)) {
            achievements.push({ key: 'stress_master', name: '🧘 Stress Master', xp: 200 });
        }
    }

    // Fitness warrior (30 days of exercise)
    if (recentEntries.length >= 30) {
        const last30 = recentEntries.slice(0, 30);
        if (last30.every(e => e.exercise_minutes >= 30)) {
            achievements.push({ key: 'fitness_warrior', name: '💪 Fitness Warrior', xp: 300 });
        }
    }

    // Perfect week (all metrics optimal for 7 days)
    if (recentEntries.length >= 7) {
        const last7 = recentEntries.slice(0, 7);
        const allOptimal = last7.every(e => {
            const score = calculateBurnoutScore(e);
            return score.overall_score >= 80;
        });
        if (allOptimal) {
            achievements.push({ key: 'perfect_week', name: '⭐ Perfect Week', xp: 250 });
        }
    }

    return achievements;
}

// Calculate level and mastery from XP
export function calculateLevel(xp: number): { level: string; progress: number; nextLevel: number; mastery: number } {
    // Mastery scaling: Every 2000 XP is a new Mastery level
    const mastery = Math.floor(xp / 2000) + 1;
    const currentMasteryXp = xp % 2000;

    // Sub-levels within a Mastery (0-499: Bronze, 500-999: Silver, 1000-1499: Gold, 1500-1999: Platinum)
    let level = 'bronze';
    let nextLevel = 500;
    let progress = currentMasteryXp;

    if (currentMasteryXp >= 1500) {
        level = 'platinum';
        nextLevel = 2000; // Next Mastery
        progress = currentMasteryXp - 1500;
    } else if (currentMasteryXp >= 1000) {
        level = 'gold';
        nextLevel = 1500;
        progress = currentMasteryXp - 1000;
    } else if (currentMasteryXp >= 500) {
        level = 'silver';
        nextLevel = 1000;
        progress = currentMasteryXp - 500;
    }

    return { level, progress, nextLevel, mastery };
}

// Calculate penalties for missed days
export function calculatePenalties(lastLoggedDate: string | null): { penaltyXp: number; brokenStreak: boolean } {
    if (!lastLoggedDate) return { penaltyXp: 0, brokenStreak: false };

    const last = new Date(lastLoggedDate);
    const today = new Date();

    // Reset time components for accurate date comparison
    last.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If more than 1 day passed since last log (i.e., missed yesterday), apply penalty
    if (diffDays > 1) {
        // Penalty: (Days Missed - 1) * 50 XP
        // E.g., Missed 1 day (diffDays=2) -> 50 XP penalty
        // Missed 2 days (diffDays=3) -> 100 XP penalty
        const penaltyXp = (diffDays - 1) * 50;
        return { penaltyXp, brokenStreak: true };
    }

    return { penaltyXp: 0, brokenStreak: false };
}
