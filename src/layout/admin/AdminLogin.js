import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Text, ScrollView, TouchableOpacity, Pressable, Image, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import images from '../../assets/images';
import { TextInput, useTheme } from 'react-native-paper';
import HButton from '../../components/Hbutton';
import MHeader from '../../components/Mheader';
import MFooter from '../../components/Mfooter';
import { useAtom } from 'jotai';
import { firstNameAtom, lastNameAtom, phoneAtom, emailAtom, photoImageAtom, userRoleAtom, companyNameAtom, addressAtom, passInfAtom } from '../../context/AdminAuthProvider'
import { Signin } from '../../utils/useApi';
import Loader from '../Loader';
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from 'react-native';
import constStyles from '../../assets/styles';
const { width, height } = Dimensions.get('window');

export default function AdminLogin({ navigation }) {  
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastName] = useAtom(lastNameAtom);
  const [email, setEmail] = useAtom(emailAtom);
  const [photoImage, setPhotoImage] = useAtom(photoImageAtom);
  const [userRole, setUserRole]= useAtom(userRoleAtom);
  const [phone, setPhone] = useAtom(phoneAtom);
  const [companyName, setCompanyName] = useAtom(companyNameAtom);
  const [address, setAddress]= useAtom(addressAtom);
  const [password, setPassword] = useAtom(passInfAtom)
  const [request, setRequest]= useState(false);
  const [ credentials, setCredentials ] = useState({
    email: '',
    password: '',
    userRole: 'Admin',
  });

  useEffect(() => {
    const getCredentials = async() => {
      const emails = (await AsyncStorage.getItem('AdminEmail')) || '';
      const password = (await AsyncStorage.getItem('AdminPassword')) || '';
      setCredentials({...credentials, email: emails, password: password});
    }
    getCredentials();
  }, []);

  const [checked, setChecked] = useState(false);

  //Alert
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
  }

  const handleSignInNavigate = async () => {
    if (credentials.email === '') {
      showAlert('email')
    } else if (credentials.password === '') {
      showAlert('password')
    } else {
      navigation.navigate('AdminHome');
    }
  }

  const handleSubmit = async () => {
    setRequest(true);
    try {
      const response = await Signin(credentials, 'Admin');
      if (!response.error) {
        setFirstName(response.user.firstName);
        setLastName(response.user.lastName);
        setEmail(response.user.email);
        setUserRole(response.user.userRole);
        if (checked) {
          await AsyncStorage.setItem('AdminEmail', credentials.email);
          await AsyncStorage.setItem('AdminPassword', credentials.password);
        }
        setRequest(false);
        handleSignInNavigate();
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
      setRequest(false);
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
              // onPress={() => navigation.navigate('ClientSignIn')}
              style={constStyles.loginMainButton}>
              Admin Login
            </HButton>
            <Text style={[constStyles.loginSubTitle, { color: '#2a53c1', width: '90%', textAlign: 'center', fontSize: RFValue(14)}]}>Enter your email address and password to login.</Text>
          </View>
          <View style={styles.authInfo}>
            <View>
              <Text style={constStyles.loginSubTitle}> Email Address </Text>
              <TextInput
                style={constStyles.loginTextInput}
                placeholder=""
                onChangeText={e => handleCredentials('email', e)}
                value={credentials.email || ''}
              />
            </View>
            <View style={styles.password}>
              <View style={{flexDirection: 'row', alignItems: 'bottom'}}>
                <Text style={constStyles.loginSubTitle}> Password </Text>
                <TouchableOpacity
                  onPress={() => console.log('Navigate to forget password')}>
                  <Text
                    style={[constStyles.loginSubTitle, { color: '#2a53c1'}]}
                    onPress={() => navigation.navigate('AdminForgotPwd')}>
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
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10,
                  marginTop: 10
                }}>
                <View style={styles.checkbox}>
                  {checked && <Text style={constStyles.logincheckmark}>✓</Text>}
                </View>
                <Text style={constStyles.loginMiddleText}>Remember me</Text>
              </Pressable>
            </View>
            <View style={styles.btn}>
              <HButton style={constStyles.loginSubBtn} onPress={ 
                handleSubmit 
              }>
                Sign In
              </HButton>
            </View>
          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ClientSignIn')}
            style={styles.homeBtn}
          >
            <Image source={images.homeIcon} style={{width: 20, height: 20}}/>
            <Text style={styles.homeText}>Home</Text>
          </TouchableOpacity>
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
    backgroundColor: '#777777'
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

  subtitle: {
    fontSize: 18,
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
    gap: 20,
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
    fontSize: RFValue(18)
  }
});
