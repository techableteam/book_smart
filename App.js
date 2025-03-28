import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Layout from './src/layout/Layout';
import BackgroundTask from './src/utils/backgroundTask.js'
import { requestUserPermission, requestNotificationsPermission } from './src/services/firebaseService.js';
import PushNotification from 'react-native-push-notification';

function App() {
  useEffect(() => {
    requestNotificationsPermission();
    requestUserPermission();

    PushNotification.createChannel(
      {
        channelId: "book_smart",
        channelName: "Book Smart Notifications",
        channelDescription: "Notifications related to the Book Smart app",
        soundName: "default",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log("Notification opened in foreground: ", remoteMessage);
      Alert.alert(remoteMessage.notification?.title, remoteMessage.notification?.body);
      PushNotification.localNotification({
        channelId: "book_smart",
        title: remoteMessage.notification?.title,
        message: remoteMessage.notification?.body,
      });
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
