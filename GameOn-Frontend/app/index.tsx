import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TeamScreen from "@/src/team/teamScreen";
import RegisterScreen from "@/src/login/registerScreen";
import LoginScreen from "@/src/login/loginScreen";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(true); // Start with the register screen
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Set the title dynamically based on the current screen
  useEffect(() => {
    if (isLoggedIn === null) {
      return; // Don't change the title while loading
    }

    if (isLoggedIn) {
      document.title = "Team Screen - GameOn"; // Customize for logged-in users
    } else if (isRegistering) {
      document.title = "Register - GameOn"; // Register screen title
    } else {
      document.title = "Login - GameOn"; // Login screen title
    }
  }, [isLoggedIn, isRegistering]);

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsRegistering(false);
  };

  const handleRegisterComplete = () => {
    setIsLoggedIn(true);
    setIsRegistering(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userId");
    setIsLoggedIn(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoggedIn ? (
        <TeamScreen onLogout={handleLogout} />
      ) : isRegistering ? (
        <RegisterScreen
          onRegisterComplete={handleRegisterComplete}
          onSwitchToLogin={() => setIsRegistering(false)} // Switch to Login screen
        />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </View>
  );
}
