import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { generateSmartInsight } from '../utils/insights';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Custom Palette
const CHART_COLORS = [
    '#6750A4', // Purple
    '#B58392', // Muted Pink
    '#21005D', // Dark Purple
    '#D0BCFF', // Light Purple
    '#B3261E', // Red
    '#EA80FC', // Neon Pink
    '#006C4C', // Green
];

export default function InsightsScreen({ navigation }) {
    const { items } = useSelector((state) => state.expenses);
    const [focusedPieIndex, setFocusedPieIndex] = useState(null);

    // Smart Insight
    const smartInsight = useMemo(() => generateSmartInsight(items), [items]);

    // Aggregate Data
    const { pieData, totalSpent, dailyAverage, weeklyData, topCategory, maxWeeklyValue } = useMemo(() => {
        const categoryTotals = {};
        const dailyTotals = {};
        let total = 0;

        // Filter for Expense only
        const expenses = items.filter(i => i.type === 'expense' || !i.type);

        expenses.forEach(item => {
            const amount = parseFloat(item.amount);
            const date = new Date(item.date);
            const dateStr = date.toISOString().split('T')[0];
            const cat = item.category || 'Uncategorized';

            // Category Totals
            categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;

            // Daily Totals
            dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + amount;

            total += amount;
        });

        // 1. Pie Chart Configuration
        const sortedCategories = Object.keys(categoryTotals)
            .sort((a, b) => categoryTotals[b] - categoryTotals[a]);

        const pieChartData = sortedCategories.map((cat, index) => ({
            value: categoryTotals[cat],
            color: CHART_COLORS[index % CHART_COLORS.length],
            text: `${Math.round((categoryTotals[cat] / total) * 100)}%`,
            catName: cat,
            amount: categoryTotals[cat],
            focused: focusedPieIndex === index,
            onPress: () => setFocusedPieIndex(index === focusedPieIndex ? null : index),
        }));

        // 2. Bar Chart Configuration (Last 7 Days)
        const barChartData = [];
        const today = new Date();
        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        let maxVal = 0;

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            const dayIndex = d.getDay();
            const isToday = i === 0;
            const val = dailyTotals[dStr] || 0;
            if (val > maxVal) maxVal = val;

            barChartData.push({
                value: val,
                label: dayNames[dayIndex],
                frontColor: isToday ? '#6750A4' : '#E8DEF8',
                spacing: 14,
                labelTextStyle: { color: '#9CA3AF', fontSize: 12 },
                topLabelComponent: () => (
                    val > 0 ? <Text style={{ color: '#6750A4', fontSize: 10, marginBottom: 4 }}>${Math.round(val)}</Text> : null
                )
            });
        }

        const daysCount = Object.keys(dailyTotals).length || 1;
        const avg = total / daysCount;
        const topCat = sortedCategories.length > 0 ? sortedCategories[0] : '-';

        return {
            pieData: pieChartData,
            totalSpent: total,
            dailyAverage: avg,
            weeklyData: barChartData,
            topCategory: topCat,
            maxWeeklyValue: maxVal
        };
    }, [items, focusedPieIndex]);

    // Get currently focused details
    const focusedCategory = useMemo(() => {
        if (focusedPieIndex !== null && pieData[focusedPieIndex]) {
            return pieData[focusedPieIndex];
        }
        return null; // Return null if nothing is focused (default state)
    }, [pieData, focusedPieIndex]);

    // Default to displaying top category if nothing focused
    const displayCategoryName = focusedCategory ? focusedCategory.catName : topCategory;
    // Calculate amount to display
    const displayAmount = focusedCategory
        ? focusedCategory.amount
        : (pieData.length > 0 ? pieData[0].amount : 0);

    const displayLabel = focusedCategory ? 'SELECTED' : 'TOP';

    return (
        <View className="flex-1 bg-[#F3EDF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="pt-14 px-5 pb-4 bg-[#F3EDF7] flex-row items-center justify-between z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-3 bg-white rounded-full shadow-sm">
                        <Ionicons name="arrow-back" size={24} color="#1D1B20" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-[#1D1B20]">Analytics</Text>
                </View>
                <TouchableOpacity className="p-3 bg-white rounded-full shadow-sm">
                    <Ionicons name="options-outline" size={24} color="#49454F" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Smart Insight Card */}
                {smartInsight && (
                    <Animated.View entering={FadeInDown.delay(50).springify()} className="mb-5 shadow-sm shadow-gray-200">
                        <LinearGradient
                            colors={
                                smartInsight.type === 'warning' ? ['#FFEDD5', '#FFF7ED'] :
                                    smartInsight.type === 'success' ? ['#DCFCE7', '#F0FDF4'] :
                                        ['#E0E7FF', '#EEF2FF']
                            }
                            className="p-5 rounded-[32px] border border-white"
                        >
                            <View className="flex-row items-start">
                                <View className={`p-3 rounded-full mr-4 ${smartInsight.type === 'warning' ? 'bg-orange-100' :
                                    smartInsight.type === 'success' ? 'bg-green-100' :
                                        'bg-indigo-100'
                                    }`}>
                                    <Ionicons
                                        name={
                                            smartInsight.type === 'warning' ? 'warning-outline' :
                                                smartInsight.type === 'success' ? 'trophy-outline' :
                                                    'bulb-outline'
                                        }
                                        size={24}
                                        color={
                                            smartInsight.type === 'warning' ? '#EA580C' :
                                                smartInsight.type === 'success' ? '#16A34A' :
                                                    '#4F46E5'
                                        }
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-xs font-bold uppercase tracking-wider mb-1 ${smartInsight.type === 'warning' ? 'text-orange-600' :
                                        smartInsight.type === 'success' ? 'text-green-600' :
                                            'text-indigo-600'
                                        }`}>
                                        {smartInsight.title}
                                    </Text>
                                    <Text className="text-[#1F2937] font-bold text-lg leading-6 mb-1">
                                        {smartInsight.message}
                                    </Text>
                                    <Text className="text-gray-500 text-sm">
                                        {smartInsight.detail}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Total Spent Card */}
                <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-5">
                    <View className="bg-[#6750A4] rounded-[32px] p-5 shadow-lg shadow-purple-200">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
                                <Ionicons name="wallet-outline" size={20} color="#E9D5FF" />
                            </View>
                            <Text className="text-[#E9D5FF] text-xs font-bold uppercase tracking-wider">Total Spent</Text>
                        </View>
                        <Text className="text-white text-5xl font-bold tracking-tighter">${totalSpent.toFixed(0)}</Text>
                        <Text className="text-purple-200 text-xs mt-1">Total expenses for this period</Text>
                    </View>
                </Animated.View>

                {/* Daily Avg Card */}
                <Animated.View entering={FadeInDown.delay(150).springify()} className="mb-5">
                    <View className="bg-[#FFD8E4] rounded-[32px] p-5 shadow-sm shadow-pink-100">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 bg-white/40 rounded-full items-center justify-center mr-3">
                                <Ionicons name="trending-up" size={20} color="#6750A4" />
                            </View>
                            <Text className="text-[#6750A4] text-xs font-bold uppercase tracking-wider">Daily Avg</Text>
                        </View>
                        <Text className="text-[#1D1B20] text-5xl font-bold tracking-tighter">${dailyAverage.toFixed(0)}</Text>
                        <Text className="text-purple-900/60 text-xs mt-1">Average daily spending</Text>
                    </View>
                </Animated.View>

                {items.length > 0 ? (
                    <>
                        {/* Weekly Activity Chart - BAR CHART */}
                        <Animated.View entering={FadeInDown.delay(200).springify()} className="bg-white rounded-[32px] p-5 mb-5 shadow-sm overflow-hidden">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-lg font-bold text-[#1D1B20]">Weekly Activity</Text>
                                <View className="bg-purple-50 px-2 py-1 rounded-lg">
                                    <Text className="text-purple-700 text-xs font-bold">Last 7 Days</Text>
                                </View>
                            </View>

                            <View style={{ alignItems: 'center', paddingRight: 20 }}>
                                <BarChart
                                    data={weeklyData}
                                    barWidth={22}
                                    noOfSections={3}
                                    barBorderRadius={6}
                                    frontColor="#E8DEF8"
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    hideRules
                                    isAnimated
                                    animationDuration={1000}
                                    width={SCREEN_WIDTH - 80} // Adjusted width
                                    height={180}
                                    maxValue={maxWeeklyValue > 0 ? maxWeeklyValue * 1.2 : 100} // Add headroom
                                    yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
                                />
                            </View>
                        </Animated.View>

                        {/* Category Breakdown - PIE CHART */}
                        <Animated.View entering={FadeInDown.delay(300).springify()} className="bg-white rounded-[32px] p-5 shadow-sm mb-5">
                            <Text className="text-lg font-bold text-[#1D1B20] mb-6">By Category</Text>

                            <View className="items-center mb-8 relative">
                                <PieChart
                                    data={pieData}
                                    donut
                                    radius={130}
                                    innerRadius={75}
                                    showText={false}
                                    focusOnPress
                                    toggleFocusOnPress
                                    sectionAutoFocus
                                    isAnimated
                                    animationDuration={1000}
                                    centerLabelComponent={() => (
                                        <View className="justify-center items-center p-2">
                                            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
                                                {displayLabel}
                                            </Text>
                                            <Text className="text-[#1D1B20] text-lg font-bold text-center" numberOfLines={1}>
                                                {displayCategoryName}
                                            </Text>
                                            <Text className="text-[#6750A4] text-sm font-bold mt-1">
                                                ${displayAmount.toFixed(0)}
                                            </Text>
                                        </View>
                                    )}
                                />
                                {!focusedCategory && (
                                    <View className="absolute bottom-[-20px]">
                                        <Text className="text-gray-400 text-[10px] italic">Tap segments for details</Text>
                                    </View>
                                )}
                            </View>

                            {/* Legend */}
                            {pieData.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setFocusedPieIndex(index === focusedPieIndex ? null : index)}
                                    className={`flex-row items-center justify-between py-3 border-b border-gray-50 last:border-0 ${focusedPieIndex === index ? 'bg-purple-50 -mx-5 px-5' : ''}`}
                                >
                                    <View className="flex-row items-center">
                                        <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                                        <Text className={`font-medium ${focusedPieIndex === index ? 'text-[#6750A4] font-bold' : 'text-[#49454F]'}`}>
                                            {item.catName}
                                        </Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className={`font-bold ${focusedPieIndex === index ? 'text-[#6750A4]' : 'text-[#1D1B20]'}`}>
                                            ${item.amount.toFixed(0)}
                                        </Text>
                                        <Text className="text-gray-400 text-[10px]">{item.text}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </Animated.View>
                    </>
                ) : (
                    <View className="items-center mt-20 opacity-40">
                        <Ionicons name="bar-chart" size={80} color="#49454F" />
                        <Text className="text-[#49454F] mt-4 font-bold text-lg">No Data Available</Text>
                        <Text className="text-[#49454F] text-center w-64 mt-2">Add some expenses to see your analytics come to life.</Text>
                    </View>
                )}

            </ScrollView>
        </View>
    );
}
