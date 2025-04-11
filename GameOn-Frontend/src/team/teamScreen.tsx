import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TeamDropDown from './components/teamDropDown';
import TeamMemberDropDown from './components/teamMemberDropDown';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import hamburger menu icon

export default function TeamScreen({ onLogout }: { onLogout: () => void }) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false); // State for menu visibility

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
  // Style for the hamburger menu button (now clickable across the entire button)
  hamburgerMenu: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 15, // Increased padding for easier clicking
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal container for the dropdown menu
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Modal content style
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
});
