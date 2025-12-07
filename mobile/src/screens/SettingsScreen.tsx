import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { User } from '../types';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface SettingsScreenProps {
    user: User | null;
    onLogout: () => void;
}

export default function SettingsScreen({ user, onLogout }: SettingsScreenProps) {

    const handleLogoutPress = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: onLogout }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    {user?.profilePicture ? (
                        <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
                    ) : (
                        <View style={styles.placeholderAvatar}>
                            <Text style={styles.initials}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>

                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Watcher Code</Text>
                    <Text style={styles.codeValue}>{user?.guardianCode || '------'}</Text>
                </View>
            </View>

            <View style={styles.menuSection}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.versionText}>SafeBeacon v1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
        padding: SIZES.padding,
    },
    header: {
        marginTop: 40,
        marginBottom: 30,
    },
    title: {
        color: COLORS.white,
        fontSize: SIZES.h1,
        fontWeight: 'bold',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    avatarContainer: {
        marginBottom: 15,
        shadowColor: COLORS.neonGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: COLORS.neonGreen,
    },
    placeholderAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.mediumGray,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.neonGreen,
    },
    initials: {
        color: COLORS.neonGreen,
        fontSize: 36,
        fontWeight: 'bold',
    },
    userName: {
        color: COLORS.white,
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userEmail: {
        color: COLORS.mutedText,
        fontSize: SIZES.body,
        marginBottom: 20,
    },
    codeContainer: {
        backgroundColor: COLORS.black,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.neonGreen,
    },
    codeLabel: {
        color: COLORS.mutedText,
        fontSize: SIZES.tiny,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    codeValue: {
        color: COLORS.neonGreen,
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    menuSection: {
        flex: 1,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red with opacity
        padding: 15,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    logoutText: {
        color: COLORS.danger,
        fontSize: SIZES.body,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    versionText: {
        color: COLORS.mutedText,
        fontSize: SIZES.tiny,
    },
});
