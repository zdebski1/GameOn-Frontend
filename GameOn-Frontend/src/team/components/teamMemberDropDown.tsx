import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import styles from '../styles';

interface TeamMember {
teamMemberId: number;
firstName: string;
}

interface Props {
  teamId: number | null;
}

export default function TeamMemberDropdown({ teamId }: Props) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teamId === null) return;

    const fetchMembers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3000/teams/${teamId}/members`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setMembers(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load members: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [teamId]);

  const selectedMemberName = selectedMember
    ? members.find((m) => m.teamMemberId === selectedMember)?.firstName ?? 'Select a member'
    : 'Select a member';

  if (teamId === null) return null; // Do not show dropdown if no team selected

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.label}>Select a team member:</Text>

      <Pressable style={styles.dropdown} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectedText}>{selectedMemberName}</Text>
        <ChevronDown size={24} color="#666" />
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Team Member</Text>

            {loading ? (
              <ActivityIndicator size="large" />
            ) : (
              <ScrollView style={styles.scrollView}>
                {members.map((member) => (
                  <Pressable
                    key={member.teamMemberId}
                    style={styles.option}
                    onPress={() => {
                      setSelectedMember(member.teamMemberId);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.optionText}>{member.firstName}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
