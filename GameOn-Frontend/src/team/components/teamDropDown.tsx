import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles';

interface Team {
  teamId: number;
  teamName: string;
}

interface Props {
  onTeamSelect: (teamId: number) => void;
  userId: number; // Add userId to the props type
}

export default function TeamDropDown({ onTeamSelect, userId }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        if (!userId) {
          setError('User not logged in');
          return;
        }

        const response = await fetch(`http://localhost:3000/teams?userId=${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        setTeams(data);
      } catch (error) {
        let errorMessage = 'An unknown error occurred';

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        console.error('Error fetching teams:', errorMessage);
        setError(`Unable to fetch teams: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [userId]);

  const selectedTeamName = selectedTeam
    ? teams.find((team) => team.teamId === selectedTeam)?.teamName ?? 'Select a team'
    : 'Select a team';

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <View style={styles.textContainer}>
          <Text style={styles.loadingText}>Loading teams...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.textContainer}>
        <Text style={styles.label}>Select a team:</Text>
      </View>

      {/* Pressable to open modal */}
      <Pressable style={styles.dropdown} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectedText}>{String(selectedTeamName)}</Text>
        <ChevronDown size={24} color="#666" />
      </Pressable>

      {/* Modal with list of teams */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.textContainer}>
              <Text style={styles.modalTitle}>Select a Team</Text>
            </View>

            <ScrollView style={styles.scrollView}>
              {teams.map((team) => (
                <Pressable
                  key={team.teamId}
                  style={styles.option}
                  onPress={() => {
                    setSelectedTeam(team.teamId);
                    onTeamSelect(team.teamId); // ✅ Notify parent
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{String(team.teamName)}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <View style={styles.textContainer}>
                <Text style={styles.closeButtonText}>Close</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
