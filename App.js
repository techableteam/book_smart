import React, { useEffect, useRef } from 'react';
import { StyleSheet, Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { NavigationContainer } from '@react-navigation/native';
import Layout from './src/layout/Layout';
import BackgroundTask from './src/utils/backgroundTask.js';
import notifee from '@notifee/react-native';
import { requestTrackingPermission } from 'react-native-tracking-transparency';
import { acknowledgeNewTerms } from './src/utils/useApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App() {
  const navigationRef = useRef(null);

  useEffect(() => {
    const initFCM = async () => {
      try {
        if (Platform.OS === 'ios') {
          const status = await requestTrackingPermission();
          console.log('ATT Permission Status:', status);
          
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
          const data = remoteMessage.data || {};

          // Check if this is a new terms notification
          if (data.type === 'new_terms') {
            const termsType = data.termsType || 'clinician';
            const version = data.version || '';
            const termsTypeDisplay = termsType === 'clinician' ? 'Clinician' : 'Facility';
            
            Alert.alert(
              title || 'New Terms of Service Available',
              `A new version (${version}) of the ${termsTypeDisplay} Terms of Service has been released. You must accept the new terms to continue using the app.`,
              [
                {
                  text: 'OK',
                  onPress: async () => {
                    try {
                      // Call acknowledge endpoint (admin only, but we'll try)
                      // This will reset acknowledge flags and logout users
                      await acknowledgeNewTerms(termsType);
                      
                      // Clear all stored data and logout
                      await AsyncStorage.multiRemove([
                        'token',
                        'aic',
                        'AId',
                        'clinicalEmail',
                        'clinicalPassword',
                        'facilityEmail',
                        'facilityPassword'
                      ]);
                      
                      // Navigate to appropriate login screen based on terms type
                      if (navigationRef.current?.isReady()) {
                        if (termsType === 'clinician') {
                          navigationRef.current.navigate('ClientSignIn');
                        } else if (termsType === 'facility') {
                          navigationRef.current.navigate('FacilityLogin');
                        } else {
                          navigationRef.current.navigate('Home');
                        }
                      }
                      
                      console.log('User logged out. Please log in again to accept new terms.');
                    } catch (error) {
                      console.error('Error acknowledging new terms:', error);
                      // Even if acknowledge fails, still logout the user
                      await AsyncStorage.multiRemove([
                        'token',
                        'aic',
                        'AId',
                        'clinicalEmail',
                        'clinicalPassword',
                        'facilityEmail',
                        'facilityPassword'
                      ]);
                      if (navigationRef.current?.isReady()) {
                        navigationRef.current.navigate('Home');
                      }
                    }
                  }
                }
              ],
              { cancelable: false }
            );
          } else {
            // Regular notification
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
          }
        });
        return unsubscribe;
      } catch (error) {
        console.log('FCM Initialization Error', error?.message || String(error));
      }
    };

    initFCM();

    // Handle when app is opened from a notification (background/quit state)
    const handleNotificationOpened = async (remoteMessage) => {
      const data = remoteMessage?.data || {};
      
      if (data.type === 'new_terms') {
        const termsType = data.termsType || 'clinician';
        const version = data.version || '';
        const termsTypeDisplay = termsType === 'clinician' ? 'Clinician' : 'Facility';
        
        Alert.alert(
          'New Terms of Service Available',
          `A new version (${version}) of the ${termsTypeDisplay} Terms of Service has been released. You must accept the new terms to continue using the app.`,
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  await acknowledgeNewTerms(termsType);
                  await AsyncStorage.multiRemove([
                    'token',
                    'aic',
                    'AId',
                    'clinicalEmail',
                    'clinicalPassword',
                    'facilityEmail',
                    'facilityPassword'
                  ]);
                  
                  if (navigationRef.current?.isReady()) {
                    if (termsType === 'clinician') {
                      navigationRef.current.navigate('ClientSignIn');
                    } else if (termsType === 'facility') {
                      navigationRef.current.navigate('FacilityLogin');
                    } else {
                      navigationRef.current.navigate('Home');
                    }
                  }
                } catch (error) {
                  console.error('Error acknowledging new terms:', error);
                  await AsyncStorage.multiRemove([
                    'token',
                    'aic',
                    'AId',
                    'clinicalEmail',
                    'clinicalPassword',
                    'facilityEmail',
                    'facilityPassword'
                  ]);
                  if (navigationRef.current?.isReady()) {
                    navigationRef.current.navigate('Home');
                  }
                }
              }
            }
          ],
          { cancelable: false }
        );
      }
    };

    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          handleNotificationOpened(remoteMessage);
        }
      });

    // Listen for notification opened when app is in background
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      handleNotificationOpened(remoteMessage);
    });

    return () => {
      if (unsubscribeNotificationOpened) {
        unsubscribeNotificationOpened();
      }
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef} style={styles.sectionContainer}>
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
