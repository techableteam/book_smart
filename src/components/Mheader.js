import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
export default function MHeader({props, navigation}) {
  return (
    <Card style={styles.shadow}>
      <Text style={styles.text}>BookSmart™</Text>
      <View style={styles.bottomStyle}></View>
    </Card>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 0,
    backgroundColor: '#290135',
    width: '100%',
    height: height * 0.15,
    top: 0,
    position:'absolute',
  },
  text: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingVertical: 10,
    color: 'white',
    fontSize: RFValue(25),
    textAlign: 'center',
  },
  bottomStyle: {
    width: '100%',
    height: height * 0.007,
    backgroundColor: "#BC222F"
  },
});
