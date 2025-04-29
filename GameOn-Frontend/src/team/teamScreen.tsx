import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Calendar } from "react-native-calendars";

export default function TeamScreen({ onLogout }: { onLogout: () => void }) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isCreateTeamModalVisible, setIsCreateTeamModalVisible] = useState(false);
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMember, setNewTeamMember] = useState("");
  const [createError, setCreateError] = useState("");

  // Availability modal states
  const [isAvailabilityModalVisible, setIsAvailabilityModalVisible] =
    useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberAvailability, setMemberAvailability] = useState<any[]>([]);
  const [isAvailabilityViewVisible, setIsAvailabilityViewVisible] =
    useState(false);

  const handleViewAvailability = async (memberId: number) => {
    setSelectedMemberId(memberId);
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3000/availabilities/${selectedTeam}/member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setMemberAvailability(data);
      setIsAvailabilityViewVisible(true);
    } catch (err) {
      console.error("Error fetching availability:", err);
    }
  };

  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(Number(storedUserId));
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!userId) return;
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          onLogout();
          return;
        }
        const response = await fetch(
          `http://localhost:3000/teams?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 401) {
          await AsyncStorage.multiRemove(["userId", "token"]);
          onLogout();
          return;
        }
        const data = await response.json();
        setTeams(Array.isArray(data) ? data : data.teams);
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };

    fetchTeams();
  }, [userId]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (selectedTeam === null) return;
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/teams/${selectedTeam}/members`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        const membersArray = Array.isArray(data) ? data : data.members || [];
        setTeamMembers(membersArray);
      } catch (err) {
        console.error("Error fetching team members:", err);
      }
    };

    fetchTeamMembers();
  }, [selectedTeam]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["userId", "token"]);
      onLogout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName) {
      setCreateError("Team name is required");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://localhost:3000/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamName: newTeamName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCreateError(data.message || "Failed to create team");
        return;
      }

      setTeams((prev) => [...prev, data]);
      setNewTeamName("");
      setCreateError("");
      setIsCreateTeamModalVisible(false);
      setSelectedTeam(data.id);
    } catch (err: any) {
      setCreateError(err.message || "Unexpected error");
    }
  };

  const handleCreateTeamMember = async () => {
    if (!newTeamMember || selectedTeam === null) {
      setCreateError("Team member name is required");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/teams/${selectedTeam}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamMember: newTeamMember }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCreateError(data.message || "Failed to create team member");
        return;
      }

      setTeamMembers((prev) => [...prev, data]);
      setNewTeamMember("");
      setCreateError("");
      setIsAddMemberModalVisible(false);
    } catch (err: any) {
      setCreateError(err.message || "Unexpected error");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* MENU */}
      <TouchableOpacity style={styles.hamburgerMenu} onPress={toggleMenu}>
        <Icon name="menu" size={30} color="#000" />
      </TouchableOpacity>

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

      {/* HEADER */}
      <Text style={styles.header}>Your Teams</Text>

      {/* TEAMS LIST */}
      {teams.length === 0 ? (
        <Text>No teams found.</Text>
      ) : (
        <View style={styles.teamListContainer}>
          {teams.map((team) => (
            <TouchableOpacity
              key={team.teamId || team.teamName}
              style={[
                styles.teamRow,
                selectedTeam === team.teamId && styles.selectedTeamRow,
              ]}
              onPress={() => setSelectedTeam(team.teamId)}
            >
              <Text style={styles.teamName}>{team.teamName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Create Team Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setIsCreateTeamModalVisible(true)}
      >
        <Text style={styles.createButtonText}>Create Team</Text>
      </TouchableOpacity>
      {/* TEAM MEMBERS */}
      {selectedTeam !== null ? (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.subHeader}>Team Members</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Name</Text>
          </View>
          {teamMembers.length > 0 ? (
            teamMembers.map((member, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.tableRow}
                onPress={() => handleViewAvailability(member.teamMemberId)}
              >
                <Text style={styles.tableCell}>
                  {member.user.firstName} {member.user.lastName}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No team members found.</Text>
          )}

          {/* Add Team Member Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setIsAddMemberModalVisible(true)}
          >
            <Text style={styles.createButtonText}>Add Team Member</Text>
          </TouchableOpacity>

          {/* CALENDAR */}
          <Text style={styles.subHeader}>Team Calendar</Text>
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setIsAvailabilityModalVisible(true);
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                marked: true,
                selectedColor: "#2196F3",
              },
            }}
            theme={{
              selectedDayBackgroundColor: "#2196F3",
              todayTextColor: "#00adf5",
              arrowColor: "#2196F3",
            }}
          />
        </View>
      ) : (
        <Text>Select a team to view members.</Text>
      )}


      {/* Create Team Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateTeamModalVisible}
        onRequestClose={() => setIsCreateTeamModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Team Name"
              value={newTeamName}
              onChangeText={setNewTeamName}
              style={styles.input}
            />
            {createError ? <Text style={styles.errorText}>{createError}</Text> : null}
            <Button title="Create" onPress={handleCreateTeam} />
            <Button title="Cancel" color="gray" onPress={() => setIsCreateTeamModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Add Team Member Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddMemberModalVisible}
        onRequestClose={() => setIsAddMemberModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Team Member Name"
              value={newTeamMember}
              onChangeText={setNewTeamMember}
              style={styles.input}
            />
            {createError ? <Text style={styles.errorText}>{createError}</Text> : null}
            <Button title="Add" onPress={handleCreateTeamMember} />
            <Button title="Cancel" color="gray" onPress={() => setIsAddMemberModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* ... other modals for availability ... */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    alignSelf: "center",
  },
  subHeader: {
    fontSize: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  hamburgerMenu: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    width: 300,
    borderRadius: 10,
  },
  menuOption: {
    padding: 10,
  },
  menuOptionText: {
    fontSize: 18,
    color: "black",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f44336",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    margin: 10,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  teamListContainer: {
    marginTop: 20,
  },
  teamRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  teamName: {
    fontSize: 18,
  },
  selectedTeamRow: {
    backgroundColor: "#e0e0e0",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    marginBottom: 8,
    justifyContent: "flex-start",
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 14,
    width: "100%",
    textAlign: "left",
  },
});
