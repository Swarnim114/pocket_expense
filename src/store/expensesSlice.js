import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { EXPENSES_URL, CATEGORIES_URL, BUDGETS_URL } from '../config';
import { sendBudgetAlert } from '../utils/notifications';

// Replace with your actual IP address
const API_URL = EXPENSES_URL;

// Helper to get token
const getConfig = async () => {
    const token = await AsyncStorage.getItem('token');
    return {
        headers: {
            'x-auth-token': token,
        },
    };
};

// --- Expenses Thunks ---

export const fetchExpenses = createAsyncThunk('expenses/fetch', async (_, { rejectWithValue }) => {
    try {
        const netState = await NetInfo.fetch();
        // If offline, reject so we don't overwrite local data with []
        if (!netState.isConnected) {
            return rejectWithValue('Offline - Using cached data');
        }

        const config = await getConfig();
        const response = await axios.get(API_URL, config);
        console.log(`Fetched ${response.data.length} items`);
        return response.data;
    } catch (error) {
        console.error('Fetch Error:', error);
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
        if (!netState.isConnected) return id;

        const config = await getConfig();
        await axios.delete(`${API_URL}/${id}`, config);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Network Error');
    }
});

export const editExpense = createAsyncThunk('expenses/edit', async ({ id, updatedData }, { rejectWithValue }) => {
    try {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            return rejectWithValue('Cannot edit while offline (yet)');
        }

        const config = await getConfig();
        const response = await axios.put(`${API_URL}/${id}`, updatedData, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Network Error');
    }
});

// --- Categories Thunks ---

