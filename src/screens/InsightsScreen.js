import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { PieChart } from 'react-native-chart-kit';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Lavender/Purple Palette for Chart
const CHART_COLORS = [
    '#6750A4', // Primary Purple
    '#E8DEF8', // Light Lavender
    '#21005D', // Dark Violet
    '#7D5260', // Rose
    '#B3261E', // Error/Red (for contrast)
    '#EA80FC', // Bright Pink
];

export default function InsightsScreen({ navigation }) {
    const { items } = useSelector((state) => state.expenses);

    // Aggregate Data
    const chartData = useMemo(() => {
        const categoryTotals = {};
        let totalSpent = 0;

        items.forEach(item => {
            const amount = parseFloat(item.amount);
            const cat = item.category || 'Uncategorized';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
            totalSpent += amount;
        });

        const data = Object.keys(categoryTotals).map((cat, index) => ({
            name: cat,
            population: categoryTotals[cat],
            color: CHART_COLORS[index % CHART_COLORS.length],
            legendFontColor: '#49454F',
            legendFontSize: 12,
        }));

        return { data, totalSpent };
    }, [items]);

    return (
        <View className="flex-1 bg-[#F3EDF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="pt-14 px-4 pb-4 bg-[#F3EDF7] flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#1D1B20" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-[#1D1B20]">Spending Insights</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Summary Card */}
                <View className="bg-[#EADDFF] rounded-3xl p-6 mb-6 items-center shadow-sm">
                    <Text className="text-[#21005D] text-lg font-medium mb-1">Total Spending</Text>
                    <Text className="text-4xl font-bold text-[#6750A4]">${chartData.totalSpent.toFixed(2)}</Text>
                </View>

                {chartData.data.length > 0 ? (
                    <View className="bg-white rounded-[32px] p-4 shadow-sm items-center">
                        <Text className="text-lg font-bold text-[#1D1B20] mb-4 self-start ml-4 mt-2">Breakdown by Category</Text>

                        <PieChart
                            data={chartData.data}
                            width={SCREEN_WIDTH - 64}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(103, 80, 164, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            center={[20, 0]}
                        />
                    </View>
                ) : (
                    <View className="items-center mt-10 opacity-50">
                        <Ionicons name="pie-chart-outline" size={64} color="#49454F" />
                        <Text className="text-[#49454F] mt-4 font-medium">No expenses to visualize yet.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
