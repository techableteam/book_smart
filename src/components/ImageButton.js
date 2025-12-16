import { TouchableOpacity, StyleSheet, Image, PixelRatio } from 'react-native';
import React from 'react';
import { Text } from 'react-native-paper';
import images from '../assets/images';
import { RFValue } from 'react-native-responsive-fontsize';

const pixelRatio = PixelRatio.getFontScale();

export default function ImageButton({
  title,
  style,
  ...props
}) {
  const image = {
    "My Profile": images.profile,
    "Electronic Timesheet": images.checkList,
    "Contractor Invoice": images.checkList,
    "My Shifts": images.shift,
    "My Reporting": images.reporting,
    "My Home": images.home,
    "POST SHIFT": images.post,
    "VIEW / EDIT SHIFTS": images.view,
    "APPROVE SHIFTS": images.approve,
    "TEAM SCHEDULER": images.approveTime
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
    width: RFValue(105),
    height: RFValue(115),
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
    width: RFValue(40),
    height: RFValue(40),
  },
  text: {
    fontSize:  pixelRatio > 1.5 ? RFValue(9) : RFValue(14),
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  }
});
