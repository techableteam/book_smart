import React from 'react';
import { View, Image, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import ImageButton from '../../components/ImageButton';
import { useAtom } from 'jotai';
import { firstNameAtom, lastNameAtom, emailAtom, userRoleAtom, caregiverAtom } from '../../context/ClinicalAuthProvider';
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from 'react-native';
import AnimatedHeader from '../AnimatedHeader';

const { width, height } = Dimensions.get('window');

export default function MyHome ({ navigation }) {
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastName] = useAtom(lastNameAtom);
  const [email, setEmail] = useAtom(emailAtom);
  const [userRole, setUserRole] = useAtom(userRoleAtom);
  const [caregiver, setCaregiver] = useAtom(caregiverAtom);
  const handleNavigate = (navigateUrl) => {
    navigation.navigate(navigateUrl);
  };

  const userInfo = [
    {title: 'Name', content: firstName + ' ' + lastName},
    {title: 'Email', content: email},
    {title: 'User Roles', content: userRole},
    // {title: 'Caregiver', content: caregiver},
  ];

  return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent"/>
        <MHeader navigation={navigation} />
        <SubNavbar navigation={navigation} name={'ClientSignIn'}/>
        <ScrollView style={{width: '100%', marginTop: height * 0.22}} showsVerticalScrollIndicator={false}>
          <View style={styles.topView}>
            {/* <Image
              source={images.mark}
              resizeMode="contain"
              style={styles.mark}
            />
            <View style={styles.bottomBar}/> */}
            <TouchableOpacity onPress={() => navigation.navigate("ShiftListing")}>
              <AnimatedHeader title="Book Shifts Now!" style={{ paddingHorizontal: 30 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.imageButton}>
            <View style={styles.buttonWrapper}>
              <ImageButton title={"My Profile"} onPress={() => handleNavigate('EditProfile')} />
            </View>
            <View style={styles.buttonWrapper}>
              <ImageButton title={"Electronic Timesheet"} onPress={() => handleNavigate('TimesheetForm')} />
            </View>
            <View style={styles.buttonWrapper}>
              <ImageButton title={"My Shifts"} onPress={() => handleNavigate('Shift')} />
            </View>
            <View style={styles.buttonWrapper}>
              <ImageButton title={"My Reporting"} onPress={() => handleNavigate('Reporting')} />
            </View>
          </View>
          <View style={{ flex:1, justifyContent: 'center', width: '100%', alignItems: 'center' }}>
            <View style={styles.profile}>
              {
                userInfo.map((item, index) => 
                  <View key={index} style={styles.row}>
                    <Text style={styles.titles}>
                      {item.title.charAt(0).toUpperCase() + item.title.slice(1)}:
                    </Text>
                    <Text style={[
                      styles.content, 
                      item.title == "Name" ? {fontWeight: 'bold'} : 
                      item.title == "Email" ? {color: '#2a53c1', textDecorationLine:'underline'} : {}
                    ]}>{item.content}</Text>
                  </View>
                )
              }
            </View>
            {/* <Image
              source={images.homepage}
              resizeMode="cover"
              style={styles.homepage}
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
    justifyContent: 'center',
    position: 'relative',
    width: '100%'
  },
  topView: {
    marginTop: RFValue(5),
    marginLeft: '10%',
    width: '80%',
    flexDirection: 'column',
    justifyContent:'center',
    alignItems: 'center'
  },
  mark: {
    width: width * 0.65,
    height: height * 0.1,
    marginBottom: RFValue(30)
  },
  bottomBar: {
    height: RFValue(5),
    backgroundColor: '#C0D1DD',
    width: '100%'
  },
 
  // imageButton: {
  //   width: '90%',
  //   marginLeft: '5%',
  //   justifyContent: 'center',
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   gap: RFValue(10),
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginTop: RFValue(30),
  //   marginLeft: '5%'
  // },
  imageButton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: '14%',
    marginTop: 30,
  },
  buttonWrapper: {
    width: '45%',      
    marginHorizontal: 5,  
    marginVertical: 8,    
    alignItems: 'center',
  },
  homepage: {
    width: RFValue(250),
    height: RFValue(200),
    marginTop: RFValue(30),
    marginBottom: RFValue(100)
  },
  profile: {
    marginTop: RFValue(20),
    width: '84%',
    paddingHorizontal: RFValue(20),
    paddingVertical: RFValue(5),
    backgroundColor: '#c2c3c42e',
    borderRadius: RFValue(30),
    borderWidth: RFValue(2),
    borderColor: '#b0b0b0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    width: '100%',
    gap: RFValue(6),
  },
  titles: {
    fontWeight: 'bold',
    fontSize: RFValue(16),
    width: RFValue(90), // fixed width for alignment
    marginLeft: RFValue(5),
  },
  content: {
    fontSize: RFValue(16),
    flex: 1,
    flexWrap: 'wrap',
  },
  headBar: {
    textAlign: 'center',
    backgroundColor: '#BC222F',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: RFValue(18),
    fontWeight: 'bold'
  },
});
