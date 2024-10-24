import React, { useEffect, useState } from 'react';

import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function MFooter(props) {
  const theme = useTheme();
  return (
    <View style={styles.shadow}>
      <View style={styles.bottomStyle}></View>
      <Text style={styles.text}>Support by Email: support@whybookdumb.com{'\n'}
        Support by Text: 716.997.9990
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 0,
    backgroundColor: '#290135',
    bottom: 0,
    width: '100%',
    position: 'absolute',
  },
  text: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 5,
    paddingVertical: 10,
    color: 'white',
    // fontSize: 14,
    fontSize: RFValue(13),
    textAlign: 'center',
    fontWeight: '700',
  },
  bottomStyle: {
    width: '100%',
    height: height * 0.007,
    backgroundColor: "#BC222F"
  },
  logo: {
    width: 70,
    height: 59,
  },
});
