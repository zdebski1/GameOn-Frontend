import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TeamDropDown from './components/teamDropDown';
import TeamMemberDropDown from './components/teamMemberDropDown';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import hamburger menu icon

export default function TeamScreen({ onLogout }: { onLogout: () => void }) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false); // State for menu visibility
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false); // State for create team modal visibility
  const [newTeamName, setNewTeamName] = useState('');
  const [createError, setCreateError] = useState('');

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

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible); // Toggle the menu visibility
  };

  // Handle the creation of a new team
  const handleCreateTeam = async () => {
    if (!newTeamName) {
      setCreateError('Team name is required');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:3000/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamName: newTeamName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCreateError(data.message || 'Failed to create team');
        return;
      }

      setNewTeamName('');
      setCreateError('');
      setIsCreateModalVisible(false);
      setSelectedTeam(data.teamId); // auto-select the new team
    } catch (err: any) {
      setCreateError(err.message || 'Unexpected error');
    }
  };

  return (
    <View style={styles.container}>
      {/* Hamburger Menu Icon */}
      <TouchableOpacity style={styles.hamburgerMenu} onPress={toggleMenu}>
        <Icon name="menu" size={30} color="#000" />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={toggleMenu}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable style={styles.menuOption} onPress={handleLogout}>
              <Text style={styles.menuOptionText}>Logout</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={toggleMenu}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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

      {/* Create New Team Button */}
      <Button title="Create New Team" onPress={() => setIsCreateModalVisible(true)} />

      {/* Create Team Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateModalVisible}
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a New Team</Text>
            <TextInput
              placeholder="Team Name"
              value={newTeamName}
              onChangeText={setNewTeamName}
              style={styles.input}
            />
            {createError ? <Text style={styles.errorText}>{createError}</Text> : null}
            <Button title="Create" onPress={handleCreateTeam} />
            <Button title="Cancel" color="gray" onPress={() => setIsCreateModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
  hamburgerMenu: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 15, // Increased padding for easier clicking
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  menuOption: {
    padding: 10,
  },
  menuOptionText: {
    fontSize: 18,
    color: 'black',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
