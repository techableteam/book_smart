import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function MFooter() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleEmailPress = async () => {
    const emailUrl = 'mailto:support@booksmart.app';
    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) await Linking.openURL(emailUrl);
      else console.log('Email URL is not supported');
    } catch (error) {
      console.error('Error opening email URL:', error);
    }
  };

  const handleSMSPress = () => {
    const phoneUrl = 'sms:+18445582665';
    Linking.openURL(phoneUrl);
  };

  return (
    <View style={[styles.shadow, { paddingBottom: Math.max(13, insets.bottom + 8) }]}>
      <View style={styles.bottomStyle} />

      <View style={{ marginTop: 5, paddingHorizontal: 8 }}>
        <View style={styles.supportRow}>
          <Text style={styles.generalText} maxFontSizeMultiplier={1.2}>
            Support by Email:
          </Text>
          <TouchableOpacity onPress={handleEmailPress}>
            <Text
              style={styles.emailText}
              numberOfLines={1}
              ellipsizeMode="middle"
              minimumFontScale={0.8}
              maxFontSizeMultiplier={1.2}
            >
              support@booksmart.app
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.supportRow}>
          <Text style={styles.generalText} maxFontSizeMultiplier={1.2}>
            Support by Text:
          </Text>
          <TouchableOpacity onPress={handleSMSPress}>
            <Text
              style={styles.smsText}
              numberOfLines={1}
              ellipsizeMode="tail"
              minimumFontScale={0.9}
              maxFontSizeMultiplier={1.2}
            >
              # 844.558.BOOK
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  supportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap', // allow label/value to wrap if needed
  },
  shadow: {
    borderRadius: 0,
    backgroundColor: '#290135',
    bottom: 0,
    width: '100%',
    position: 'absolute',
  },
  bottomStyle: {
    width: '100%',
    height: height * 0.007,
    backgroundColor: '#BC222F',
  },
  emailText: {
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: RFValue(11),
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 1,
    flexShrink: 1,        // let long text shrink
    maxWidth: '100%',
    lineHeight: RFValue(16),
  },
  smsText: {
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: RFValue(11),
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 1,
    flexShrink: 1,
    maxWidth: '100%',
    lineHeight: RFValue(16),
  },
  generalText: {
    color: 'white',
    fontSize: RFValue(11),
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 1,
    paddingTop: 2,
    lineHeight: RFValue(16),
  },
});
