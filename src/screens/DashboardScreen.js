import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses, deleteExpense } from '../store/expensesSlice';
import { logout } from '../store/authSlice';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES } from './AddExpenseScreen';

export default function DashboardScreen({ navigation }) {
    const dispatch = useDispatch();
    const { items, isLoading } = useSelector((state) => state.expenses);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchExpenses());
    }, []);

    const handleDelete = (id) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        dispatch(deleteExpense(id));
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const getCategoryIcon = (catId) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        return cat ? cat.icon : 'pricetag';
    };

    // Subtler, cleaner colors for the list icons
    const getCategoryStyles = (catId) => {
        const styles = {
            'Food': { bg: '#FFEDD5', icon: '#F97316' }, // Orange
            'Transport': { bg: '#E0E7FF', icon: '#4F46E5' }, // Indigo
            'Shopping': { bg: '#FCE7F3', icon: '#EC4899' }, // Pink
            'Bills': { bg: '#FEF3C7', icon: '#D97706' }, // Amber
            'Entertainment': { bg: '#DBEAFE', icon: '#3B82F6' }, // Blue
            'Health': { bg: '#D1FAE5', icon: '#10B981' }, // Emerald
            'Education': { bg: '#F3E8FF', icon: '#9333EA' }, // Purple
            // Income
            'Salary': { bg: '#DCFCE7', icon: '#16A34A' }, // Green
            'Freelance': { bg: '#F3E8FF', icon: '#9333EA' },
            'Investment': { bg: '#CFFAFE', icon: '#06B6D4' }, // Cyan
        };
        return styles[catId] || { bg: '#F3F4F6', icon: '#6B7280' }; // Gray default
    };

    // Calculate Metrics
    const { totalIncome, totalExpense, balance, dailyAverage, topCategory } = useMemo(() => {
        const income = items.filter(i => i.type === 'income').reduce((acc, i) => acc + i.amount, 0);
        const expenseItems = items.filter(i => i.type === 'expense' || !i.type);
        const expense = expenseItems.reduce((acc, i) => acc + i.amount, 0);

        // Daily Average
        const dates = new Set(expenseItems.map(i => new Date(i.date).toDateString()));
        const daysCount = dates.size || 1;
        const avg = expense / daysCount;

        // Top Category
        const catTotals = {};
        expenseItems.forEach(i => {
            const cat = i.category || 'Uncategorized';
            catTotals[cat] = (catTotals[cat] || 0) + i.amount;
        });
        const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

        return {
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense,
            dailyAverage: avg,
            topCategory: topCat ? { name: topCat[0], amount: topCat[1] } : null
        };
    }, [items]);


    const renderItem = ({ item, index }) => {
        const isIncome = item.type === 'income';
        const { bg, icon } = getCategoryStyles(item.category);

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100).springify()}
                layout={Layout.springify()}
            >
                <View className="bg-white rounded-[20px] p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between">
                    {/* Left Side: Icon + Text */}
                    <View className="flex-row items-center flex-1">
                        <View
                            className="w-12 h-12 rounded-2xl justify-center items-center mr-4"
                            style={{ backgroundColor: bg }}
                        >
                            <Ionicons name={getCategoryIcon(item.category)} size={22} color={icon} />
                        </View>

                        <View>
                            <Text className="text-[#1F2937] font-bold text-base mb-0.5">
                                {item.category} <Text className="text-xs font-normal text-red-500">{item.isOffline ? '[OFF]' : ''}</Text>
                            </Text>
                            <Text className="text-gray-400 text-xs font-medium">
                                {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                    </View>

                    {/* Right Side: Amount + Trash */}
                    <View className="flex-row items-center">
                        <Text className={`font-bold text-lg mr-3 ${isIncome ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {isIncome ? '+' : '-'}${item.amount}
                        </Text>
                        <TouchableOpacity onPress={() => handleDelete(item._id)} className="p-2 bg-gray-50 rounded-full active:bg-red-50">
                            <Ionicons name="trash-outline" size={18} color="#EF4444" opacity={0.8} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <View className="flex-1 bg-[#FFF7ED]">
            <StatusBar style="dark" />

            {/* Header / Gradient Card */}
            <View className="pt-14 px-5 pb-2">
                {/* Top Bar */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-gray-500 font-medium text-sm">Welcome Back,</Text>
                        <Text className="text-2xl font-bold text-[#1F2937]">Dashboard</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} className="bg-white p-2 rounded-full border border-gray-100 shadow-sm">
                        <Ionicons name="log-out-outline" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Main Balance Card */}
                <LinearGradient
                    colors={['#8B5CF6', '#EC4899', '#FB923C']} // Purple -> Pink -> Orange
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-[32px] p-6 shadow-xl shadow-indigo-200 mb-6"
                    style={{ minHeight: 160 }}
                >
                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <Text className="text-white/80 font-medium text-sm mb-1">Total Balance</Text>
                            <Text className="text-white text-4xl font-bold">${balance.toFixed(2)}</Text>
                        </View>
                        <View className="bg-white/20 p-2 rounded-full">
                            <Ionicons name="wallet-outline" size={24} color="white" />
                        </View>
                    </View>

                    <View className="flex-row justify-between">
                        <View>
                            <Text className="text-white/70 text-[10px] font-bold uppercase mb-1">Income</Text>
                            <Text className="text-white font-bold text-lg">+${totalIncome}</Text>
                        </View>
                        <View className="h-full w-[1px] bg-white/20 mx-4" />
                        <View>
                            <Text className="text-white/70 text-[10px] font-bold uppercase mb-1">Expenses</Text>
                            <Text className="text-white font-bold text-lg">-${totalExpense}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Metrics Row */}
                <View className="flex-row justify-between mb-2">
                    {/* Daily Avg */}
                    <View className="bg-white rounded-[24px] p-4 flex-1 mr-2 shadow-sm border border-gray-50">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="speedometer-outline" size={18} color="#8B5CF6" className="mr-2" />
                            <Text className="text-gray-400 text-xs font-bold uppercase ml-2">Daily Avg</Text>
                        </View>
                        <Text className="text-[#1F2937] text-xl font-bold">${dailyAverage.toFixed(0)}</Text>
                    </View>

                    {/* Top Category */}
                    <View className="bg-white rounded-[24px] p-4 flex-1 ml-2 shadow-sm border border-gray-50">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="flame-outline" size={18} color="#EC4899" className="mr-2" />
                            <Text className="text-gray-400 text-xs font-bold uppercase ml-2">Top Spend</Text>
                        </View>
                        <Text className="text-[#1F2937] text-xl font-bold" numberOfLines={1}>{topCategory ? topCategory.name : '-'}</Text>
                        <Text className="text-gray-400 text-xs">${topCategory ? topCategory.amount : 0}</Text>
                    </View>
                </View>

            </View>

            {/* Transactions Section */}
            <View className="flex-1 bg-white rounded-t-[40px] px-6 pt-6 mt-2 shadow-sm">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-[#1F2937]">Transactions</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Insights')} className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center">
                        <Text className="text-[#8B5CF6] font-bold text-xs mr-1">Full Analytics</Text>
                        <Ionicons name="arrow-forward" size={12} color="#8B5CF6" />
                    </TouchableOpacity>
                </View>

                {items.length === 0 && !isLoading ? (
                    <View className="flex-1 justify-center items-center opacity-50 pb-20">
                        <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-400 font-medium mt-4">No transactions yet</Text>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchExpenses())} colors={['#8B5CF6']} />
                        }
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}
            </View>

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-10 right-8 bg-[#8B5CF6] w-16 h-16 rounded-full justify-center items-center shadow-xl shadow-purple-300 active:scale-95 transition-transform"
                onPress={() => {
                    Haptics.selectionAsync();
                    navigation.navigate('AddExpense');
                }}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
}
