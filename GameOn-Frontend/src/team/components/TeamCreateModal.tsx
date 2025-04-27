import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  visible: boolean;
  onClose: () => void;
  onTeamCreated?: () => void;
}

export default function TeamCreateModal({
  visible,
  onClose,
  onTeamCreated,
}: Props) {
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setError("Team name cannot be empty");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const response = await fetch("http://localhost:3000/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create team");
        return;
      }

      Alert.alert("Success", `Team "${teamName}" created!`);
      setTeamName("");
      setError("");
      onClose();
      if (onTeamCreated) onTeamCreated();
    } catch (err: any) {
      console.error("Create team error:", err.message);
      setError("Unexpected error occurred");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.header}>Create a Team</Text>
          <TextInput
            placeholder="Team name"
            value={teamName}
            onChangeText={setTeamName}
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Create" onPress={handleCreateTeam} />
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 10,
    width: "80%",
    elevation: 5,
  },
  header: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  closeText: {
    color: "#007aff",
    fontWeight: "600",
  },
});
