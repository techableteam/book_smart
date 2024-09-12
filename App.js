import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Layout from './src/layout/Layout';
import BackgroundTask from './src/utils/backgroundTask.js'

function App() {
  return (
    <NavigationContainer style = {styles.sectionContainer}>
      <Layout />
      <BackgroundTask />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    backgroundColor: '#ffffffa8'
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  }
});

export default App;
