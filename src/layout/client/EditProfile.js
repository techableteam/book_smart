import { Alert, Animated, Easing, StyleSheet, View, Image, Text, ScrollView, TouchableOpacity, Modal, StatusBar, Button } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { CheckBox } from 'react-native-elements';
import images from '../../assets/images';
import { Divider, TextInput, ActivityIndicator, useTheme, Card } from 'react-native-paper';
import { AuthState, firstNameAtom, lastNameAtom, socialSecurityNumberAtom, verifiedSocialSecurityNumberAtom } from '../../context/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import HButton from '../../components/Hbutton';
import MHeader from '../../components/Mheader';
import MFooter from '../../components/Mfooter';
import PhoneInput from 'react-native-phone-input';
import DropDownPicker from 'react-native-dropdown-picker';
import SignatureCapture from 'react-native-signature-capture';
import DatePicker from 'react-native-date-picker';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import RNSPickerSelect from 'react-native-picker-select';
import { Signup } from '../../utils/useApi';
import MSubNavbar from '../../components/MSubNavHar';

export default function EditProfile({ navigation }) {

  const theme = useTheme();

  //--------------------------------------------Credentials-----------------------------
  const [ credentials, setCredentials ] = useState({
    firstName: 'Dale',
    lastName: 'Wong',
    email: 'dalewong008@gmail.com',
    password: '',
    phoneNumber: "1231231234",
    title: 'RN',
    birthday: Date("07/24/2024"),
    socialSecurityNumber: '',
    verifiedSocialSecurityNumber: '',
    address: {
      streetAddress: '',
      streetAddress2: '',
      city: '',
      state: '',
      zip: '',
    },
    photoImage: '',
    password: '',
    signature: '',
    role: 'Clinicians'
  })

  const handleCredentials = (target, e) => {
    if (target !== "streetAddress" && target !== "streetAddress2" && target !== "city" && target !== "state" && target !== "zip") {
      setCredentials({...credentials, [target]: e});
    }
    else {
      setCredentials({...credentials, address: {...credentials.address, [target]: e}})
    }
    console.log(credentials);
  }

  //-------------------------------------------ComboBox------------------------
  const placeholder = {
    label: 'Select an item...',
    value: null,
  };
  const items = [
    { label: 'CNA', value: 'CNA' },
    { label: 'LPN', value: 'LPN' },
    { label: 'RN', value: 'RN' },
  ];
  const [selectedValue, setSelectedValue] = useState('Selected Value...');

  const handleTitle = (target, e) => {
    handleCredentials(target, e);
    setSelectedValue(e)
  }
  const [showModal, setShowModal] = useState(false);
  const handleItemPress = (text) => {
    handleCredentials('title', text);
    setShowModal(false);
  }

  //-------------------------------------------Date Picker---------------------------------------
  const [birthday, setBirthday] = useState(new Date());
  const [showCalender, setShowCalendar] = useState(false);
  const handleDayChange = (target, day) => {
    setBirthday(day);
    handleCredentials(target, day);
  }

  //-------------------------------------------File Upload----------------------------
  const [photoName, setPhotoName] = useState('');

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images], // Specify the type of files to pick (e.g., images)
      });

      setPhotoName(res[0].name);

      // Read the file content and convert it to base64
      const fileContent = await RNFS.readFile(res[0].uri, 'base64');
      handleCredentials('photoImage', `data:${res.type};base64,${fileContent}`)
      console.log(base64Image);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Handle other errors
      }
    }
  };

  const [checked, setChecked] = useState(false);
  
  const handleToggle = () => {
    setChecked(!checked);
  };
  
  const handleSignUpNavigate = () => {
    navigation.navigate('ClientPending');
  }

  const handleBack = () => {
    navigation.navigate('ClientSignIn');
  }

    //Alert
  const showAlerts = (name) => {
    Alert.alert(
      'Warning!',
      `You have to input ${name}!`,
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('OK pressed')
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleSubmit = async () => {
    handlePassword();
    if (credentials.email === '' || 
      credentials.firstName === 'Dale' || 
      credentials.lastName ==='Wong' || 
      credentials.phoneNumber ==='1231231234' || 
      credentials.title ==='' || 
      credentials.birthday ==='07/24/2024' || 
      credentials.socialSecurityNumber ==='' || 
      credentials.verifiedSocialSecurityNumber ==='' || 
      credentials.address.streetAddress ==='' || 
      credentials.address.city ==='' || 
      credentials.address.state ==='' || 
      credentials.address.zip ==='') {
        showAlerts('all gaps')
    }
    else {
      navigation.navigate('MyHome');
      // try {
      //   console.log('credentials: ', credentials);
      //   const response = await Signup(credentials);
      //   console.log('Signup successful: ', response)
      // } catch (error) {
      //   console.error('Signup failed: ', error)
      // }
    }
  }
  return (
    <View style={styles.container}>
      <StatusBar 
        translucent backgroundColor="transparent"
      />
      <MHeader navigation={navigation}/>
      <MSubNavbar navigation={navigation} />
      <ScrollView style = {styles.scroll}    
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modal}>
          <View style={styles.authInfo}>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Name <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[styles.input, {width: '50%'}]}
                  placeholder="First"
                  onChangeText={e => handleCredentials('firstName', e)}
                  value={credentials.firstName || ''}
                />
                <TextInput
                  style={[styles.input, {width: '50%'}]}
                  placeholder="Last"
                  onChangeText={e => handleCredentials('lastName', e)}
                  value={credentials.lastName || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Email <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[styles.input, {width: '100%'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={e => handleCredentials('email', e)}
                  value={credentials.email || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Phone <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <PhoneInput
                  style={[styles.input, {backgroundColor: 'white', width: '100%', paddingLeft: 5}]}
                  placeholder=""
                  initialCountry="us"
                  // autoFocus
                  onChangePhoneNumber={e => handleCredentials('phoneNumber', e)}
                  value={credentials.phoneNumber}
                  textProps={{ style: { color: 'black', fontSize: 16, padding: 0} }}
                  keyboardType="phone-pad"                            
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> SSN <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[styles.input, {width: '100%'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="numeric" // Set the keyboardType to "numeric"
                  onChangeText={e => handleCredentials('socialSecurityNumber', e)}
                  value={credentials.socialSecurityNumber || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Date of Birth <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'column', width: '100%', gap: 5}}>
                <TouchableOpacity onPress={() => {setShowCalendar(true), console.log(showCalender)}} style={{width: '100%'}}>
                  <TextInput
                    style={[styles.input, {width: '100%'}]}
                    placeholder=""
                    value={birthday.toDateString()}
                    editable={false}
                  />
                </TouchableOpacity>
                
                {/* <Button title="Select Birthday" onPress={() => setShowCalendar(true)} /> */}
                {showCalender && 
                <>
                  <DatePicker
                    date={birthday}
                    onDateChange={(day) => handleDayChange('birthday', day)}
                    mode="date" // Set the mode to "date" to allow year and month selection
                    androidVariant="native"
                  />
                  <Button title="confirm" onPress={(day) =>{setShowCalendar(!showCalender);}} />
                </>
                }
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Caregiver Address <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'column', width: '100%', gap: 5}}>
                <View style={{width: '100%', marginBottom: 10}}>
                  <TextInput
                    style={[styles.input, {width: '100%', marginBottom: 0}]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleCredentials('streetAddress', e)}
                    value={credentials.address.streetAddress || ''}
                  />
                  <Text>Street Address</Text>
                </View>
                <View style={{width: '100%', marginBottom: 10}}>
                  <TextInput
                    style={[styles.input, {width: '100%', marginBottom: 0}]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleCredentials('streetAddress2', e)}
                    value={credentials.address.streetAddress2 || ''}
                  />
                  <Text>Street Address2</Text>
                </View>
                <View style={{flexDirection: 'row', width: '100%', gap: 5, marginBottom: 30}}>
                  <View style={[styles.input, {width: '45%'}]}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, {width: '100%', marginBottom: 0}]}
                      onChangeText={e => handleCredentials('city', e)}
                      value={credentials.address.city || ''}
                    />
                    <Text>City</Text>
                  </View>
                  <View style={[styles.input, {width: '20%'}]}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, {width: '100%', marginBottom: 0}]}
                      onChangeText={e => handleCredentials('state', e)}
                      value={credentials.address.state || ''}
                    />
                    <Text>State</Text>
                  </View>
                  <View style={[styles.input, {width: '30%'}]}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, {width: '100%', marginBottom: 0}]}
                      // keyboardType="numeric" // Set the keyboardType to "numeric" for zip input
                      onChangeText={e => handleCredentials('zip', e)}
                      value={credentials.address.zip || ''}
                    />
                    <Text>Zip</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.email}>
              <Text style={styles.subtitle}> Pic. (Optional)</Text>
              {credentials.photoImage &&
              <Image
                style={{ width: 200, height: 200 }}
                source={{ uri: `data:image/jpeg;base64,${credentials.photoImage}` }}
              />
              }
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={pickFile} style={styles.chooseFile}>
                  <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, {width: '70%'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={photoName || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Title <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{position: 'relative', width: '100%', gap: 5, height: 50}}>
                <TouchableOpacity onPress = {()=>setShowModal(true)}>
                  <TextInput
                    style={[styles.input, {width: '100%'}]}
                    placeholder="First"
                    editable= {false}
                    // onChangeText={e => handleCredentials('firstName', e)}
                    value={credentials.title != ''?credentials.title : 'Select Title ...' }
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
                      <Text style={styles.subtitle} onPress={()=>handleItemPress('')}>Select Title...</Text>
                      <Text style={styles.subtitle} onPress={()=>handleItemPress('CNA')}>CNA</Text>
                      <Text style={styles.subtitle} onPress={()=>handleItemPress('LPN')}>LPN</Text>
                      <Text style={styles.subtitle} onPress={()=>handleItemPress('RN')}>RN</Text>
                    </View>
                  </View>
                </Modal>}
              </View>
            </View>
            <View style={[styles.btn, {marginTop: 20}]}>
              <HButton style={styles.subBtn} onPress={ handleSubmit }>
                Submit
              </HButton>
            </View>

            <Text style={{textDecorationLine: 'underline', color: '#2a53c1', marginBottom: 100}}
              onPress={handleBack}
            >
              Back to 🏚️ Caregiver Home
            </Text>
          </View>
        </View>

      </ScrollView>
      <MFooter />
    </View>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    // paddingVertical: 4,
    // paddingHorizontal: 10,
    borderRadius: 4,
    color: 'black',
    // paddingRight: 30,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 86%)',
    margin: 0,
  },
  inputAndroid: {
    fontSize: 8,
    // paddingHorizontal: 10,
    // paddingVertical: 0,
    margin: 0,
    borderRadius: 10,
    color: 'black',
    // paddingRight: 30,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 86%)',
  },
});

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    backgroundColor: 'red',
    padding: 20,
  },
  container: {
    marginBottom: 0,
    backgroundColor: '#fffff8'
  },
  scroll: {
    marginTop: 131,
  },
  backTitle: {
    backgroundColor: 'black',
    width: '90%',
    height: 55,
    marginLeft: '5%',
    position: 'absolute',
    marginTop: 10,
    borderRadius: 10
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginLeft: '5%',
    padding: 15,
    width: '90%',
    backgroundColor: 'transparent'
  },
  marker: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    marginRight: 10,
    marginTop: 17
  },
  text: {
    fontSize: 14,
    color: 'hsl(0, 0%, 29%)',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24
  },
  modal: {
    width: '90%',
    borderRadius: 10,
    margin: '5%',
    // marginBottom: 100,
    borderWidth: 1,
    borderColor: 'grey',
    overflow: 'hidden',
    shadowColor: 'black', // Shadow color
    shadowOffset: { width: 0, height: 10 }, // Shadow offset
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 3, // Shadow radius
    elevation: 0, // Elevation for Android devices
    backgroundColor: "#e3f6ff",
  },
  intro: {
    marginTop: 30
  },
  input: {
    backgroundColor: 'white', 
    height: 30, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
  },
  subject: {
    padding: 5,
    backgroundColor: '#77f9ff9c',
    borderRadius: 2,
    borderColor: 'black',
    width: '80%',
    color: 'black',
    fontWeight: 'bold',
    marginTop: 30,
    marginLeft: '10%',
    fontSize: 20,
    borderRadius: 5,
  },
  mark: {
    width: '70%',
    height: 75,
    marginLeft: '15%',
  },
  homepage: {
    // paddingHorizontal: 30,
    // paddingVertical: 70,
    width: '45%',
    height: 130,
    marginTop: 10,
    marginLeft: '25%',
  },
  subtitle: {
    fontSize: 16,
    color: 'black',
    textAlign: 'left',
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: 'bold'
  },
  middleText: {
    fontSize: 16,
    margin: 0,
    lineHeight: 16,
    color: 'black'
  },
  authInfo: {
    marginLeft: 20,
    marginRight: 20,

  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 130
  },
  btn: {flexDirection: 'column',
    gap: 20,
    marginBottom: 30,
  },
  subBtn: {
    marginTop: 0,
    padding: 10,
    backgroundColor: '#447feb',
    color: 'black',
    fontSize: 16,
  },
  drinksButton: {
    fontSize: 18,
    padding: 15,
    borderWidth: 3,
    borderColor: 'white',

  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: '#000',
  },
  signature: {
    flex: 1,
    width: '100%',
    height: 150,
  },
  chooseFile: {
    width: '30%', 
    height: 30, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'black'
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
});
