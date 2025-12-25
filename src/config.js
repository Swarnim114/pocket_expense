import { Platform } from 'react-native';

// Dynamic Base URL
// Web -> localhost
// Android Emulator -> 10.0.2.2
// Physical Device -> Your LAN IP
const SERVER_IP = '192.168.1.18'; // Keep this for your phone
export const API_BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : `http://${SERVER_IP}:5000/api`;

export const AUTH_URL = `${API_BASE_URL}/auth`;
export const EXPENSES_URL = `${API_BASE_URL}/expenses`;
export const CATEGORIES_URL = `${API_BASE_URL}/categories`;
export const BUDGETS_URL = `${API_BASE_URL}/budgets`;
