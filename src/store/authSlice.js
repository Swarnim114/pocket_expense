import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual IP address for Android testing
const API_URL = 'http://192.168.1.18:5000/api/auth';

export const signup = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/signup`, userData);
        await AsyncStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const login = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData);
        await AsyncStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const logout = createAsyncThunk('auth/logout', async () => {
    await AsyncStorage.removeItem('token');
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        restoreToken: (state, action) => {
            state.token = action.payload;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload ? action.payload.msg : 'Signup failed';
            })
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload ? action.payload.msg : 'Login failed';
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
            });
    },
});

export const { restoreToken } = authSlice.actions;
export default authSlice.reducer;
