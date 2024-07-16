import React, { useEffect, useState } from 'react';

import { View, Image, StyleSheet, StatusBar, Text } from 'react-native';
import images from '../assets/images';
import { Card, IconButton, useTheme } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAtom } from 'jotai';
import { emailAtom, firstNameAtom } from '../context/AuthProvider';
// import { getRatingDataByUserID } from '../utils/api';

export default function MSubNavbar({props, navigation}) {
  const theme = useTheme();
  const [firstName, serFistName] = useAtom(firstNameAtom)
  const handleNavigate = (navigateUrl) => {
    navigation.navigate('ClientSignIn')
  }
  return (
    <Card style={styles.shadow}>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start', width: '100%'}}>
        <Text style={[styles.text, {
            color: '#2a53c1', 
            textDecorationLine: 'underline'
          }]} 
          onPress={()=>handleNavigate('MyProfile')}
        >
          👩‍⚕️ Caregiver Profile
        </Text>
        <Text style={styles.text} >
          {" > "}
        </Text>
        <Text style={[styles.text, {
            color: '#2a53c1', 
            textDecorationLine: 'underline'
          }]} 
          onPress={()=>handleNavigate('EditProfile')}>
          Edit My Profile
        </Text>
      </View>
      <View style={{flexDirection: 'row', with: '100%', justifyContent: 'flex-end'}}>
        <Text style={styles.text}>
          Logged in as&nbsp;
          <Text style={{fontWeight: 'bold'}}>{firstName}</Text>&nbsp;-&nbsp;
          <Text 
            style={{
              color: '#2a53c1', 
              textDecorationLine: 'underline'
            }}
            onPress={()=>handleNavigate('AccountSettings')}
          >
            Account Settings
          </Text>
          &nbsp;- &nbsp;
          <Text 
            style={{
              color: '#2a53c1', 
              textDecorationLine: 'underline'
            }}
            onPress={()=>handleNavigate('Home')}
          >
            Log Out
          </Text>
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 0,
    backgroundColor: 'hsl(0, 0%, 80%)',
    top: 78,
    position:'absolute',
    width: '100%',
    paddingVertical: 10
  },
  text: {
    paddingHorizontal: 10,
    color: '#101010',
    fontSize: 14,
    textAlign: 'right',
    lineHeight: 16
  },
});