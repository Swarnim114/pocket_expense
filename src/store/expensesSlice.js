import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Replace with your actual IP address
const API_URL = 'http://192.168.1.18:5000/api/expenses';

// Helper to get token
const getConfig = async () => {
    const token = await AsyncStorage.getItem('token');
    return {
        headers: {
            'x-auth-token': token,
        },
    };
};

export const fetchExpenses = createAsyncThunk('expenses/fetch', async (_, { rejectWithValue }) => {
    try {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            // If offline, rely on persisted state (simplification)
            return []; // We will handle this by NOT replacing state if offline in reducer, or just returning null
        }

        const config = await getConfig();
        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Network Error');
    }
});

export const addExpense = createAsyncThunk('expenses/add', async (expenseData, { rejectWithValue }) => {
    try {
        const netState = await NetInfo.fetch();

        // Offline Mode
        if (!netState.isConnected) {
            return {
                ...expenseData,
                _id: `temp_${Date.now()}`,
                date: expenseData.date || new Date().toISOString(),
                isOffline: true,
            };
        }

        // Online Mode
        const config = await getConfig();
        const response = await axios.post(API_URL, expenseData, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Network Error');
    }
});

export const deleteExpense = createAsyncThunk('expenses/delete', async (id, { rejectWithValue }) => {
    try {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            // Simple offline delete: just return ID to remove from local state
            // Ideally we'd queue a delete action, but for now let's just allow local deletion
            return id;
        }

        const config = await getConfig();
        await axios.delete(`${API_URL}/${id}`, config);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Network Error');
    }
});

export const syncPendingExpenses = createAsyncThunk('expenses/sync', async (_, { getState, dispatch }) => {
    const state = getState();
    const pending = state.expenses.pendingQueue;

    if (pending.length === 0) return;

    const config = await getConfig();
    const syncedItems = [];

    for (const item of pending) {
        try {
            // Remove temp ID and offline flag
            const { _id, isOffline, ...cleanItem } = item;
            const response = await axios.post(API_URL, cleanItem, config);
            syncedItems.push({ tempId: _id, realItem: response.data });
        } catch (e) {
            console.error("Sync failed for item", item, e);
        }
    }
    return syncedItems;
});

const expensesSlice = createSlice({
    name: 'expenses',
    initialState: {
        items: [],
        pendingQueue: [], // Items waiting to be synced
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchExpenses.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.isLoading = false;
                // Only replace items if we actually got data (online)
                if (Array.isArray(action.payload) && action.payload.length > 0) {
                    state.items = action.payload;
                }
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addExpense.fulfilled, (state, action) => {
                const expense = action.payload;
                if (expense.isOffline) {
                    state.pendingQueue.push(expense);
                }
                state.items.unshift(expense);
            })
            // Delete
            .addCase(deleteExpense.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item._id !== action.payload);
                // Also remove from pending if it was there
                state.pendingQueue = state.pendingQueue.filter((item) => item._id !== action.payload);
            })
            // Sync
            .addCase(syncPendingExpenses.fulfilled, (state, action) => {
                if (!action.payload) return;

                action.payload.forEach(({ tempId, realItem }) => {
                    // Remove from queue
                    state.pendingQueue = state.pendingQueue.filter(i => i._id !== tempId);
                    // Update item in list (replace temp ID with real ID)
                    const index = state.items.findIndex(i => i._id === tempId);
                    if (index !== -1) {
                        state.items[index] = realItem;
                    }
                });
            });
    },
});

export default expensesSlice.reducer;
