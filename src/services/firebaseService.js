import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import {
  RESULTS,
  requestNotifications,
} from 'react-native-permissions';
import { getApp, initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyDe_VKn-VUDe_DBkrFnrwkP5hwcobyHyDY',
  authDomain: 'booksmartllc-8dd2e.firebaseapp.com',
  projectId: 'booksmartllc-8dd2e',
  storageBucket: 'booksmartllc-8dd2e.appspot.com',
  messagingSenderId: '418587939564',
  appId: '1:418587939564:ios:d10b5f991088ddca804bc9',
};

export async function initFirebaseConfig() {
  let app = null;

  try {
    app = await getApp();
  } catch (err) {
    app = await initializeApp(firebaseConfig);
  }

  console.log("APP NAME: 111", app.name)
}

export const requestNotificationsPermission = async () => {
  const { status } = await requestNotifications(['alert', 'sound', 'badge']);
  if (status === RESULTS.GRANTED) {
    console.log("granted!!!!!");
  } else {
    console.log("blocked!!!!!");
  }
};

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  Alert.alert("firebase")
  if (enabled) {
    console.log('Notification permission granted.');

    try {
      await messaging().registerDeviceForRemoteMessages();
      let fcmToken = await messaging().getToken();
      Alert.alert('FCM Token:', fcmToken);

      // ✅ Show Alert with FCM Token for testing

      // Handle background notifications
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        Alert.alert('Message handled in the background!', remoteMessage);
      });

      // Handle when the app is opened from a notification
      messaging().onNotificationOpenedApp(remoteMessage => {
        Alert.alert('Notification opened from background:', remoteMessage);
      });

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
