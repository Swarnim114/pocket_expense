import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../store/authSlice';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const validate = () => {
        let isValid = true;
        if (!username) { setUsernameError('Username is required'); isValid = false; } else { setUsernameError(''); }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) { setEmailError('Email is required'); isValid = false; }
        else if (!emailRegex.test(email)) { setEmailError('Invalid email format'); isValid = false; }
        else { setEmailError(''); }

        if (!password) { setPasswordError('Password is required'); isValid = false; }
        else if (password.length < 8) { setPasswordError('Password must be 8+ chars'); isValid = false; }
        else { setPasswordError(''); }

        return isValid;
    };

    const handleSignup = async () => {
        if (!validate()) return;
        const resultAction = await dispatch(signup({ username, email, password }));
        if (!signup.fulfilled.match(resultAction)) {
            Alert.alert('Signup Failed', resultAction.payload?.msg || 'Network error');
        }
    };

    return (
        <View className="flex-1 bg-[#F3EDF7]">
            <StatusBar style="dark" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>

                    <View className="items-center mb-10">
                        <View className="bg-[#EADDFF] p-4 rounded-3xl mb-4">
                            <Ionicons name="person-add-outline" size={32} color="#21005D" />
                        </View>
                        <Text className="text-4xl font-bold text-[#1D1B20] text-center">Create Account</Text>
                        <Text className="text-[#49454F] text-base mt-2 text-center">Join us today.</Text>
                    </View>

                    <View className="space-y-4">
                        {/* Username */}
                        <View>
                            <View className={`flex-row items-center bg-white rounded-3xl px-5 py-4 border-2 transition-all ${isUsernameFocused ? 'border-[#6750A4]' : 'border-transparent'} ${usernameError ? 'border-[#B3261E] bg-[#F9DEDC]' : ''}`}>
                                <Ionicons name="person-outline" size={24} color={usernameError ? "#B3261E" : "#49454F"} />
                                <TextInput
                                    className="flex-1 ml-3 text-lg text-[#1D1B20]"
                                    placeholder="Username"
                                    placeholderTextColor="#49454F"
                                    value={username}
                                    onChangeText={(t) => { setUsername(t); setUsernameError(''); }}
                                    onFocus={() => setIsUsernameFocused(true)}
                                    onBlur={() => setIsUsernameFocused(false)}
                                    autoCapitalize="none"
                                />
                            </View>
                            {usernameError ? <Text className="text-[#B3261E] text-sm ml-4 mt-1 font-medium">{usernameError}</Text> : null}
                        </View>

                        {/* Email */}
                        <View>
                            <View className={`flex-row items-center bg-white rounded-3xl px-5 py-4 border-2 transition-all ${isEmailFocused ? 'border-[#6750A4]' : 'border-transparent'} ${emailError ? 'border-[#B3261E] bg-[#F9DEDC]' : ''}`}>
                                <Ionicons name="mail-outline" size={24} color={emailError ? "#B3261E" : "#49454F"} />
                                <TextInput
                                    className="flex-1 ml-3 text-lg text-[#1D1B20]"
                                    placeholder="Email Address"
                                    placeholderTextColor="#49454F"
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                                    onFocus={() => setIsEmailFocused(true)}
                                    onBlur={() => setIsEmailFocused(false)}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                            {emailError ? <Text className="text-[#B3261E] text-sm ml-4 mt-1 font-medium">{emailError}</Text> : null}
                        </View>

                        {/* Password */}
                        <View>
                            <View className={`flex-row items-center bg-white rounded-3xl px-5 py-4 border-2 ${isPasswordFocused ? 'border-[#6750A4]' : 'border-transparent'} ${passwordError ? 'border-[#B3261E] bg-[#F9DEDC]' : ''}`}>
                                <Ionicons name="lock-closed-outline" size={24} color={passwordError ? "#B3261E" : "#49454F"} />
                                <TextInput
                                    className="flex-1 ml-3 text-lg text-[#1D1B20]"
                                    placeholder="Password"
                                    placeholderTextColor="#49454F"
                                    value={password}
                                    onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    secureTextEntry
                                />
                            </View>
                            {passwordError ? <Text className="text-[#B3261E] text-sm ml-4 mt-1 font-medium">{passwordError}</Text> : null}
                        </View>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-[#6750A4] py-5 rounded-full items-center mt-8 shadow-sm active:bg-[#523A7E]"
                        onPress={handleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Sign Up</Text>}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-[#49454F] text-base">Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-[#6750A4] font-bold text-base">Log In</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
