const BASE_URL = 'http://172.20.10.13:3000/api'; // Updated with local IP

export const createUserProfile = async (data: { name: string, age: number, conditions: string[], sensitivity_level: string }) => {
    try {
        const response = await fetch(`${BASE_URL}/user`, {
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

export const saveScan = async (data: { userId: number, aqi: number, location: any, ai_analysis: any }) => {
    try {
        const response = await fetch(`${BASE_URL}/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error("API Error (saveScan):", error);
        return null;
    }
};

export const getUserProfile = async () => {
    try {
        const response = await fetch(`${BASE_URL}/user`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("API Error (getUserProfile):", error);
        return null;
    }
};
