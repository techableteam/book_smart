/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NativeRouter, Route, Routes } from 'react-router-native';
import Dashboard from './Dashboard';
import MHeader from '../components/Mheader';
import MFooter from '../components/Mfooter';
import ClientSignIn from './client/ClientSignin';
import ClientSignUp from './client/ClientSignup';
import MyHome from './client/MyHome';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MyProfile from './client/MyProfile';
import ShiftListing from './client/ShiftListing';
import Shift from './client/Shift';
import Reporting from './client/Reporting';
import EditProfile from './client/EditProfile';
const Stack = createNativeStackNavigator();

function Layout() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <MHeader />,
        footer: () => <MFooter />,
      }}
    >
      <Stack.Screen 
        name= 'Home'
        component = {Dashboard}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name= 'ClientSignIn'
        component = {ClientSignIn}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name= 'ClientSignUp'
        component = {ClientSignUp}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name= 'MyHome'
        component = {MyHome}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name= 'MyProfile'
        component = {MyProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name= 'ShiftListing'
        component = {ShiftListing}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name= 'Shift'
        component = {Shift}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name= 'Reporting'
        component = {Reporting}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name= 'EditProfile'
        component = {EditProfile}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default Layout;
