import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import ImageButton from '../../components/ImageButton';
import { useAtom } from 'jotai';
import { firstNameAtom, emailAtom, userRoleAtom, entryDateAtom, phoneNumberAtom, addressAtom, photoImageAtom } from '../../context/ClinicalAuthProvider';
import AnimatedHeader from '../AnimatedHeader';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function MyProfile ({ navigation }) {
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [email, setEmail] = useAtom(emailAtom);
  const [entryDate, setEntryDate] = useAtom(entryDateAtom);
  const [phoneNumber, setPhoneNumber] = useAtom(phoneNumberAtom);
  const [photoImage, setPhotoImage] = useAtom(photoImageAtom)
  const handleNavigate = (navigateUrl) => {
    navigation.navigate(navigateUrl);
  };

  const userInfo = [
    {title: 'Entry Date', content: entryDate},
    {title: 'Phone', content: phoneNumber},
    {title: 'email', content: email},
  ];

  const handleEdit = () => {
    console.log('handleEdit')
    navigation.navigate('EditProfile')
  };

  return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent"/>
        <MHeader navigation={navigation} />
        <SubNavbar navigation={navigation} name={'ClientSignIn'}/>
        <ScrollView style={{width: '100%', marginTop: height * 0.25}} showsVerticalScrollIndicator={false}>
          <View style={styles.topView}>
            <AnimatedHeader title="CAREGIVER PROFILE & DOCS" />
            <View style={styles.bottomBar}/>
          </View>
          <View style={styles.imageButton}>
            <ImageButton title={"My Home"} onPress={() => handleNavigate('MyHome')} />
            <ImageButton title={"All Shift Listings"} onPress={() => handleNavigate('ShiftListing')} />
            <ImageButton title={"My Shifts"} onPress={() => handleNavigate('Shift')} />
            <ImageButton title={"My Reporting"} onPress={() => handleNavigate('Reporting')} />
          </View>
          <View style={styles.profile}>
            <View style={styles.profileTitleBg}>
              <Text style={styles.profileTitle}>CAREGIVER PROFILE & DOCS</Text>
            </View>
            {photoImage.type === 'image' ? photoImage.content  && <Image
              resizeMode="cover"
              style={styles.nurse}
              source={{ uri: `${photoImage.content}` }}
            /> : 
            <Text style={styles.name}>{photoImage.name}</Text>}
            <Text style={styles.name}>{firstName || "Dale"}</Text>
            <TouchableOpacity style={styles.edit} onPress = {() => handleEdit()}>
              <Text style={{color: 'white'}}> Edit My Profile</Text>
            </TouchableOpacity>
            {
              userInfo.map((item, index) => 
                <View key={index} style={{flexDirection: 'column', width: '100%'}}>
                  <Text style={styles.titles}>{item.title}</Text>
                  <Text style={[
                    styles.content, 
                    item.title == "Phone" || item.title == "Email" ? {color: '#2a53c1', textDecorationLine:'underline', width: '100%'} : {}
                  ]}>{item.content}</Text>
                </View>
              )
            }
            {/* <MapView
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            /> */}
          </View>
        </ScrollView>
        <MFooter />
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    width: '100%'
  },
  topView: {
    marginTop: 30,
    marginLeft: '10%',
    width: '80%',
    flexDirection: 'column',
    justifyContent:'center',
    alignItems: 'center'
  },
  backTitle: {
    backgroundColor: 'black',
    width: '90%',
    height: '55',
    marginLeft: '5%',
    marginTop: 10,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
    color: 'black',
    top: 10
  },
  title: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
    backgroundColor: 'transparent',
    paddingVertical: 10
  },
  bottomBar: {
    marginTop: 30,
    height: 5,
    backgroundColor: '#4f70ee1c',
    width: '100%'
  },
  input: {
    backgroundColor: 'white', 
    height: 30, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
  },
  text: {
    fontSize: 14,
    color: 'black',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 30,
  },
  imageButton: {
    width: '90%',
    marginLeft: '5%',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  profile: {
    marginTop: 20,
    width: '84%',
    marginLeft: '7%',
    padding: 20,
    backgroundColor: '#c2c3c42e',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#b0b0b0',
    marginBottom: 100
    // elevation: 1,
    // // shadowColor: 'rgba(0, 0, 0, 0.4)',
    // // shadowOffset: { width: 1, height: 1 },
    // shadowRadius: 0,
  },
  titles: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 40,
    width: '40%'
  },
  content: {
    fontSize: 16,
    width: '60%',
    lineHeight: 40,
  },
  profileTitleBg: {
    backgroundColor: '#BC222F',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    marginLeft: '10%',
    marginBottom: 20
  },
  profileTitle: {
    fontWeight: 'bold',
    color: 'white',
  },
  nurse: {
    width: 200,
    height: 200
  },
  name: {
    fontSize: 20,
    marginVertical: 10,
  },
  edit: {
    backgroundColor: '#BC222F',
    padding: 10,
    borderRadius: 10,
    fontWeight: 'bold',
    color: 'white',
    width: '45%',
    flexDirection: 'row',
    justifyContent: 'center'
  }
});
  