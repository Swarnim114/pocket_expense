import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreToken } from '../store/authSlice';

// Components
import OfflineNotice from '../components/OfflineNotice';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import InsightsScreen from '../screens/InsightsScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
    );
}

function AppStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen
                name="AddExpense"
                component={AddExpenseScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen name="Insights" component={InsightsScreen} options={{ animation: 'slide_from_right' }} />
        </Stack.Navigator>
    )
}

export default function AppNavigator() {
    const { token, isLoading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        const bootstrapAsync = async () => {
            let userToken;
            try {
                userToken = await AsyncStorage.getItem('token');
            } catch (e) {
                // Restoring token failed
            }
            dispatch(restoreToken(userToken));
        };

        bootstrapAsync();
    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <View className="flex-1">
            <OfflineNotice />
            <NavigationContainer>
                {token ? <AppStack /> : <AuthStack />}
            </NavigationContainer>
        </View>
    );
}
