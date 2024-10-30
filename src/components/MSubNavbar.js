import React from 'react';
import { View, StyleSheet, Text, PixelRatio } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { useAtom } from 'jotai';
import { firstNameAtom } from '../context/ClinicalAuthProvider';
import { RFValue } from 'react-native-responsive-fontsize';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.getFontScale();

export default function MSubNavbar({name, navigation}) {
  let userRole = 'clinical';
  if (name === "Caregiver") userRole = 'clinical';
  else if (name === "Admin") userRole = 'admin';
  else if (name === "Facilities") userRole = 'facilities';

  const [firstName, serFistName] = useAtom(firstNameAtom)
  const handleNavigate = (navigateUrl) => {
    navigation.navigate(navigateUrl)
  };

  return (
    <Card style={styles.shadow}>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start', width: '100%', paddingHorizontal: 20}}>
        <Text style={[styles.text, {
            color: '#2a53c1', 
            textDecorationLine: 'underline'
          }]} 
          onPress={()=>{
            if (name === "Admin") {
              handleNavigate("AdminHome")
            } else if (name === "Caregiver") {
              handleNavigate('MyHome')
            } else if (name === "Facilities") {
              handleNavigate('FacilityProfile')
            }
          }}
        >
          {name} Profile
        </Text>
        <Text style={styles.text} >
          {">"}
        </Text>
        <Text style={[styles.text, {
            color: '#2a53c1', 
            textDecorationLine: 'underline'
          }]} 
          onPress={()=>{
            if (name === "Admin") {
              handleNavigate("AdminEditProfile")
            } else if (name === "Caregiver") {
              handleNavigate('EditProfile')
            } else if (name === "Facilities") {
              handleNavigate('FacilityEditProfile')
            }
          }}
        >
          Edit My Profile
        </Text>
      </View>
      <View style={{flexDirection: 'row', with: '100%', justifyContent: 'flex-end', flexWrap: 'wrap', paddingHorizontal: 10}}>
        <Text style={styles.text}>
          Logged in as&nbsp;
          <Text style={{fontWeight: 'bold'}}>{firstName}</Text>&nbsp;-&nbsp;
          <Text 
            style={{
              color: '#2a53c1', 
              textDecorationLine: 'underline'
            }}
            onPress={()=>handleNavigate('AccountSettings', {userRole: userRole})}
          >
            Account Settings
          </Text>
          {'\n'}  &nbsp;- &nbsp;
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
    top: height * 0.15,
    position:'absolute',
    width: '100%',
    paddingVertical: RFValue(8),
    height: height * 0.1
  },
  text: {
    paddingHorizontal: RFValue(5),
    color: '#101010',
    fontSize: pixelRatio > 1.5 ? RFValue(9) : RFValue(14),
    textAlign: 'right'
  },
});
