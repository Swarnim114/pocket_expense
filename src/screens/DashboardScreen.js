import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses, deleteExpense } from '../store/expensesSlice';
import { logout } from '../store/authSlice';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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

    const renderItem = ({ item, index }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
            className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm flex-row justify-between items-center"
        >
            <View className="flex-1">
                <Text className="text-xl font-bold text-[#1D1B20]">{item.category}</Text>
                <Text className="text-gray-500 text-sm mt-1">{new Date(item.date).toLocaleDateString()}</Text>
                {item.note ? <Text className="text-gray-400 text-xs mt-1">{item.note}</Text> : null}
            </View>
            <View className="items-end">
                <Text className="text-xl font-bold text-[#6750A4] mb-2">${item.amount}</Text>
                <TouchableOpacity onPress={() => handleDelete(item._id)} className="p-2">
                    <Ionicons name="trash-outline" size={20} color="#B3261E" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <View className="flex-1 bg-[#F3EDF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="pt-16 pb-6 px-6 bg-[#EADDFF] rounded-b-[40px] shadow-sm flex-row justify-between items-center z-10">
                <View>
                    <Text className="text-gray-600 font-medium text-lg">Hello,</Text>
                    <Text className="text-3xl font-bold text-[#21005D]">{user?.username || 'User'}</Text>
                </View>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.navigate('Insights')} className="bg-white p-3 rounded-full mr-3 shadow-sm active:scale-90 transition-transform">
                        <Ionicons name="pie-chart-outline" size={24} color="#6750A4" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} className="bg-white p-3 rounded-full shadow-sm active:scale-90 transition-transform">
                        <Ionicons name="log-out-outline" size={24} color="#6750A4" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View className="flex-1 px-4 mt-6">
                <View className="flex-row justify-between items-center mb-4 px-2">
                    <Text className="text-2xl font-bold text-[#1D1B20]">Your Expenses</Text>
                    <View className="bg-[#E8DEF8] px-3 py-1 rounded-full">
                        <Text className="text-[#1D1B20] font-bold text-xs">{items.length} Total</Text>
                    </View>
                </View>

                {items.length === 0 && !isLoading ? (
                    <Animated.View entering={FadeInDown.springify()} className="flex-1 justify-center items-center opacity-70 pb-20">
                        <View className="bg-[#EADDFF] p-6 rounded-full mb-4 shadow-sm">
                            <Ionicons name="receipt-outline" size={64} color="#21005D" />
                        </View>
                        <Text className="text-[#1D1B20] text-xl font-bold">No expenses yet</Text>
                        <Text className="text-gray-500 mt-2 text-center px-10">Start tracking your spending by tapping the + button below.</Text>
                    </Animated.View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={() => dispatch(fetchExpenses())} colors={['#6750A4']} />
                        }
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}
            </View>

            {/* FAB (Floating Action Button) */}
            <TouchableOpacity
                className="absolute bottom-8 right-8 bg-[#6750A4] w-16 h-16 rounded-2xl justify-center items-center shadow-xl shadow-indigo-300 active:scale-90 transition-transform"
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
