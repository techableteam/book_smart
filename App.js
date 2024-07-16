/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Dashboard from './src/layout/Dashboard';
import MHeader from './src/components/Mheader';
import ClientSignIn from './src/layout/client/ClientSignin';
import ClientSignUp from './src/layout/client/ClientSignup';
import { NavigationContainer } from '@react-navigation/native';
import StackRouter from './src/layout/Layout';
import { createDrawerNavigator} from '@react-navigation/drawer';
import Layout from './src/layout/Layout';
import MyHome from './src/layout/client/MyHome';
import MyProfile from './src/layout/client/MyProfile';
import ShiftListing from './src/layout/client/ShiftListing';
import Shift from './src/layout/client/Shift';
import Reporting from './src/layout/client/Reporting';
import EditProfile from './src/layout/client/EditProfile';

// const Drawer = createDrawerNavigator();

function App() {

  return (
    // <NavigationContainer style = {styles.sectionContainer}>
    //   <Layout />
    // </NavigationContainer>
    <View>
      <EditProfile />
    </View>
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
  },
});

export default App;
