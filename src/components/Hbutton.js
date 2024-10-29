import { TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Text } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
export default function HButton({
  children,
  mode = 'contained',
  style,
  ...props
}) {
  return (
    // <TouchableOpacity {...props} accessible={true} accessibilityLabel={children}>
    //   <Text style={[styles.text, style]}>
    //     {children}
    //   </Text>
    // </TouchableOpacity>
    <TouchableOpacity 
      {...props} 
      accessible={true} 
      accessibilityLabel={typeof children === 'string' ? children : 'Button'}
    >
      <Text style={[styles.text, style]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: RFValue(16),
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    borderRadius: 10,
    backgroundColor: '#A020F0',
    padding: RFValue(12),
    marginTop: RFValue(10),
    width: width * 0.45,
  }
});
