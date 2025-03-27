import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Layout from './src/layout/Layout';
import BackgroundTask from './src/utils/backgroundTask.js'
import { requestUserPermission } from './src/services/firebaseService.js';

function App() {
  useEffect(() => {
    requestUserPermission();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log("Notification opened in foreground: ", remoteMessage);
      Alert.alert(remoteMessage.notification?.title, remoteMessage.notification?.body);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer style = {styles.sectionContainer}>
      <Layout />
      <BackgroundTask />
    </NavigationContainer>
  );
}

AppRegistry.registerComponent('app', () => App);

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
