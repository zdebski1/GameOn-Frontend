import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import styles from './styles';

interface Team {
  id: number;
  name: string;
}

export default function TeamDropDown () {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:3000/teams');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setTeams(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setError('Unable to fetch teams');
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const selectedTeamName = selectedTeam
    ? teams.find((team) => team.id === selectedTeam)?.name
    : 'Select a team';

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorBanner}>{error}</Text>}

      <Text style={styles.label}>Select a team:</Text>

      <Pressable style={styles.dropdown} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectedText}>{selectedTeamName}</Text>
        <ChevronDown size={24} color="#666" />
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Team</Text>

            <ScrollView style={styles.scrollView}>
              {teams.map((team) => (
                <Pressable
                  key={team.id}
                  style={styles.option}
                  onPress={() => {
                    setSelectedTeam(team.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{team.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

