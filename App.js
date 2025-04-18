import React, { useEffect } from 'react';
import { StyleSheet, Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { NavigationContainer } from '@react-navigation/native';
import Layout from './src/layout/Layout';
import BackgroundTask from './src/utils/backgroundTask.js';
import notifee from '@notifee/react-native';
function App() {
  useEffect(() => {
    const initFCM = async () => {
      try {
        if (Platform.OS === 'ios') {
          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

          if (!enabled) return;

          await messaging().registerDeviceForRemoteMessages();
        }

        // ✅ Get FCM Token
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log("FCM Token", fcmToken);
        } else {
          console.log("FCM Token", "Token not available");
        }

        if (Platform.OS === 'android') {
          PushNotification.createChannel(
            {
              channelId: "book_smart",
              channelName: "Book Smart Notifications",
              channelDescription: "Notifications related to Book Smart app",
              importance: 4,
              vibrate: true,
            },
            (created) => console.log(`Channel created: ${created}`)
          );
        }

        const unsubscribe = messaging().onMessage(async remoteMessage => {
          const { title, body } = remoteMessage.notification || {};

          Alert.alert(title || 'Notification', body || '');

          if (Platform.OS === 'ios') {
            PushNotificationIOS.addNotificationRequest({
              id: remoteMessage.messageId || new Date().toISOString(),
              title: title || 'Notification',
              body: body || '',
              userInfo: remoteMessage.data || {}, 
            });
            await notifee.displayNotification({
              title: title || 'Notification',
              body: body || '',
              ios: {
                sound: 'default',
              },
            });
          } else {
            PushNotification.localNotification({
              channelId: "book_smart",
              title: title || 'Notification',
              message: body || '',
              playSound: true,
              soundName: 'default',
              importance: 'high',
              vibrate: true,
            });
          }
        });
        return unsubscribe;
      } catch (error) {
        console.log('FCM Initialization Error', error?.message || String(error));
      }
    };

    initFCM();
  }, []);

  return (
    <NavigationContainer style={styles.sectionContainer}>
      <Layout />
      <BackgroundTask />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    backgroundColor: '#ffffffa8',
  },
});

export default App;
