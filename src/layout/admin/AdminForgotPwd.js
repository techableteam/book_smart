import React, { useState } from 'react';
import { Alert, View, TextInput, StyleSheet, StatusBar } from 'react-native';
import { Text, } from 'react-native-paper';
import HButton from '../../components/Hbutton'
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import { useAtom } from 'jotai';
import { emailAtom } from '../../context/AdminAuthProvider';
import { ForgotPassword } from '../../utils/useApi';
import constStyles from '../../assets/styles';
import { RFValue } from "react-native-responsive-fontsize";

export default function AdminForgotPwd ({ navigation }) {
  const [email, setEmail] = useAtom(emailAtom);
  const [credentials, setCredentials] = useState(
    {
      email: '',
    }
  );

  const handleCredentials = (target, e) => {
    setCredentials({...credentials, [target]: e})
  }

  const handleSubmit = async () => {
    const response = await ForgotPassword(credentials, 'admin');

    if (!response.error) {
      console.log('success');
      setEmail(credentials.email);
      navigation.navigate('AdminPassVerify')
    } else {
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
  };

  const handleBack = () => {
    navigation.navigate('AdminLogin');
  };

  return (
      <View style={styles.container}>
        <StatusBar 
          translucent backgroundColor="transparent"
        />
        <MHeader navigation={navigation} />
        <View style={{width: '100%', height: '60%', marginTop: 50, justifyContent:'center', alignItems: 'center', display: 'flex'}}
        >
          <View style={styles.authInfo}>
            <Text style={constStyles.loginMainTitle}> Forgot Password? </Text>
            <Text style={[constStyles.loginSubTitle,{textAlign: 'left', width: '90%', fontWeight: '400', fontSize: RFValue(14)}]}>Enter your email address below and we will send you a link to reset your password. </Text>
            <View style={styles.email}>
              <Text style={constStyles.loginSubTitle}> Email Address </Text>
              <View style={{flexDirection: 'row', width: '90%', gap: 5}}>
                <TextInput
                  style={[constStyles.forgotInputText, {width: '100%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={e => handleCredentials('email', e)}
                  value={credentials.email || ''}
                />
              </View>
            </View>
            <View style={[styles.btn, {marginTop: 20}]}>
              <HButton style={constStyles.loginSubBtn} onPress={ handleSubmit }>
                Submit
              </HButton>
            </View>
            <Text style={{textDecorationLine: 'underline', color: '#2a53c1', marginBottom: 20, textAlign: 'left', width: '90%'}}
              onPress={handleBack}
            >
              Back to 🏚️ Caregiver Home
            </Text>
          </View>
        </View>
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
    fontSize: RFValue(20),
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
    height: 30, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
    paddingVertical: 5
  },
  subject: {
    borderRadius: 2,
    borderColor: 'black',
    width: '90%',
    color: 'black',
    marginTop: 30,
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
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    marginTop: 140
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
  