import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TeamDropDown from '@/src/team/components/teamDropDown';
import TeamMemberDropdown from '@/src/team/components/teamMemberDropDown';

export default function TeamScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [loadingUserId, setLoadingUserId] = useState(true); // State to handle userId loading

  // Fetch userId from AsyncStorage
  useEffect(() => {
    const loadUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(parseInt(storedUserId, 10));
      }
      setLoadingUserId(false); // Set loading to false after fetching userId
    };

    loadUserId();
  }, []);

  if (loadingUserId) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Loading...</Text>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>User not found. Please log in again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Teams</Text>
      <TeamDropDown userId={userId} onTeamSelect={setSelectedTeam} />
      
      {selectedTeam !== null && (
        <>
          <Text style={styles.subHeader}>Team Members</Text>
          <TeamMemberDropdown teamId={selectedTeam} />
        </>
      )}
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
