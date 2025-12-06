import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { GuardianService } from '../services/GuardianService';
import { authAPI } from '../services/api';
import { User } from '../types';

export default function GuardianScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [guardians, setGuardians] = useState<any[]>([]);
    const [protecting, setProtecting] = useState<any[]>([]);
    const [tab, setTab] = useState<'guardians' | 'protecting'>('guardians');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const myGuardians = await GuardianService.getMyGuardians();
            console.log('Fetched guardians:', JSON.stringify(myGuardians));
            setGuardians(Array.isArray(myGuardians) ? myGuardians : []);

            const myProtecting = await GuardianService.getProtectingUsers();
            setProtecting(Array.isArray(myProtecting) ? myProtecting : []);
        } catch (error) {
            console.error('Error loading guardian data:', error);
        }

        try {
            const profile = await authAPI.getProfile();
            setCurrentUser(profile.data);
        } catch (error) {
            console.log('Error fetching profile:', error);
        }
    };

    const search = async () => {
        if (!searchQuery) return;
        try {
            const results = await GuardianService.searchUsers(searchQuery);
            setSearchResults(Array.isArray(results) ? results : []);
        } catch (error) {
            console.error('Search error details:', error);
            if (axios.isAxiosError(error)) {
                Alert.alert('Search Failed', error.response?.data?.message || error.message);
            } else {
                Alert.alert('Error', 'Failed to search users');
            }
        }
    };

    const addGuardian = async (id: number) => {
        try {
            await GuardianService.addGuardian(id);
            Alert.alert('Success', 'Guardian added');
            setSearchResults([]);
            setSearchQuery('');
            loadData();
        } catch (error) {
            Alert.alert('Error', 'Failed to add guardian');
        }
    };

    const removeGuardian = async (id: number) => {
        try {
            await GuardianService.removeGuardian(id);
            loadData();
        } catch (error) {
            Alert.alert('Error', 'Failed to remove guardian');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setTab('guardians')} style={[styles.tab, tab === 'guardians' && styles.activeTab]}>
                    <Text style={styles.tabText}>My Guardians</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTab('protecting')} style={[styles.tab, tab === 'protecting' && styles.activeTab]}>
                    <Text style={styles.tabText}>Protecting</Text>
                </TouchableOpacity>
            </View>

            {tab === 'guardians' && (
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Add Guardian</Text>
                    <View style={{ marginBottom: 15, padding: 15, backgroundColor: '#222', borderRadius: 8 }}>
                        <Text style={{ color: '#fff', fontSize: 16 }}>My Guardian Code: <Text style={{ fontWeight: 'bold', color: '#6A0DAD', fontSize: 20 }}>{currentUser?.guardianCode || 'Loading...'}</Text></Text>
                        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 5 }}>Share this code with others so they can find you.</Text>
                    </View>

                    <Text style={styles.subtitle}>Find Guardian</Text>
                    <View style={styles.searchRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Guardian Code (6 digits)"
                            placeholderTextColor="#ccc"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <Button title="Search" onPress={search} color="#6A0DAD" />
                    </View>
                    {searchResults.map((user, index) => (
                        <View key={user?.id || index} style={styles.userItem}>
                            <Text style={styles.userText}>{user?.name} (Code: {user?.guardianCode})</Text>
                            <Button title="Add" onPress={() => user?.id && addGuardian(user.id)} />
                        </View>
                    ))}

                    <Text style={styles.subtitle}>My Guardians List</Text>
                    <FlatList
                        data={guardians}
                        keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.userItem}>
                                <Text style={styles.userText}>{item?.name || 'Unknown'}</Text>
                                <Button title="Remove" color="red" onPress={() => item?.id && removeGuardian(item.id)} />
                            </View>
                        )}
                    />
                </View>
            )}

            {tab === 'protecting' && (
                <View style={styles.section}>
                    <Text style={styles.subtitle}>People seeing my location</Text>
                    {/* Actually protecting means I see THEIR location. The tab title might be confusing or logic swapped.
                        Plan said: "protectedUsers - users whose location THIS user can see".
                        So "Protecting" -> I am protecting them -> I see their location.
                    */}
                    <FlatList
                        data={protecting}
                        keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.userItem}>
                                <View>
                                    <Text style={styles.userText}>{item?.name || 'Unknown'}</Text>
                                    {item?.lastLatitude && item?.lastLongitude ? (
                                        <Text style={styles.subText}>
                                            Last seen: {new Date(item.lastLocationUpdate || '').toLocaleString()}
                                            {'\n'}
                                            Lat: {item.lastLatitude.toFixed(4)}, Lng: {item.lastLongitude.toFixed(4)}
                                        </Text>
                                    ) : (
                                        <Text style={styles.subText}>Location unknown</Text>
                                    )}
                                </View>
                            </View>
                        )}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#000' },
    tabContainer: { flexDirection: 'row', marginBottom: 20 },
    tab: { flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#333' },
    activeTab: { borderBottomColor: '#6A0DAD' },
    tabText: { color: '#fff', fontWeight: 'bold' },
    section: { flex: 1 },
    searchRow: { flexDirection: 'row', marginBottom: 10 },
    input: { flex: 1, backgroundColor: '#222', color: '#fff', padding: 10, borderRadius: 5, marginRight: 10 },
    subtitle: { color: '#aaa', fontSize: 18, marginBottom: 10, marginTop: 10 },
    userItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#111', marginBottom: 5, borderRadius: 5 },
    userText: { color: '#fff' },
    subText: { color: '#888', fontSize: 12 },
});
