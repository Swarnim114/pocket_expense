import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addExpense, fetchCategories } from '../store/expensesSlice';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

// Default Defaults (in case DB is empty or just starting)
export const DEFAULT_EXPENSE_CATEGORIES = [
    { id: 'Food', icon: 'fast-food' },
    { id: 'Transport', icon: 'car' },
    { id: 'Rent', icon: 'home' },
    { id: 'Bills', icon: 'receipt' },
    { id: 'Shopping', icon: 'cart' },
    { id: 'Entertainment', icon: 'game-controller' },
    { id: 'Health', icon: 'medkit' },
    { id: 'Education', icon: 'school' },
    { id: 'Misc', icon: 'grid' },
];

export const DEFAULT_INCOME_CATEGORIES = [
    { id: 'Salary', icon: 'cash' },
    { id: 'Freelance', icon: 'briefcase' },
    { id: 'Investment', icon: 'trending-up' },
    { id: 'Gift', icon: 'gift' },
    { id: 'Sales', icon: 'pricetag' },
    { id: 'Other', icon: 'layers' },
];

export const CATEGORIES = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];

const PAYMENT_MODES = ['Cash', 'Card', 'UPI', 'Wallet', 'Bank', 'Other'];

export default function AddExpenseScreen({ navigation }) {
    const dispatch = useDispatch();
    const { categories: customCategories } = useSelector((state) => state.expenses);

    const [type, setType] = useState('expense'); // 'expense' | 'income'
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0].id);
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories());
    }, []);

    // Merge defaults with custom categories
    const availableCategories = type === 'expense'
        ? [...DEFAULT_EXPENSE_CATEGORIES, ...customCategories.filter(c => c.type === 'expense')]
        : [...DEFAULT_INCOME_CATEGORIES, ...customCategories.filter(c => c.type === 'income')];

    // Reset category when type changes
    useEffect(() => {
        if (availableCategories.length > 0) {
            setCategory(availableCategories[0].id || availableCategories[0].name);
        }
    }, [type]);

    const handleAdd = async () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter amount');
            return;
        }

        setIsLoading(true);
        const result = await dispatch(addExpense({
            type,
            amount: parseFloat(amount),
            category: category,
            note,
            paymentMethod,
            date: date.toISOString(),
        }));
        setIsLoading(false);

        if (addExpense.fulfilled.match(result)) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.goBack();
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to add transaction');
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS if needed, close on Android
        if (selectedDate) {
            setDate(selectedDate);
            if (Platform.OS === 'android') setShowDatePicker(false);
        } else {
            // Cancelled on Android
            if (Platform.OS === 'android') setShowDatePicker(false);
        }
    };

    const themeColor = type === 'expense' ? '#B3261E' : '#006C4C'; // Red vs Green
    const themeBg = type === 'expense' ? '#F9DEDC' : '#C4EED0';

    return (
        <View className="flex-1 bg-white">
            <StatusBar style={Platform.OS === 'ios' ? "light" : "dark"} />

            {/* Modal Header Handle (Visual cue) */}
            <View className="items-center pt-2">
                <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            <View className="pt-4 px-4 pb-2">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-[#1D1B20]">New Transaction</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-100 rounded-full">
                        <Ionicons name="close" size={24} color="#1D1B20" />
                    </TouchableOpacity>
                </View>

                {/* Type Toggle */}
                <View className="flex-row bg-[#F3F4F6] p-1 rounded-full mb-2">
                    <TouchableOpacity
                        onPress={() => { setType('expense'); Haptics.selectionAsync(); }}
                        className={`flex-1 py-3 rounded-full items-center ${type === 'expense' ? 'bg-[#B3261E] shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${type === 'expense' ? 'text-white' : 'text-[#49454F]'}`}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => { setType('income'); Haptics.selectionAsync(); }}
                        className={`flex-1 py-3 rounded-full items-center ${type === 'income' ? 'bg-[#006C4C] shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${type === 'income' ? 'text-white' : 'text-[#49454F]'}`}>Income</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>

                    <View className="space-y-6 mb-10">

                        {/* Amount Input */}
                        <View>
                            <Text className="text-xs font-bold mb-2 uppercase tracking-wider ml-1" style={{ color: themeColor }}>Amount</Text>
                            <View className="flex-row items-center bg-[#F3EDF7] rounded-2xl px-5 py-4 border border-transparent focus:border-gray-300">
                                <Text className="text-2xl font-bold text-[#49454F] mr-2">$</Text>
                                <TextInput
                                    className="flex-1 text-3xl font-bold text-[#1D1B20]"
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                    autoFocus // Frictionless: ready to type
                                />
                            </View>
                        </View>

                        {/* Category Grid */}
                        <View>
                            <Text className="text-xs font-bold mb-2 uppercase tracking-wider ml-1" style={{ color: themeColor }}>Category</Text>
                            <View className="flex-row flex-wrap justify-start -mx-1">
                                {availableCategories.map((cat) => {
                                    const catId = cat.id || cat.name;
                                    const isSelected = category === catId;
                                    return (
                                        <View key={cat._id || catId} className="w-[25%] p-1">
                                            <TouchableOpacity
                                                onPress={() => { setCategory(catId); Haptics.selectionAsync(); }}
                                                className={`aspect-square justify-center items-center rounded-2xl ${isSelected ? '' : 'bg-[#F3EDF7]'}`}
                                                style={isSelected ? { backgroundColor: themeBg, borderColor: themeColor, borderWidth: 2 } : {}}
                                            >
                                                <Ionicons name={cat.icon || 'pricetag'} size={24} color={isSelected ? themeColor : '#49454F'} />
                                                <Text
                                                    className={`text-[10px] mt-1 font-medium text-center`}
                                                    style={{ color: isSelected ? themeColor : '#49454F' }}
                                                    numberOfLines={1}
                                                >
                                                    {catId}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                                {/* Add Custom Category Button (Placeholder) */}
                                <View className="w-[25%] p-1">
                                    <TouchableOpacity className="aspect-square justify-center items-center rounded-2xl bg-[#F3EDF7] border border-dashed border-gray-400">
                                        <Ionicons name="add" size={24} color="#49454F" />
                                        <Text className="text-[10px] mt-1 font-medium text-[#49454F]">Add New</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Date Picker */}
                        <View>
                            <Text className="text-xs font-bold mb-2 uppercase tracking-wider ml-1" style={{ color: themeColor }}>Date</Text>

                            {Platform.OS === 'web' ? (
                                <View className="bg-[#F3EDF7] rounded-2xl px-5 py-4 overflow-hidden">
                                    <input
                                        type="date"
                                        value={date.toISOString().split('T')[0]}
                                        onChange={(e) => setDate(new Date(e.target.value))}
                                        style={{
                                            fontSize: 18,
                                            background: 'transparent',
                                            border: 'none',
                                            width: '100%',
                                            fontFamily: 'inherit',
                                            color: '#1D1B20'
                                        }}
                                    />
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={() => {
                                            console.log("Opening Date Picker");
                                            setShowDatePicker(true);
                                        }}
                                        className="flex-row items-center bg-[#F3EDF7] rounded-2xl px-5 py-4 active:bg-gray-200"
                                    >
                                        <Ionicons name="calendar-outline" size={24} color="#49454F" />
                                        <Text className="flex-1 ml-3 text-lg text-[#1D1B20]">
                                            {date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#49454F" />
                                    </TouchableOpacity>

                                    {showDatePicker && (
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={date}
                                            mode="date"
                                            is24Hour={true}
                                            display="default"
                                            onChange={onDateChange}
                                            maximumDate={new Date(2100, 11, 31)}
                                        />
                                    )}
                                </>
                            )}
                        </View>

                        {/* Payment Method */}
                        <View>
                            <Text className="text-xs font-bold mb-2 uppercase tracking-wider ml-1" style={{ color: themeColor }}>Payment Method</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                                <View className="flex-row gap-2">
                                    {PAYMENT_MODES.map((mode) => (
                                        <TouchableOpacity
                                            key={mode}
                                            onPress={() => { setPaymentMethod(mode); Haptics.selectionAsync(); }}
                                            className={`px-6 py-3 items-center rounded-xl border ${paymentMethod === mode ? `bg-[${themeBg}] border-[${themeColor}]` : 'bg-[#F3EDF7] border-transparent'}`}
                                            style={paymentMethod === mode ? { backgroundColor: themeBg, borderColor: themeColor } : {}}
                                        >
                                            <Text className={`font-bold ${paymentMethod === mode ? `text-[${themeColor}]` : 'text-[#49454F]'}`} style={paymentMethod === mode ? { color: themeColor } : {}}>{mode}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Note Input */}
                        <View>
                            <Text className="text-xs font-bold mb-2 uppercase tracking-wider ml-1" style={{ color: themeColor }}>Note (Optional)</Text>
                            <View className="flex-row items-start bg-[#F3EDF7] rounded-2xl px-5 py-4 h-24">
                                <Ionicons name="document-text-outline" size={24} color="#49454F" />
                                <TextInput
                                    className="flex-1 ml-3 text-lg text-[#1D1B20]"
                                    placeholder="Add details..."
                                    multiline
                                    textAlignVertical="top"
                                    value={note}
                                    onChangeText={setNote}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            className="w-full py-5 rounded-full items-center shadow-lg active:opacity-90 mt-4 mb-8"
                            style={{ backgroundColor: themeColor }}
                            onPress={handleAdd}
                            disabled={isLoading}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-xl">Save Transaction</Text>}
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
