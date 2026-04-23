export const getApiBaseUrl = () => {
    // If we have a local env override, use it
    const envUrl = (import.meta as any).env.VITE_API_URL;
    if (envUrl) return envUrl;

    // Default to localhost for development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://127.0.0.1:8000';
    }

    // Fallback (you can set this to your production backend URL once deployed)
    return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();
