import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Text, ScrollView, TouchableOpacity, Pressable, Image, StatusBar } from 'react-native';
import images from '../../assets/images';
import { TextInput } from 'react-native-paper';
import { useAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUniqueId } from 'react-native-device-info';
import { useFocusEffect } from '@react-navigation/native';
import { 
  firstNameAtom, 
  lastNameAtom, 
  emailAtom, 
  titleAtom, 
  userRoleAtom, 
  phoneNumberAtom,
  passwordAtom,
  clinicalAcknowledgeTerm,
  aicAtom
 } from '../../context/ClinicalAuthProvider';
import { Signin } from '../../utils/useApi';
import HButton from '../../components/Hbutton';
import MHeader from '../../components/Mheader';
import MFooter from '../../components/Mfooter';
import Loader from '../Loader';
import { Dimensions } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";

const { width, height } = Dimensions.get('window');

export default function ClientSignIn({ navigation }) {
  const [aic, setAIC] = useAtom(aicAtom);
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastName] = useAtom(lastNameAtom);
  const [phoneNumber, setPhoneNumber] = useAtom(phoneNumberAtom);
  const [title, setTitle] = useAtom(titleAtom);
  const [email, setEmail] = useAtom(emailAtom);
  const [userRole, setUserRole]= useAtom(userRoleAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [clinicalAcknowledgement, setClinicalAcknowledgement] = useAtom(clinicalAcknowledgeTerm);
  const [device, setDevice] = useState('');
  const [loginEmail, setLoginEmail] =  useState('');
  const [loginPW, setLoginPW] = useState('');
  const [checked, setChecked] = useState(false);
  const [request, setRequest] = useState(false);

  const fetchDeviceInfo = async () => {
    try {
      const id = await getUniqueId();
      setDevice(id);
    } catch (error) {
      console.error('Error fetching device info:', error);
    }
  };
  
  useFocusEffect(
    React.useCallback(() => {
      fetchDeviceInfo();
    }, [])
  );
  
  const handleToggle = async () => {
    setChecked(!checked);
  };

  useEffect(() => {
    const getCredentials = async() => {
      const emails = (await AsyncStorage.getItem('clinicalEmail')) || '';
      const password = (await AsyncStorage.getItem('clinicalPassword')) || '';
      setLoginEmail(emails);
      setLoginPW(password);
    }
    getCredentials();
  }, []);

  const handleSignInNavigate = (url) => {
    navigation.navigate(url);
  };

  const handleSignUpNavigate = () => {
    navigation.navigate('ClientSignUp');
  };

  const handleSubmit = async () => {
    if (loginEmail == "") {
      Alert.alert(
        'Warning!',
        "Please enter your email",
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

    if (loginPW == "") {
      Alert.alert(
        'Warning!',
        "Please enter password",
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
      console.log(device)
      const response = await Signin({ email: loginEmail, password: loginPW, device: device, userRole: 'Clinician' }, 'clinical');
      if (response?.user) {
        setRequest(false);
        setAIC(response.user.aic);
        setFirstName(response.user.firstName);
        setLastName(response.user.lastName);
        setEmail(response.user.email);
        setTitle(response.user.title);
        setPhoneNumber(response.user.phoneNumber);
        setUserRole(response.user.userRole);
        setClinicalAcknowledgement(response.user.clinicalAcknowledgeTerm);
        setPassword(response.user.password);

        await AsyncStorage.setItem('clinicalPhoneNumber', response.user.phoneNumber);

        if (checked) {
          await AsyncStorage.setItem('clinicalEmail', loginEmail);
          await AsyncStorage.setItem('clinicalPassword', loginPW);
        }

        if (response.user.clinicalAcknowledgeTerm) {
          if (response.phoneAuth) {
            handleSignInNavigate('ClientPhone');
          } else {
            handleSignInNavigate('MyHome');
          }
        } else {
          handleSignInNavigate('ClientPermission');
        }
      } else {
        setRequest(false);
        if (response.error.status == 401) {
          Alert.alert(
            'Failed!',
            "Sign in informaation is incorrect.",
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
            "You are not approved! Please wait.",
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
        }
      }
    } catch (error) {
      setRequest(false);
      console.log('SignIn failed: ', JSON.stringify(error))
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
      <StatusBar  translucent backgroundColor="transparent" />
      <MHeader navigation={navigation}/>
      <ScrollView style = {styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modal}>
          <View style={styles.topBar} />
          <View style={styles.intro}>
            <Image
              source={images.mark}
              resizeMode="contain"
              style={styles.mark}
            />
            <Text style={styles.title}>WHY BOOK DUMB?</Text>
            <Image
              source={images.homepage}
              resizeMode="contain"
              style={styles.homepage}
            />
            <Text style={styles.text}>Let your licensure and certifications pay off. {'\n'}
              Get the money you deserve by signing up {'\n'}
              and becoming a freelance clinician today!
            </Text>
          </View>
          <View style={styles.authInfo}>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Email Address </Text>
              <TextInput
                style={{ backgroundColor: 'white', height: 40, marginBottom: 10, borderWidth: 1, borderColor: 'hsl(0, 0%, 86%)'}}
                placeholder=""
                onChangeText={e => setLoginEmail(e)}
                value={loginEmail || ''}
              />
            </View>
            <View style={styles.password}>
              <View style={{flexDirection: 'row', alignItems: 'bottom'}}>
                <Text style={styles.subtitle}> Password </Text>
                <TouchableOpacity
                  onPress={() => console.log('Navigate to forget password')}>
                  <Text
                    style={[styles.subtitle, { color: '#2a53c1'}]}
                    onPress={() => navigation.navigate('ClientForgotPwd')}>
                    {'('}forgot?{')'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={{ backgroundColor: 'white', height: 40, borderWidth: 1, borderColor: 'hsl(0, 0%, 86%)'}}
                placeholder=""
                onChangeText={e => setLoginPW(e)}
                secureTextEntry={true}
                value={loginPW || ''}
              />
              <Pressable 
                onPress={handleToggle}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10,
                  marginTop: 10
                }}>
                <View style={styles.checkbox}>
                  {checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.middleText}>Remember me</Text>
              </Pressable>
            </View>
            <View style={styles.btn}>
              <HButton style={styles.subBtn} onPress={ handleSubmit }>
                Sign In
              </HButton>
              <Text style={styles.middleText}>Need an account?</Text>
              <HButton style={styles.subBtn} onPress={ handleSignUpNavigate }>
                Sign Up
              </HButton>
            </View>
          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <HButton
            onPress={() => navigation.navigate('AdminLogin')}
            style={styles.drinksButton}>
            Admin Login
          </HButton>
          <HButton
            onPress={() => navigation.navigate('FacilityLogin')}
            style={styles.drinksButton}>
            Facilities Home
          </HButton>
        </View>
      </ScrollView>
      <Loader visible={request}/>
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
    marginTop: height * 0.157,
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
  },
  topBar: {
    width: '100%',
    height: 20,
    backgroundColor: 'hsl(0, 0%, 29%)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  intro: {
    flex: 1,
    alignItems: 'center',
    marginTop: 30
  },
  mark: {
    width: width * 0.65,
    height: height * 0.1,
    marginLeft: '15%',
  },
  homepage: {
    width: width * 0.5,
    height: height * 0.25,
    marginTop: 10,
  },
  text: {
    fontSize: RFValue(12),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: RFValue(22),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: RFValue(17),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'left',
    paddingTop: 10,
    paddingBottom: 10,
  },
  middleText: {
    fontSize: RFValue(15),
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
    gap: RFValue(10),
    marginBottom: RFValue(130)
  },
  btn: {flexDirection: 'column',
    gap: RFValue(20),
    marginBottom: RFValue(30),
  },
  subBtn: {
    padding: RFValue(10),
    backgroundColor: '#DF1828FF',
    color: 'white',
    fontSize: RFValue(15),
  },
  drinksButton: {
    fontSize: RFValue(14),
    padding: RFValue(15),
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 0

  },
  checkbox: {
    width: RFValue(20),
    height: RFValue(20),
    borderWidth: RFValue(1),
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: RFValue(10),
  },
  checkmark: {
    color: '#000',
  },
});
