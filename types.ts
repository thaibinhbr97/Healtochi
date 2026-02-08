export interface Task {
    id: string;
    title: string;
    completed: boolean;
    points: number;
    icon: string; // Emoji
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
    BREATHE = 'BREATHE',
    SHOP = 'SHOP'
}

export interface PetState {
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    mood: string;
    tokens: number;
}
