import { TouchableOpacity, StyleSheet, Image, ToastAndroid } from 'react-native';
import React from 'react';
import { Text } from 'react-native-paper';
import images from '../assets/images';
import { RFValue } from 'react-native-responsive-fontsize';

export default function ImageButton({
  title,
  style,
  ...props
}) {
  const image = {
    "My Profile": images.profile,
    "All Shift Listings": images.checkList,
    "My Shifts": images.shift,
    "My Reporting": images.reporting,
    "My Home": images.home,
    "POST SHIFT": images.post,
    "VIEW / EDIT SHIFTS": images.view,
    "APPROVE SHIFTS": images.approve,
    "APPROVE TIMESHEETS": images.approveTime
  };
  return (
    <TouchableOpacity style={styles.button} {...props}>
      <Image source={image[title]} style={styles.image}/>
      <Text style={[styles.text, style]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: RFValue(130),
    height: RFValue(130),
    borderRadius: RFValue(20),
    backgroundColor: "#A020F0",
    borderColor: 'white',
    borderWidth: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  image: {
    width: RFValue(50),
    height: RFValue(50),
  },
  text: {
    fontSize: RFValue(16),
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  }
});
