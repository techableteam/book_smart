import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { useAtom } from 'jotai';
import { firstNameAtom as clinicalFirstNameAtom } from '../context/ClinicalAuthProvider';
import { firstNameAtom as adminFirstNameAtom } from '../context/AdminAuthProvider';
import { firstNameAtom as facilityFirstNameAtom } from '../context/FacilityAuthProvider';

export default function SubNavbar({name, navigation}) {
  let userRole = 'clinical';
  if (name === "ClientSignIn") userRole = 'clinical';
  else if (name === "AdminLogin") userRole = 'admin';
  else if (name === "FacilityLogin") userRole = 'facilities';

  const [firstName, setFirstName] = useAtom(userRole === 'clinical' ? clinicalFirstNameAtom : userRole === 'admin' ? adminFirstNameAtom : facilityFirstNameAtom);
  const handleNavigate = (navigateUrl) => {
    navigation.navigate(navigateUrl, {userRole: userRole});
  };

  return (
    <Card style={styles.shadow}>
      <View>
        <Text style={{color: "black"}}>
          Logged in as&nbsp;
          <Text style={{fontWeight: 'bold', color:"black"}}>{firstName}</Text>&nbsp;-&nbsp;
          <Text 
            style={{
              color: '#2a53c1', 
              textDecorationLine: 'underline'
            }}
            onPress={()=>handleNavigate('AccountSettings')}
          >
            Account Settings
          </Text>
        </Text>
      </View>
      <View style={styles.actionsContainer}>
        <Text 
            style={{
              color: '#2a53c1', 
              textDecorationLine: 'underline'
            }}
            onPress={()=>handleNavigate(name)}>
            Log Out
          </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 0,
    backgroundColor: 'hsl(0, 0%, 80%)',
    position: 'absolute',
    top: 95,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  actionsContainer: {
    width: '100%',
    marginTop: 5,
    flexDirection: 'column',
    alignItems: 'flex-end',
  }
});
