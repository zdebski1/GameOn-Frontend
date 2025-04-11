import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';

export default function RegisterScreen({ onRegisterComplete }: { onRegisterComplete: () => void }) {
  const [form, setForm] = useState({
    userName: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          isAdmin: false,
          createdBy: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      console.log('Register complete - switching to login');
      onRegisterComplete(); // call immediately
      
      Alert.alert('Success', 'User created!'); // show message after

    } catch (error: any) {
      console.error('Registration failed:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>

      <TextInput
        placeholder="Username"
        value={form.userName}
        onChangeText={text => handleChange('userName', text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={text => handleChange('email', text)}
        style={styles.input}
      />
      <TextInput
        placeholder="First Name"
        value={form.firstName}
        onChangeText={text => handleChange('firstName', text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Last Name"
        value={form.lastName}
        onChangeText={text => handleChange('lastName', text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={form.password}
        onChangeText={text => handleChange('password', text)}
        secureTextEntry
        style={styles.input}
      />

      <Button title="Sign Up" onPress={handleRegister} />
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
});
