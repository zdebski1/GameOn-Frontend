import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for error message

  const handleLogin = async () => {
    if (!userName || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Set the error message from the response
        setError(data.message || 'Login failed');
        return;
      }

      console.log('Login success:', data);
      
      // Save userId to AsyncStorage
      const { userId } = data; // Assuming the backend returns { userId, token }
      await AsyncStorage.setItem('userId', userId.toString()); // Store userId
      // Optionally, store a token if using JWT
      // await AsyncStorage.setItem('authToken', data.token);

      Alert.alert('Success', 'Logged in!');
      onLogin(); // Switch to Team screen on success
    } catch (error: any) {
      console.error('Login error:', error.message);
      setError('An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <TextInput
        placeholder="Username"
        value={userName}
        onChangeText={setUserName}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text> // Show the error message in red
      ) : null}

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 60,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  errorText: {
    color: 'red', // Error text in red
    marginBottom: 10,
  },
});
