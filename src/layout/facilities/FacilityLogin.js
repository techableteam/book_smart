import { StyleSheet, View, Alert, Text, ScrollView, TouchableOpacity, Pressable, Image, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import images from '../../assets/images';
import { TextInput } from 'react-native-paper';
import HButton from '../../components/Hbutton';
import MHeader from '../../components/Mheader';
import MFooter from '../../components/Mfooter';
import { useAtom } from 'jotai';
import { facilityIdAtom, firstNameAtom, lastNameAtom, facilityAcknowledgementAtom, companyNameAtom, contactPhoneAtom, contactPasswordAtom, entryDateAtom, addressAtom,  contactEmailAtom, avatarAtom, userRoleAtom, passwordAtom } from '../../context/FacilityAuthProvider'
import { Signin } from '../../utils/useApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../Loader';
import constStyles from '../../assets/styles';
import { Dimensions } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";

const { width, height } = Dimensions.get('window');

export default function FacilityLogin({ navigation }) {  
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastName] = useAtom(lastNameAtom);
  const [companyName, setCompanyName] = useAtom(companyNameAtom);
  const [contactPhone, setContactPhone] = useAtom(contactPhoneAtom);
  const [contactPassword, setContactPassword] = useAtom(contactPasswordAtom);
  const [entryDate, setEntryDate] = useAtom(entryDateAtom);
  const [contactEmail, setContactEmail] = useAtom(contactEmailAtom);
  const [avatar, setAvatar] = useAtom(avatarAtom);
  const [userRole, setUserRole]= useAtom(userRoleAtom);
  const [address, setAddress]= useAtom(addressAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [facilityId, setFacilityID] = useAtom(facilityIdAtom);
  const [facilityAcknowledgement, setFacilityAcknowledgement] = useAtom(facilityAcknowledgementAtom);
  const [ credentials, setCredentials ] = useState({
    contactEmail: '',
    password: '',
    userRole: 'Facilities',
  })
  const [checked, setChecked] = useState(false);
  const [request, setRequest] = useState(false);

  useEffect(() => {
    const getCredentials = async() => {
      const emails = (await AsyncStorage.getItem('facilityEmail')) || '';
      const password = (await AsyncStorage.getItem('facilityPassword')) || '';
      setCredentials({...credentials, contactEmail: emails, password: password});
    }
    getCredentials();
  }, []);

  const showAlert = (name) => {
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
  
  const handleToggle = () => {
    setChecked(!checked);
  };

  const handleCredentials = (target, e) => {
    setCredentials({...credentials, [target]: e});
  };

  const handleSignInNavigate = () => {
    if (credentials.contactEmail === '') {
      showAlert('email')
    } else if (credentials.password === '') {
      showAlert('password')
    } else {
      navigation.navigate('FacilityPermission');
    }
  };

  const handleSignUpNavigate = () => {
    navigation.navigate('FacilitySignUp');
  };

  const handleSubmit = async () => {
    if(credentials.contactEmail == ""){
      Alert.alert(
        'Warning!',
        "Please enter your email address.",
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
      return;
    }

    if(credentials.password == ""){
      Alert.alert(
        'Warning!',
        "Please enter your password.",
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
      return;
    }

    try {
      setRequest(true);
      const response = await Signin(credentials, 'facilities');

      if (!response.error) {
        setRequest(false);
        setFacilityID(response.user.aic);
        setFirstName(response.user.firstName);
        setLastName(response.user.lastName);
        setContactEmail(response.user.contactEmail);
        setContactPassword(response.user.contactPassword);
        setContactPhone(response.user.contactPhone);
        setEntryDate(response.user.entryDate);
        setCompanyName(response.user.companyName);
        setAddress(response.user.address);
        setAvatar(response.user.avatar);
        setUserRole(response.user.userRole);
        setFacilityAcknowledgement(response.user.facilityAcknowledgeTerm)
        setPassword(response.user.password);

        if (checked) {
          await AsyncStorage.setItem('facilityEmail', credentials.contactEmail);
          await AsyncStorage.setItem('facilityPassword', credentials.password);
        }

        if (response.user.facilityAcknowledgeTerm) {
          navigation.navigate("FacilityProfile");
        } else {
          handleSignInNavigate("FacilityPermission");
        }
      } else {
        setRequest(false);
        if (response.error.status == 401) {
          Alert.alert(
            'Failed!',
            "Login information is incorrect.",
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
        } else if (response.error.status == 400) {
          Alert.alert(
            'Failed!',
            "Cannot logined User!",
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
        } else if (response.error.status == 404) {
          Alert.alert(
            'Failed!',
            "User Not Found! Please Register First.",
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
        } else if (response.error.status == 402) {
          Alert.alert(
            'Failed!',
            "You are not approved! Please wait until the admin accept you.",
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
        } else {
          Alert.alert(
            'Failed!',
            "Network Error",
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
        }
      }
    } catch (error) {
      console.log('SignIn failed: ', error);
      Alert.alert(
        'Failed!',
        "Network Error",
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
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent"/>
      <MHeader navigation={navigation}/>
      <ScrollView style = {styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modal}>
          <View style={styles.topBar} />
          <View style={styles.intro}>
            <Image
              source={images.admin}
              resizeMode="contain"
              style={styles.mark}
            />
            <Text style={constStyles.loginMainTitle1}>WHERE CARE MEETS CONNECTION</Text>
            <HButton
              style={constStyles.loginMainButton}>
              FACILITIES
            </HButton>
            <Text style={[constStyles.loginSubTitle, { color: '#2a53c1', width: '90%', textAlign: 'center', fontSize: RFValue(14)}]}>Register or Enter your email address and password to login.</Text>
          </View>
          <View style={styles.authInfo}>
            <View style={styles.email}>
              <Text style={constStyles.loginSubTitle}> Email Address </Text>
              <TextInput
                style={constStyles.loginTextInput}
                placeholder=""
                onChangeText={e => handleCredentials('contactEmail', e)}
                value={credentials.contactEmail || ''}
              />
            </View>
            <View style={styles.password}>
              <View style={{flexDirection: 'row', alignItems: 'bottom'}}>
                <Text style={constStyles.loginSubTitle}> Password </Text>
                <TouchableOpacity
                  onPress={() => console.log('Navigate to forget password')}>
                  <Text
                    style={[constStyles.loginSubTitle, { color: '#2a53c1'}]}
                    onPress={() => navigation.navigate('FacilityForgotPwd')}>
                    {'('}forgot?{')'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={constStyles.loginTextInput}
                placeholder=""
                onChangeText={e => handleCredentials('password', e)}
                secureTextEntry={true}
                value={credentials.password || ''}
              />
              <Pressable 
                onPress={handleToggle}
                style={{flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: RFValue(10),
                  marginTop: RFValue(10)}}>
                <View style={styles.checkbox}>
                  {checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={constStyles.loginMiddleText}>Remember me</Text>
              </Pressable>
            </View>
            <View style={styles.btn}>
              <HButton style={constStyles.loginSubBtn} onPress={ 
                handleSubmit}>
                Sign In
              </HButton>
              <View style = {{marginTop : RFValue(20)}}/>
              <Text style={constStyles.loginMiddleText}>Need an account?</Text>
              <View style = {{marginTop : RFValue(5)}}/>
              <HButton style={constStyles.loginSubBtn} onPress={ handleSignUpNavigate }>
                Sign Up
              </HButton>
            </View>
          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <HButton
            onPress={() => navigation.navigate('Home')}
            style={constStyles.loginMainButton}>
            Main Home
          </HButton>
        </View>
      </ScrollView>
      {<Loader visible={request}/>}
      <MFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    backgroundColor: 'red',
    padding: 20,
  },
  container: {
    marginBottom: 0,
  },
  scroll: {
    marginTop: height * 0.15,
  },
  modal: {
    width: '90%',
    borderRadius: 10,
    margin: '5%',
    borderWidth: 1,
    borderColor: 'grey',
    overflow: 'hidden',
    shadowColor: 'black', // Shadow color
    shadowOffset: { width: 0, height: 10 }, // Shadow offset
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 3, // Shadow radius
    elevation: 0, // Elevation for Android devices
    backgroundColor: '#f2f2f2'
  },
  topBar: {
    width: '100%',
    height: 20,
    backgroundColor: 'hsl(0, 0%, 29%)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  intro: {
    marginTop: 30,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mark: {
    width: width * 0.5,
    height: height * 0.28,
  },
  homepage: {
    // paddingHorizontal: 30,
    // paddingVertical: 70,
    width: '45%',
    height: 130,
    marginTop: 10,
    marginLeft: '25%',
  },
  text: {
    fontSize: 12,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: RFValue(18),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: RFValue(10),
  },
  subtitle: {
    fontSize: RFValue(18),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'left',
    paddingTop: 10,
    paddingBottom: 10,
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
    marginBottom: 30,
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
    fontSize: 13,
    color: '#000',
  },
  homeBtn: {
    marginTop: 20,
    backgroundColor: 'black',
    borderRadius: 30,
    borderColor: 'white',
    borderWidth: 2,
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  homeText: {
    color: 'white',
    fontSize: 18
  }
});
