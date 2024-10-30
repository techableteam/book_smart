import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Alert, View, TextInput, StyleSheet, StatusBar, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native-paper';
import HButton from '../../components/Hbutton'
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import { emailAtom } from '../../context/ClinicalAuthProvider';
import { verifyPhoneAtom } from '../../context/BackProvider';
import { PhoneSms } from '../../utils/useApi';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function ClientPhone ({ navigation }) {
  const [verifyPhone, setVerifyPhone] = useAtom(verifyPhoneAtom);
  const [email, setEmail] = useAtom(emailAtom);
  const [isAlreadyHas, setIsAlreadyHas] = useState(false);
  const [credentials, setCredentials] = useState({
    phoneNumber: '',
  });

  useEffect(() => {
    const getCredentials = async() => {
      const phoneNumber = await AsyncStorage.getItem('clinicalPhoneNumber') || '';
      if (phoneNumber !== '') {
        setIsAlreadyHas(true);
      } else {
        setIsAlreadyHas(false);
      }
      const formattedNumber = formatPhoneNumber(phoneNumber);
      setCredentials({...credentials, phoneNumber: formattedNumber});
    }
    getCredentials();
  }, []);
  
  const handleCredentials = (target, e) => {
    setCredentials({...credentials, [target]: e});
  }

  const formatPhoneNumber = (input) => {
    const cleaned = input.replace(/\D/g, '');

    if (cleaned.length === 1 || cleaned.length === 2) {
        return cleaned;
    }

    // Apply the desired phone number format
    let formattedNumber = '';
    if (cleaned.length >= 3) {
        formattedNumber = `(${cleaned.slice(0, 3)})`;
    }
    if (cleaned.length > 3) {
        formattedNumber += ` ${cleaned.slice(3, 6)}`;
    }
    if (cleaned.length > 6) {
        formattedNumber += `-${cleaned.slice(6, 10)}`;
    }
    // replace
    // formattedNumber = '(***) ***-' + cleaned.slice(6, 10);
    return formattedNumber;
  };

  const handlePhoneNumberChange = (text) => {
    const formattedNumber = formatPhoneNumber(text);
    handleCredentials('phoneNumber', formattedNumber);
  };

  const handleSubmit = async () => {
    if (credentials.phoneNumber) {
      const response = await PhoneSms({phoneNumber: credentials.phoneNumber, email: email}, 'clinical');
      console.log(response)
      if (!response.error) {
        console.log('success');
        setVerifyPhone(credentials.phoneNumber);      
        console.log(credentials.phoneNumber);
        
        navigation.navigate('ClientPhoneVerify')
      }
      else {
        Alert.alert(
          'Failed!',
          `${response.error}`,
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
  };

  const handleBack = () => {
    navigation.navigate('ClientSignIn');
  };

  return (
      <View style={styles.container}>
        <StatusBar 
          translucent backgroundColor="transparent"
        />
        <MHeader navigation={navigation} />
        <ScrollView style={{width: '100%', height: '60%', marginTop: height * 0.15}}>
          <View style={styles.authInfo}>
            <Text style={styles.subject}> 2FA Authentication </Text>
            <Text style={[styles.subtitle,{textAlign: 'left', width: '90%', fontWeight: '400', fontSize: RFValue(16)}]}>Click the submit button below and we'll send a verification code to your registered phone number for login. </Text>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Phone Number </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                {isAlreadyHas ? 
                (
                  <Text style={[styles.input, {width: '100%', color: 'black', padding: 10}]}>{"(***) ***-" + credentials.phoneNumber.slice(10, 14)}</Text>
                ) : (
                  <TextInput
                    placeholder=""
                    value={credentials.phoneNumber}
                    style={[styles.input, {width: '100%', color: 'black'}]}
                    onChangeText={(e) =>handlePhoneNumberChange(e)}
                    keyboardType="phone-pad"
                    editable={false}
                  />
                )}
              </View>
            </View>
            <View style={[styles.btn, {marginTop: 20}]}>
              <HButton style={styles.subBtn} onPress={ handleSubmit }>
                Submit
              </HButton>
            </View>
            <Text style={{textDecorationLine: 'underline', color: '#2a53c1', marginBottom: 100, fontSize: RFValue(16), textAlign: 'left', width: '90%'}}
              onPress={handleBack}
            >
              Back to 🏚️ Caregiver Home
            </Text>
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
    width: '100%',
    backgroundColor: '#cccccc'
  },
  text: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
  },
  subtitle: {
    fontSize: RFValue(16),
    color: 'black',
    textAlign: 'left',
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: 'white', 
    height: 40,
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
    paddingVertical: 5,
    fontSize: RFValue(11)
  },
  subject: {
    borderRadius: 2,
    borderColor: 'black',
    width: '90%',
    color: 'black',
    marginTop: RFValue(30),
    fontSize: RFValue(24),
    borderRadius: 5,
  },
  email: {
    width: '90%',
  },
  authInfo: {
    display:'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '90%',
    marginLeft: '5%',
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    marginTop: 50,
    marginBottom: 150
  },
  btn: {flexDirection: 'column',
    gap: 20,
    marginBottom: 30,
    width: '90%'
  },
  subBtn: {
    marginTop: 0,
    padding: 10,
    backgroundColor: '#A020F0',
    color: 'white',
    fontSize: RFValue(16),
  },
});
  