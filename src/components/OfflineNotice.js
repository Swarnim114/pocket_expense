import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch, useSelector } from 'react-redux';
import { syncPendingExpenses } from '../store/expensesSlice';

export default function OfflineNotice() {
    const dispatch = useDispatch();
    const { pendingQueue } = useSelector((state) => state.expenses);
    const [isConnected, setIsConnected] = React.useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);

            if (state.isConnected && pendingQueue.length > 0) {
                dispatch(syncPendingExpenses());
            }
        });

        return () => unsubscribe();
    }, [pendingQueue]);

    if (isConnected) return null;

    return (
        <View className="bg-[#B3261E] py-2 px-4 shadow-md">
            <Text className="text-white text-center font-bold text-xs">
                No Internet Connection. Changes will save offline.
            </Text>
        </View>
    );
}
