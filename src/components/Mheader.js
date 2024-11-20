import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import images from '../assets/images';

const { width, height } = Dimensions.get('window');
export default function MHeader({back}) {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <Card style={styles.shadow}>
      <View style={styles.textContainer} >
        {back ? (
          <TouchableOpacity onPress={handleBack} style={{ zIndex: 12000 }}>
            <Image source={images.back} style={{ width: 30, height: 40 }} />
          </TouchableOpacity>
        ) : (
          <View></View>
        )}
        <Text style={styles.text}>BookSmart™</Text>
        <View></View>
      </View>
      <View style={styles.bottomStyle}></View>
    </Card>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 0,
    backgroundColor: '#290135',
    width: '100%',
    minHeight: height * 0.15,
    top: 0,
    position: 'absolute',
    zIndex: 11111
  },
  textContainer: {
    width: '100%',
    minHeight: height * 0.143,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 5,
  },
  text: {
    color: 'white',
    fontSize: RFValue(25)
  },
  bottomStyle: {
    width: '100%',
    height: height * 0.007,
    backgroundColor: "#BC222F"
  },
});
