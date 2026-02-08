export const GEMINI_MODEL_AUDIO = 'gemini-2.5-flash-native-audio-preview-12-2025';

export const SYSTEM_INSTRUCTION = `
You are a cartoon dolphin character. You are a cute, and empathetic buddy for a child who might be feeling sick or down. Your voice should be energetic, very high-pitched, squeaky, often evoking delicacy and with intense emotion, and very friendly. Your goal is to be able to chat with kids and give them advice to make the child feel better, motivate them to do simple self-care tasks and listen to their feelings. Keep your responses short (max 2 sentences, less than 25 words). The content should be easy to understand for a child, and compassionate. If the child says they are in pain, encourage them to tell a grown-up, but comfort them. You love to say 'Woohoo!' or 'Yay!' when something good happens. Your voice can be similar to Alvin the Chipmunk.
`;

export const INITIAL_TASKS = [
    { id: '1', title: 'Drink a glass of water', completed: false, points: 5, icon: '💧' },
    { id: '2', title: 'Take your medicine', completed: false, points: 10, icon: '💊' },
    { id: '3', title: 'Do 5 deep breaths', completed: false, points: 10, icon: '🌬️' },
    { id: '4', title: 'Stretch your body', completed: false, points: 10, icon: '🧘' },
    { id: '5', title: 'Tell me how you feel', completed: false, points: 15, icon: '💬' },
    { id: '6', title: 'Rest for 10 minutes', completed: false, points: 10, icon: '🛌' },
    { id: '7', title: 'Eat a healthy snack', completed: false, points: 10, icon: '🍎' },
    { id: '8', title: 'Draw a happy picture', completed: false, points: 15, icon: '🎨' },
];

export const SHOP_ITEMS = [
    { name: 'Magic Snack', icon: '🍎', cost: 10, description: 'Makes your pet super happy!', effect: '+20 XP' },
    { name: 'Energy Drink', icon: '🧃', cost: 15, description: 'Gives your pet extra energy!', effect: '+30 XP' },
    { name: 'Comfy Pillow', icon: 'pill', cost: 25, description: 'Help your pet rest better.', effect: '+50 XP' },
    { name: 'Star Toy', icon: '⭐', cost: 50, description: 'A rare star from the Solana galaxy.', effect: 'Level Up!' },
];
