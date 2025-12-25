import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories, fetchBudgets, setBudget } from '../store/expensesSlice';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function BudgetScreen({ navigation }) {
    const dispatch = useDispatch();
    const { categories, budgets } = useSelector((state) => state.expenses);

    // Local state for edits
    const [localBudgets, setLocalBudgets] = useState({});
    const [isGlobalBudget, setIsGlobalBudget] = useState(false);
    const [globalLimit, setGlobalLimit] = useState('');

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchBudgets());
    }, []);

    // Load existing budgets into local state
    useEffect(() => {
        const initialMap = {};
        budgets.forEach(b => {
            if (b.category === 'GLOBAL') {
                setIsGlobalBudget(true);
                setGlobalLimit(b.limit.toString());
            } else {
                initialMap[b.category] = b.limit.toString();
            }
        });
        setLocalBudgets(initialMap);
    }, [budgets]);

    const handleInput = (catName, text) => {
        setLocalBudgets(prev => ({
            ...prev,
            [catName]: text
        }));
    };

    const handleSave = async () => {
        try {
            // Save Global
            if (isGlobalBudget && globalLimit) {
                await dispatch(setBudget({ category: 'GLOBAL', limit: parseFloat(globalLimit) })).unwrap();
            } else if (!isGlobalBudget && budgets.find(b => b.category === 'GLOBAL')) {
                // Logic to remove global budget could go here (e.g. set limit 0 or delete API)
            }

            // Save Categories
            const promises = Object.keys(localBudgets).map(catName => {
                const limit = parseFloat(localBudgets[catName]);
                if (!isNaN(limit) && limit > 0) {
                    return dispatch(setBudget({ category: catName, limit })).unwrap();
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
            Alert.alert('Success', 'Budgets updated successfully!');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', 'Failed to save budgets');
        }
    };

    return (
        <View className="flex-1 bg-[#F3EDF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="pt-14 px-5 pb-4 bg-white shadow-sm z-10">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#1D1B20" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-[#1D1B20]">Monthly Budgets</Text>
                </View>
                <Text className="text-gray-500 text-sm">Set spending limits to track progress and get alerts.</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                {/* Global Budget Toggle */}
                <View className="bg-[#6750A4] p-5 rounded-3xl mb-6 shadow-md shadow-purple-200">
                    <View className="flex-row justify-between items-center mb-2">
                        <View>
                            <Text className="text-white font-bold text-lg">Global Limit</Text>
                            <Text className="text-purple-200 text-xs">Cap total monthly spending</Text>
                        </View>
                        <Switch
                            value={isGlobalBudget}
                            onValueChange={setIsGlobalBudget}
                            trackColor={{ false: "#767577", true: "#EADDFF" }}
                            thumbColor={isGlobalBudget ? "#D0BCFF" : "#f4f3f4"}
                        />
                    </View>

                    {isGlobalBudget && (
                        <View className="mt-3 flex-row items-center bg-white/20 rounded-xl px-4 py-2">
                            <Text className="text-white text-xl mr-2">$</Text>
                            <TextInput
                                className="flex-1 text-white text-2xl font-bold"
                                placeholder="5000"
                                placeholderTextColor="#EADDFF"
                                keyboardType="numeric"
                                value={globalLimit}
                                onChangeText={setGlobalLimit}
                            />
                        </View>
                    )}
                </View>

                <Text className="text-lg font-bold text-[#1D1B20] mb-4">Category Limits</Text>

                {categories.map((item, index) => (
                    <Animated.View
                        key={item._id || index}
                        entering={FadeInDown.delay(index * 50).springify()}
                        className="bg-white p-4 rounded-2xl mb-3 flex-row items-center justify-between border border-gray-100 shadow-sm"
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                                <Ionicons name={item.icon || 'pricetag'} size={20} color="#6750A4" />
                            </View>
                            <Text className="text-base font-semibold text-[#1D1B20]">{item.name}</Text>
                        </View>

                        <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2 w-32 bg-gray-50">
                            <Text className="text-gray-500 mr-1">$</Text>
                            <TextInput
                                className="flex-1 text-base font-medium text-[#1D1B20]"
                                placeholder="0"
                                keyboardType="numeric"
                                value={localBudgets[item.name] || ''}
                                onChangeText={(text) => handleInput(item.name, text)}
                                maxLength={6}
                            />
                        </View>
                    </Animated.View>
                ))}

                <View className="h-24" />
            </ScrollView>

            {/* Save Button */}
            <View className="absolute bottom-10 left-4 right-4">
                <TouchableOpacity
                    className="bg-[#1D1B20] py-4 rounded-full items-center shadow-lg shadow-gray-400"
                    onPress={handleSave}
                >
                    <Text className="text-white font-bold text-lg">Save Budgets</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
