export interface Task {
    id: string;
    title: string;
    completed: boolean;
    points: number;
    icon: string; // Emoji
    completedAt?: string;
}

export interface MoodLog {
    date: string;
    mood: 'happy' | 'neutral' | 'sad' | 'anxious' | 'tired';
    note?: string;
}

export enum Tab {
    HOME = 'HOME',
    TASKS = 'TASKS',
    VOICE = 'VOICE',
    SHOP = 'SHOP'
}

export interface PetState {
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    mood: string;
    health: number;
    waterCount: number;
    foodCount: number;
    lastEatenTime: number;
    lastMoodCheckinTime: number;
    lastWaterTime: number;
    tokens: number;
}
