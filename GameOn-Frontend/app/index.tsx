import React, { useState } from 'react';
import { SafeAreaView, Button } from 'react-native';
import RegisterScreen from '@/src/login/registerScreen';
import LoginScreen from '@/src/login/loginScreen';
import TeamScreen from '@/src/team/teamScreen';

export default function App() {
  const [screen, setScreen] = useState<'sign up' | 'login' | 'team'>('sign up');

  console.log('Current screen:', screen); // Log the current screen state

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {screen === 'sign up' ? (
        <RegisterScreen onRegisterComplete={() => {
          console.log('Register complete - switching to login');
          setScreen('login');  // Switch to login after registration
        }} />
      ) : screen === 'login' ? (
        <LoginScreen onLogin={() => {
          console.log('Logged in - switching to team');
          setScreen('team');  // Switch to team screen after login
        }} />
      ) : (
        <TeamScreen />
      )}

      {/* Buttons to manually switch screens */}
      <Button title="Login" onPress={() => setScreen('login')} />
      {/* <Button title="Go to Team" onPress={() => setScreen('team')} /> */}
    </SafeAreaView>
  );
}
