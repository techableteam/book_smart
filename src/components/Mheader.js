import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
export default function MHeader({props, navigation}) {
  return (
    <Card style={styles.shadow}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>BookSmart™</Text>
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
    position:'absolute',
  },
  textContainer: {
    width: '100%',
    display: 'flex',
    minHeight: height * 0.143,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30
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
