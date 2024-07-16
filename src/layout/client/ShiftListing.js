import React, { useState, useEffect, useRef } from 'react';
import { Modal, TextInput, View, Image, Animated, StyleSheet, ScrollView, StatusBar, Easing, TouchableOpacity } from 'react-native';
import { Text, PaperProvider, DataTable, useTheme } from 'react-native-paper';
import images from '../../assets/images';
import  { useNavigation, useRoute } from '@react-navigation/native';
import HButton from '../../components/Hbutton'
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import ImageButton from '../../components/ImageButton';
import { useAtom } from 'jotai';
import { firstNameAtom, emailAtom, userRoleAtom, entryDateAtom, phoneNumberAtom, addressAtom } from '../../context/AuthProvider';
// import MapView from 'react-native-maps';

export default function ShiftListing ({ navigation }) {
  //---------------------------------------Animation of Background---------------------------------------
  const [backgroundColor, setBackgroundColor] = useState('#0000ff'); // Initial color
  let colorIndex = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate a random color
      if(colorIndex >= 0.9) {
        colorIndex = 0;
      } else {
        colorIndex += 0.1;
      }

      const randomColor = colorIndex == 0 ? `#00000${Math.floor(colorIndex * 256).toString(16)}` : `#0000${Math.floor(colorIndex * 256).toString(16)}`;
      setBackgroundColor(randomColor);
      // console.log(randomColor)
    }, 500); // Change color every 5 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const theme = useTheme();
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [email, setEmail] = useAtom(emailAtom);
  const [userRole, setUserRole] = useAtom(userRoleAtom);
  const [entryDate, setEntryDate] = useAtom(entryDateAtom);
  const [phoneNumber, setPhoneNumber] = useAtom(phoneNumberAtom);
  const [address, setAddress] = useAtom(addressAtom);
  const handleNavigate = (navigateUrl) => {
    navigation.navigate(navigateUrl);
  }

  // const userInfo = [
  //   {title: 'Entry Date', content: firstName},
  //   {title: 'Phone', content: phoneNumber},
  //   {title: 'email', content: userRole},
  //   {title: 'Caregiver', content: caregiver},
  // ]

  const userInfo = [[
    {title: 'JOB-ID', content: "344"},
    {title: 'Job', content: 'Long Term Care'},
    {title: 'Location', content: "Lancaster, NY"},
    {title: 'Title', content: "LPN"},
    {title: 'Shift', content: '6/9/24, 6p-11p'},
    {title: 'Status', content: "Available"},
    {title: 'Pay Rate', content: "$35.00"},
  ]]

  const handleEdit = () => {
    console.log('handleEdit')
  }
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState('');
  const handleItemPress = (e) => {
    setText(e);
    setShowModal(false);
  }

  const handleChange = (e) => {
    setText(e.value);
  } 

  return (
      <View style={styles.container}>
        <StatusBar 
            translucent backgroundColor="transparent"
        />
        <MHeader navigation={navigation} />
        <SubNavbar />
        <ScrollView style={{width: '100%', marginTop: 139}}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topView}>
            <Animated.View style={[styles.backTitle, {backgroundColor}]}>
              <Text style={styles.title}>JOB / SHIFT LISTINGS</Text>
            </Animated.View>
            <View style={styles.bottomBar}/>
          </View>
          <Text style={styles.text}>View and Apply for Shifts below, once applied the Facility will be notified, and if <Text style={{fontWeight: 'bold'}}>&nbsp;"AWARDED"&nbsp;</Text> the shift will appear on your <Text style={{fontWeight: 'bold'}}>&nbsp;"MY SHIFTS TAB"&nbsp;</Text>.</Text>
          <View style={styles.imageButton}>
            <ImageButton title={"My Home"} onPress={() => handleNavigate('MyHome')} />
            <ImageButton title={"My Profile"} onPress={() => handleNavigate('MyProfile')} />
            <ImageButton title={"My Shifts"} onPress={() => handleNavigate('Shift')} />
            <ImageButton title={"My Reporting"} onPress={() => handleNavigate('Reporting')} />
          </View>
          <View style={styles.profile}>
            <View style={styles.profileTitleBg}>
              <Text style={styles.profileTitle}>🖥️ ALL AVAILABLE SHIFTS</Text>
            </View>
            <Text style={styles.name}>Showing 1-25 of 25</Text>
              {userInfo.map((it, idx) =>
                <View key={idx} style={styles.subBar}>
                  {it.map((item, index) => 
                    <View key={index} style={{flexDirection: 'row', width: '100%'}}>
                      <Text style={[styles.titles, item.title=="JOB-ID" ? {backgroundColor: "0x00ffff"} : {}]}>{item.title}</Text>
                      <Text style={[
                        styles.content, 
                        item.title == "JOB-ID" || item.title == "Status" ? {fontWeight: 'bold'} : {}
                      ]}>{item.content}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.edit} onPress = {() => handleEdit()}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}> VIEW & APPLY</Text>
                  </TouchableOpacity>
                </View>)
              }
          </View>
          <View style={{marginBottom: 100, marginLeft: '10%'}}>
            <Text style={[styles.title, {color: 'black', fontSize: 20}]}>Jobs</Text>
            <View style = {{}}>
              <Text style={{marginBottom: 10}}>Search</Text>
              <View style={{flexDirection: 'row', width:'80%'}}>
                <TextInput
                  style={styles.textModalInput}
                  placeholder="City, State, or Zip"
                  onChangeText={e => handleChange(e)}
                  value={text}
                />
                <Text style={[styles.text, {marginTop: 11, marginLeft: 0, width: 50}]}>within</Text>
                
                <TouchableOpacity onPress = {()=>setShowModal(true)}>
                  <TextInput
                    style={[styles.textModalInput, {width: 100}]}
                    placeholder="First"
                    editable= {false}
                    // onChangeText={e => handleChange(e)}
                    value={text ? text+" Miles": '' }
                  />
                </TouchableOpacity>
                {showModal && <Modal
                  Visible={false}
                  transparent= {true}
                  animationType="slide"
                  onRequestClose={() => {
                    setShowModal(!showModal);
                  }}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.calendarContainer}>
                      <Text style={styles.subtitle} onPress={()=>handleItemPress('5')}>5 Miles</Text>
                      <Text style={styles.subtitle} onPress={()=>handleItemPress('10')}>10 Miles</Text>
                      <Text style={styles.subtitle} onPress={()=>handleItemPress('25')}>25 Miles</Text>
                      <Text style={styles.subtitle} onPress={()=>handleItemPress('50')}>50 Miles</Text>
                      <Text style={styles.subtitle} onPress={()=>handleItemPress('100')}>100 Miles</Text>
                      <Text style={styles.subtitle} onPress={()=>handleItemPress('any')}>Any</Text>
                    </View>
                  </View>
                </Modal>}
              </View>
            </View>
            <TouchableOpacity style={[styles.edit, {backgroundColor: 'rgba(15, 118, 193, 0.73)', width: '90%' }]} onPress = {() => handleEdit()}>
              <Text style={{color: 'white', fontSize: 20}}> Search </Text>
            </TouchableOpacity>
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
    position: 'relative'
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
  text: {
    fontSize: 14,
    color: 'black',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 30,
    width: '90%',
    marginLeft: '5%'
  },
  imageButton: {
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  homepage: {
    // paddingHorizontal: 30,
    // paddingVertical: 70,
    marginLeft: '15%',
    width: 250,
    height: 200,
    marginTop: 30,
    marginBottom: 100
  },
  profile: {
    marginTop: 20,
    width: '84%',
    marginLeft: '7%',
    padding: 20,
    backgroundColor: '#c2c3c42e',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#b0b0b0'
    // elevation: 1,
    // // shadowColor: 'rgba(0, 0, 0, 0.4)',
    // // shadowOffset: { width: 1, height: 1 },
    // shadowRadius: 0,
  },
  titles: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 30,
    width: '40%'
  },
  content: {
    fontSize: 16,
    lineHeight: 30,
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
    fontSize: 14,
    marginVertical: 10,
  },
  edit: {
    backgroundColor: '#BC222F',
    padding: 5,
    borderRadius: 10,
    fontWeight: 'bold',
    color: 'white',
    width: '45%',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10
  },
  subBar: {
    width: '100%',
    backgroundColor: "#f0fbfe",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#c6c5c5"

  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
    width: '60%',
    height: '30%',
    marginLeft: '20',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: 20
  },
  textModalInput: { 
    backgroundColor: 'white', 
    width: '60%', 
    height: 40, 
    marginBottom: 10, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)', 
    paddingLeft: 10, 
    marginRight: 0,
    color: 'black'
  }
});
  