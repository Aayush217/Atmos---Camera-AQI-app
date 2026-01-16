const API_URL = 'http://10.98.175.43:3000/api';

export const createUserProfile = async (data: { name: string, age: number, conditions: string[], sensitivity_level: string }) => {
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error("API Error (createUserProfile):", error);
        return null;
    }
};

export const analyzeImage = async (data: { latitude: number; longitude: number; userId?: number }) => {
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Analysis failed');
        return await response.json();
    } catch (error) {
        console.error("API Analyze Error:", error);
        throw error;
    }
};

export const saveScan = async (scanData: any) => {
    try {
        const response = await fetch(`${API_URL}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scanData),
        });
        return await response.json();
    } catch (error) {
        console.error("API Save Error:", error);
        throw error;
    }
};

export const getUserProfile = async () => {
    try {
        const response = await fetch(`${API_URL}/user`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("API Error (getUserProfile):", error);
        return null;
    }
};
export const getRecentScans = async () => {
    try {
        const response = await fetch(`${API_URL}/scans`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("API Error (getRecentScans):", error);
        return [];
    }
};
