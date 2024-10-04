import React from 'react';
import { View, Image, StyleSheet, StatusBar, SafeAreaView,  } from 'react-native';
import { Text } from 'react-native-paper';
import images from '../assets/images';
import HButton from '../components/Hbutton'
import MFooter from '../components/Mfooter';
import MHeader from '../components/Mheader';

export default function Dashboard ({ navigation }) {
  const handleClient = () => {
    navigation.navigate('ClientSignIn');
  };
    
  const handleFacility = () => {
    navigation.navigate('FacilityLogin');
  };

  return (
    <SafeAreaView  style={styles.container}>
      <StatusBar  translucent backgroundColor="transparent" />
      <MHeader navigation={navigation} />
      <Text style={styles.text}>
        Welcome to the BookSmart™ App {'\n'} where you make what you deserve!
      </Text>
      <Image
        source={images.homepage}
        style={styles.homepage}
      />
      <Text style={styles.text}>Are you looking to work or to hire?</Text>
      <View style={styles.buttonWrapper}>
        <HButton
          onPress={ handleClient }
          style={styles.button}>
          CLINICIAN
        </HButton>
        <HButton
          onPress={ handleFacility }
          style={styles.button}>
          FACILITY
        </HButton>
      </View>
      <MFooter />
    </SafeAreaView >
  )
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  homepage: {
    width: 350,
    height: 300,
    marginTop: 30,
    resizeMode: 'cover'
  },
  text: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    marginHorizontal: 5, // Replace gap with marginHorizontal
  },
});
  