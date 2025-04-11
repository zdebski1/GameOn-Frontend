import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TeamDropDown from './components/teamDropDown';
import TeamMemberDropDown from './components/teamMemberDropDown';

export default function TeamScreen({ onLogout }: { onLogout: () => void }) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(Number(storedUserId)); // Convert the string to a number
      }
    };

    getUserId();
  }, []);

  const handleLogout = async () => {
    try {
      // Remove the userId from AsyncStorage
      await AsyncStorage.removeItem('userId');
      console.log('User logged out');
      
      // Call the onLogout function to notify the parent (App)
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Teams</Text>

      {userId !== null ? (
        <TeamDropDown onTeamSelect={setSelectedTeam} userId={userId} />
      ) : (
        <Text>Loading...</Text>
      )}

      {selectedTeam !== null && (
        <>
          <Text style={styles.subHeader}>Team Members</Text>
          <TeamMemberDropDown teamId={selectedTeam} />
        </>
      )}

      {/* Logout Button */}
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 20,
    marginTop: 24,
    marginBottom: 12,
  },
});
