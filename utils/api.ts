// utils/api.ts
export const getApiBaseUrl = () => {
    let envUrl = (import.meta as any).env.VITE_API_URL;

    // Clean up trailing slash if present
    if (envUrl && envUrl.endsWith('/')) {
        envUrl = envUrl.slice(0, -1);
    }

    if (envUrl) return envUrl;

    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:8000';
    }

    return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();
