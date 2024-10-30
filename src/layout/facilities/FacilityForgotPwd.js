import React, { useState } from 'react';
import { Alert, View, TextInput, StyleSheet, StatusBar, Dimensions, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import HButton from '../../components/Hbutton'
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import { useAtom } from 'jotai';
import { contactEmailAtom } from '../../context/FacilityAuthProvider';
import { ForgotPassword } from '../../utils/useApi';
import { RFValue } from 'react-native-responsive-fontsize';
import constStyles from '../../assets/styles';

const { width, height } = Dimensions.get('window');

export default function FacilityForgotPwd ({ navigation }) {
  const [email, setEmail] = useAtom(contactEmailAtom);

  const [credentials, setCredentials] = useState(
    {
      contactEmail: '',
    }
  );

  const handleCredentials = (target, e) => {
    setCredentials({...credentials, [target]: e})
  }

  const handleSubmit = async () => {
    const response = await ForgotPassword(credentials, 'facilities');

    if (!response.error) {
      console.log('success');
      setEmail(credentials.contactEmail);
      navigation.navigate('FacilityPassVerify')
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
    navigation.navigate('FacilityLogin');
  };

  return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent"/>
        <MHeader navigation={navigation} />
        <ScrollView style={{width: '100%', height: '60%', marginTop: height * 0.15}}>
          <View style={styles.authInfo}>
            <Text style={constStyles.loginMainTitle}> Forgot Password ?</Text>
            <Text style={[constStyles.loginSubTitle,{textAlign: 'left', width: '90%', fontWeight: '400', fontSize: RFValue(14)}]}>Enter your email address below and we will send you a link to reset your password. </Text>
            <View style={styles.email}>
              <Text style={constStyles.loginSubTitle}> Email Address </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[constStyles.forgotInputText, {width: '90%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={e => handleCredentials('contactEmail', e)}
                  value={credentials.contactEmail || ''}
                />
              </View>
            </View>
            <View style={[styles.btn, {marginTop: 20}]}>
              <HButton style={[constStyles.loginSubBtn, {backgroundColor: '#A020F0'}]} onPress={ handleSubmit }>
                Submit
              </HButton>
            </View>
            <Text style={{textDecorationLine: 'underline', color: '#2a53c1', marginBottom: 100, textAlign: 'left', width: '90%'}}
              onPress={handleBack}
            >
              Back to 🏚️ Facility Login
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

  authInfo: {
    display:'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '90%',
    marginLeft: '5%',
    borderRadius: RFValue(20),
    backgroundColor: '#F2F2F2',
    marginBottom: 150,
    marginTop: 30
  },
  
  btn: {
    flexDirection: 'column',
    marginBottom: RFValue(30),
    width: '90%'
  },
});
  