import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../constants/theme';
import { authAPI } from '../services/api';
import { User } from '../types';

interface RegisterScreenProps {
    navigation: any;
    onLogin: (user: User) => void;
}

export default function RegisterScreen({ navigation, onLogin }: RegisterScreenProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.register({ name, email, password, phone });
            const { accessToken, refreshToken, user } = response.data;

            // Store tokens
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            Alert.alert('Success', 'Account created successfully!');
            onLogin(user);
        } catch (error: any) {
            Alert.alert(
                'Registration Failed',
                error.response?.data?.message || 'Something went wrong. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.logo}>SafeBeacon</Text>
                    <Text style={styles.tagline}>🚨 Join the Safety Network</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor={COLORS.mutedText}
                            value={name}
                            onChangeText={setName}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.mutedText}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your phone number"
                            placeholderTextColor={COLORS.mutedText}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a password (min 6 characters)"
                            placeholderTextColor={COLORS.mutedText}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.black} />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                        disabled={loading}
                    >
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginTextBold}>Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SIZES.padding * 1.5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.neonGreen,
        textShadowColor: COLORS.neonGreen,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
        marginBottom: 8,
    },
    tagline: {
        fontSize: SIZES.body,
        color: COLORS.lightText,
    },
    form: {
        backgroundColor: COLORS.mediumGray,
        borderRadius: SIZES.radius * 2,
        padding: SIZES.padding * 2,
        borderWidth: 1,
        borderColor: COLORS.neonGreen,
    },
    title: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.mutedText,
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: SIZES.small,
        color: COLORS.limeGreen,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.darkGray,
        borderRadius: SIZES.radius,
        padding: 16,
        fontSize: SIZES.body,
        color: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    button: {
        backgroundColor: COLORS.neonGreen,
        borderRadius: SIZES.radius,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: COLORS.neonGreen,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    loginLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    loginText: {
        fontSize: SIZES.body,
        color: COLORS.mutedText,
    },
    loginTextBold: {
        color: COLORS.neonGreen,
        fontWeight: 'bold',
    },
});
