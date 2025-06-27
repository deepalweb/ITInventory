const API_BASE_URL = '/api';

export const api = {
  // Example API call
  async getDevices() {
    const response = await fetch(`${API_BASE_URL}/devices`);
    if (!response.ok) {
      throw new Error('Failed to fetch devices');
    }
    return response.json();
  },
  
  // Add more API methods here as needed
  async createDevice(deviceData: any) {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
    });
    if (!response.ok) {
      throw new Error('Failed to create device');
    }
    return response.json();
  },
};
