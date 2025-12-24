// Replace with your actual Local IP address
// You can find this by running `ip addr` or `ifconfig` on Linux/Mac, or `ipconfig` on Windows.
// It should look like 192.168.x.x
export const API_BASE_URL = 'http://192.168.1.18:5000/api';

export const AUTH_URL = `${API_BASE_URL}/auth`;
export const EXPENSES_URL = `${API_BASE_URL}/expenses`;
export const CATEGORIES_URL = `${API_BASE_URL}/categories`;
