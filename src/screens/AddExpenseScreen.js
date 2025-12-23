import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addExpense } from '../store/expensesSlice';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

const CATEGORIES = [
    { id: 'Food', icon: 'fast-food' },
    { id: 'Transport', icon: 'car' },
    { id: 'Shopping', icon: 'cart' },
    { id: 'Bills', icon: 'receipt' },
    { id: 'Entertainment', icon: 'game-controller' },
    { id: 'Health', icon: 'medkit' },
    { id: 'Education', icon: 'school' },
    { id: 'Others', icon: 'grid' },
];

const PAYMENT_MODES = ['Cash', 'Card', 'Online'];

export default function AddExpenseScreen({ navigation }) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0].id);
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();

    const handleAdd = async () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter amount');
            return;
        }

        setIsLoading(true);
        const result = await dispatch(addExpense({
            amount: parseFloat(amount),
            category,
            note,
            paymentMethod,
            date: date.toISOString(),
        }));
        setIsLoading(false);

        if (addExpense.fulfilled.match(result)) {
            navigation.goBack();
        } else {
            Alert.alert('Error', 'Failed to add expense');
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    return (
        <View className="flex-1 bg-[#F3EDF7]">
            <StatusBar style="dark" />
            <View className="pt-14 px-4 pb-4 bg-[#F3EDF7]">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center mb-4">
                    <Ionicons name="arrow-back" size={24} color="#1D1B20" />
                    <Text className="text-lg font-bold ml-2">Back</Text>
                </TouchableOpacity>
                <Text className="text-4xl font-bold text-[#1D1B20] px-2">New Expense</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-4">

                    <View className="bg-white rounded-[32px] p-6 shadow-sm space-y-6 mb-10">

                        {/* Amount Input */}
                        <View>
                            <Text className="text-xs font-bold text-[#6750A4] mb-2 uppercase tracking-wider ml-1">Amount</Text>
                            <View className="flex-row items-center bg-[#F3EDF7] rounded-2xl px-5 py-4">
                                <Text className="text-2xl font-bold text-[#49454F] mr-2">$</Text>
                                <TextInput
                                    className="flex-1 text-3xl font-bold text-[#1D1B20]"
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                            </View>
                        </View>

                        {/* Date Picker */}
                        <View>
                            <Text className="text-xs font-bold text-[#6750A4] mb-2 uppercase tracking-wider ml-1">Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center bg-[#F3EDF7] rounded-2xl px-5 py-4">
                                <Ionicons name="calendar-outline" size={24} color="#49454F" />
                                <Text className="flex-1 ml-3 text-lg text-[#1D1B20]">{date.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                />
                            )}
                        </View>

                        {/* Category Grid */}
                        <View>
                            <Text className="text-xs font-bold text-[#6750A4] mb-2 uppercase tracking-wider ml-1">Category</Text>
                            <View className="flex-row flex-wrap justify-between">
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => setCategory(cat.id)}
                                        className={`w-[23%] aspect-square justify-center items-center rounded-2xl mb-3 ${category === cat.id ? 'bg-[#E8DEF8] border-2 border-[#6750A4]' : 'bg-[#F3EDF7]'}`}
                                    >
                                        <Ionicons name={cat.icon} size={24} color={category === cat.id ? '#1D1B20' : '#49454F'} />
                                        <Text className={`text-[10px] mt-1 font-medium ${category === cat.id ? 'text-[#1D1B20]' : 'text-[#49454F]'}`}>{cat.id}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Payment Method */}
                        <View>
                            <Text className="text-xs font-bold text-[#6750A4] mb-2 uppercase tracking-wider ml-1">Payment Method</Text>
                            <View className="flex-row bg-[#F3EDF7] rounded-2xl p-1">
                                {PAYMENT_MODES.map((mode) => (
                                    <TouchableOpacity
                                        key={mode}
                                        onPress={() => setPaymentMethod(mode)}
                                        className={`flex-1 py-3 items-center rounded-xl ${paymentMethod === mode ? 'bg-white shadow-sm' : ''}`}
                                    >
                                        <Text className={`font-bold ${paymentMethod === mode ? 'text-[#6750A4]' : 'text-[#49454F]'}`}>{mode}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Note Input */}
                        <View>
                            <Text className="text-xs font-bold text-[#6750A4] mb-2 uppercase tracking-wider ml-1">Note (Optional)</Text>
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
                            className="w-full bg-[#6750A4] py-5 rounded-full items-center shadow-lg active:bg-[#523A7E] mt-4"
                            onPress={handleAdd}
                            disabled={isLoading}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-xl">Save Expense</Text>}
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
