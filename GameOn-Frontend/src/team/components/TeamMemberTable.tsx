import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TeamMemberTable({ teamId }: { teamId: number }) {
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/teams/${teamId}/members`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setMembers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load members');
      }
    };

    fetchMembers();
  }, [teamId]);

  if (error) return <Text style={styles.errorText}>{error}</Text>;

  if (members.length === 0) return <Text>No team members found.</Text>;

  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>First Name</Text>
        <Text style={styles.headerCell}>Last Name</Text>
      </View>
      {members.map((member) => (
        <View key={member.teamMemberId} style={styles.row}>
          <Text style={styles.cell}>{member.firstName}</Text>
          <Text style={styles.cell}>{member.lastName}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    padding: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  cell: {
    flex: 1,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});
