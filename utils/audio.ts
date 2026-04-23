

export const AUDIO_SOURCES = {
    EATING: eatingSound,
    DRINKING: drinkingSound,
    CHECKIN: checkinSound,
    CELEBRATION: celebrationSound
};

export const playSound = (url: string, durationMs: number = 1000) => {
    console.log(`[Audio] Playing sound for ${durationMs}ms`);
    const audio = new Audio(url);
    audio.volume = 0.5;

    audio.play().catch(err => {
        console.error("[Audio] Playback failed:", err.message);
    });

    setTimeout(() => {
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, durationMs);
};
