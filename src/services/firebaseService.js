import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission granted.');

    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      // Handle background notifications
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
      });

      // Handle when the app is opened from a notification
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification opened from background:', remoteMessage);
      });
    //   return token;
    } catch (error) {
      console.error('Error fetching FCM token:', error);
    }
  } else {
    console.log('Notification permission denied.');
  }
}

// Listen for foreground notifications
export function setupForegroundNotificationListener() {
  return messaging().onMessage(async remoteMessage => {
    console.log("Notification opened in frontend: ", remoteMessage);
    // Alert.alert('New Notification', remoteMessage.notification?.title);
    Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body)
  });
}