export const fetchCategories = createAsyncThunk('categories/fetch', async (_, { rejectWithValue }) => {
    try {
        const config = await getConfig();
        const response = await axios.get(CATEGORIES_URL, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Network Error');
    }
});

export const addCategory = createAsyncThunk('categories/add', async (catData, { rejectWithValue }) => {
    try {
        const config = await getConfig();
        const response = await axios.post(CATEGORIES_URL, catData, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Network Error');
    }
});

export const deleteCategory = createAsyncThunk('categories/delete', async (id, { rejectWithValue }) => {
    try {
        const config = await getConfig();
        await axios.delete(`${CATEGORIES_URL}/${id}`, config);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Network Error');
    }
});


// --- Budgets Thunks ---

export const fetchBudgets = createAsyncThunk('budgets/fetch', async (_, { rejectWithValue }) => {
    try {
        const config = await getConfig();
        const response = await axios.get(BUDGETS_URL, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Network Error');
    }
});

export const setBudget = createAsyncThunk('budgets/set', async (budgetData, { rejectWithValue }) => {
    try {
        const config = await getConfig();
        const response = await axios.post(BUDGETS_URL, budgetData, config);
        return response.data;
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
            const response = await axios.post(`${API_URL}/expenses`, cleanItem, config);
            syncedItems.push({ tempId: _id, realItem: response.data });
        } catch (e) {
            console.error("Sync failed for item", item, e);
        }
    }
    return syncedItems;
});

// Helper to save to storage
const saveToStorage = async (items, pendingQueue) => {
    try {
        // Ensure we only save serializable data
        const cleanItems = JSON.parse(JSON.stringify(items));
        const cleanQueue = JSON.parse(JSON.stringify(pendingQueue));

        await AsyncStorage.setItem('expenses_data', JSON.stringify(cleanItems));
        await AsyncStorage.setItem('expenses_pending', JSON.stringify(cleanQueue));
    } catch (e) {
        console.error('Failed to save to storage', e);
    }
};

export const hydrateExpenses = createAsyncThunk('expenses/hydrate', async (_, { rejectWithValue }) => {
    try {
        const itemsJson = await AsyncStorage.getItem('expenses_data');
        const pendingJson = await AsyncStorage.getItem('expenses_pending');
        return {
            items: itemsJson ? JSON.parse(itemsJson) : [],
            pendingQueue: pendingJson ? JSON.parse(pendingJson) : [],
        };
    } catch (e) {
        return rejectWithValue('Failed to load local data');
    }
});

const expensesSlice = createSlice({
    name: 'expenses',
    initialState: {
        items: [],
        categories: [], // Stored categories
        budgets: [], // Stored budgets
        pendingQueue: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Hydrate
            .addCase(hydrateExpenses.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.pendingQueue = action.payload.pendingQueue;
            })
            // Fetch Expenses
            .addCase(fetchExpenses.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.isLoading = false;
                // Only update if we have a valid array
                if (Array.isArray(action.payload)) {
                    state.items = action.payload;
                    saveToStorage(state.items, state.pendingQueue);
                }
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.isLoading = false;
                // Don't clear items, just set error
                // If it was the specific "Offline" message, we could set a flag
                state.error = action.payload;
            })
            // Add Expense
            .addCase(addExpense.fulfilled, (state, action) => {
                const expense = action.payload;
                if (expense.isOffline) {
                    state.pendingQueue.push(expense);
                }
                state.items.unshift(expense);
                saveToStorage(state.items, state.pendingQueue);

                // --- Notification Logic ---
                // We only run this if online (for now) or if we trust local state enough.
                // Since we just added the expense to state.items, we can calculate total.
                try {
                    const category = expense.category;
                    if (category && state.budgets) {
                        const budgetItem = state.budgets.find(b => b.category === category || b.category === 'GLOBAL');
                        if (budgetItem) {
                            const limit = parseFloat(budgetItem.limit);
                            // Calculate total for this category for the current month
                            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
                            const totalSpent = state.items
                                .filter(i =>
                                    (i.category === category || (budgetItem.category === 'GLOBAL')) &&
                                    i.date.startsWith(currentMonth) &&
                                    i.type === 'expense'
                                )
                                .reduce((sum, item) => sum + parseFloat(item.amount), 0);

                            if (totalSpent > limit) {
                                sendBudgetAlert(
                                    'Budget Exceeded! 🚨',
                                    `You've exceeded your ${category} budget of $${limit}. Current: $${totalSpent}`
                                );
                            } else if (totalSpent > limit * 0.8) {
                                sendBudgetAlert(
                                    'Budget Warning ⚠️',
                                    `You're at ${(totalSpent / limit * 100).toFixed(0)}% of your ${category} budget.`
                                );
                            }
                        }
                    }
                } catch (err) {
                    console.log('Notification Check Failed:', err);
                }
            })
            // Delete Expense
            .addCase(deleteExpense.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item._id !== action.payload);
                state.pendingQueue = state.pendingQueue.filter((item) => item._id !== action.payload);
                saveToStorage(state.items, state.pendingQueue);
            })
            // Edit Expense
            .addCase(editExpense.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                saveToStorage(state.items, state.pendingQueue);
            })
            // Fetch Categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            // Add Category
            .addCase(addCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            // Delete Category
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c._id !== action.payload);
            })
            // Sync
            .addCase(syncPendingExpenses.fulfilled, (state, action) => {
                if (!action.payload) return;
                action.payload.forEach(({ tempId, realItem }) => {
                    state.pendingQueue = state.pendingQueue.filter(i => i._id !== tempId);
                    const index = state.items.findIndex(i => i._id === tempId);
                    if (index !== -1) {
                        state.items[index] = realItem;
                    }
                });
                saveToStorage(state.items, state.pendingQueue);
            })
            // Budgets
            .addCase(fetchBudgets.fulfilled, (state, action) => {
                state.budgets = action.payload;
            })
            .addCase(setBudget.fulfilled, (state, action) => {
                // Upsert logic for local state
                const index = state.budgets.findIndex(b => b.category === action.payload.category);
                if (index !== -1) {
                    state.budgets[index] = action.payload;
                } else {
                    state.budgets.push(action.payload);
                }
            });
    },
});

export default expensesSlice.reducer;
