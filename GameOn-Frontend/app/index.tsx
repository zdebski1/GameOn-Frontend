import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import TeamDropDown from '@/src/team/components';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <TeamDropDown /> {}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
