import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Dimensions, Image, Alert, Button } from 'react-native';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import Hyperlink from 'react-native-hyperlink';
import { Dropdown } from 'react-native-element-dropdown';
import SignatureCapture from 'react-native-signature-capture';
import images from '../../assets/images';
import HButton from '../../components/Hbutton';
import { Update, getPublishedTerms, sendFCMToken } from '../../utils/useApi';
import { RFValue } from 'react-native-responsive-fontsize';
import { useAtom } from 'jotai';
import { facilityIdAtom, contactEmailAtom, facilityAcknowledgementAtom } from '../../context/FacilityAuthProvider';
import Loader from '../Loader';
import messaging from '@react-native-firebase/messaging';
import { WebView } from 'react-native-webview';
import { formatTermsContent } from '../../utils/formatTermsContent';

const { width, height } = Dimensions.get('window');

export default function FacilityNewTerms({ navigation }) {
  const [facilityId] = useAtom(facilityIdAtom);
  const [contactEmail] = useAtom(contactEmailAtom);
  const [facilityAcknowledgement, setFacilityAcknowledgement] = useAtom(facilityAcknowledgementAtom);
  
  const items = [
    { label: 'Yes', value: 1 },
    { label: 'No', value: 2 },
  ];
  const [checked, setChecked] = useState('first');
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [termsContent, setTermsContent] = useState('');
  const [termsVersion, setTermsVersion] = useState('');
  const [termsPublishedDate, setTermsPublishedDate] = useState('');
  const [webViewHeight, setWebViewHeight] = useState(200);
  
  const [credentials, setCredentials] = useState({
    signature: '',
    facilityAcknowledgeTerm: facilityAcknowledgement,
    selectedoption: 'first'
  });
  const [fToken, setFToken] = useState('');
  const signatureRef = useRef(null);

  // Get FCM token on component mount
  useEffect(() => {
    const getFCMMsgToken = async () => {
      try {
        const token = await messaging().getToken();
        if (token) {
          console.log("FCM Token in FacilityNewTerms:", token);
          setFToken(token);
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };
    getFCMMsgToken();
  }, []);

  // Load published terms from API
  useEffect(() => {
    const loadTerms = async () => {
      try {
        setLoading(true);
        // Pass email to ensure correct database is used
        const response = await getPublishedTerms('facility', contactEmail);
        if (response.error) {
          // No terms available - show alert and go back to login
          Alert.alert(
            'No Terms Available',
            'There are no terms of service available at this time. Please wait for the administrator to publish terms.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('FacilityLogin');
                }
              }
            ],
            { cancelable: false }
          );
          console.error('Error loading terms:', response.error);
        } else if (response.terms) {
          setTermsContent(response.terms.content || '');
          setTermsVersion(response.terms.version || '');
          setTermsPublishedDate(response.terms.publishedDate || '');
        } else {
          // No terms found - show alert and go back to login
          Alert.alert(
            'No Terms Available',
            'There are no terms of service available at this time. Please wait for the administrator to publish terms.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('FacilityLogin');
                }
              }
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error('Error loading terms:', error);
        Alert.alert(
          'No Terms Available',
          'There are no terms of service available at this time. Please wait for the administrator to publish terms.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('FacilityLogin');
              }
            }
          ],
          { cancelable: false }
        );
      } finally {
        setLoading(false);
      }
    };
    loadTerms();
  }, []);

  const onSaveEvent = (result) => {
    setTimeout(() => {
      setCredentials(prev => ({
        ...prev,
        signature: result.encoded
      }));
      setIsSigned(true);
      setIsSaving(false);
    }, 100);
  };

  const handleReset = () => {
    signatureRef.current?.resetImage();
    setIsSigned(false);
    setIsSaving(false);
    setCredentials(prev => ({
      ...prev,
      signature: ''
    }));
  };

  const handlePreSubmit = () => {
    if (value === null || value === undefined) {
      Alert.alert('Warning!', 'Please select "Yes" or "No" to acknowledge the terms.');
      return;
    }
    
    if (value !== 1) {
      Alert.alert('Warning!', 'Please select "Yes" to accept the terms.');
      return;
    }
    
    if (!isSigned) {
      Alert.alert('Warning!', 'Please sign and click Save button');
      return;
    }
    
    handleUploadSubmit();
  };

  const handleUploadSubmit = async () => {
    if (value === null || value === undefined) {
      Alert.alert('Error', 'Please select an acknowledgment option.');
      return;
    }
    
    if (value === 1 && !credentials.signature) {
      Alert.alert('Error', 'Please provide a signature.');
      setIsSaving(false);
      return;
    }
    
    setIsSaving(true);
    try {
      const updateData = {
        aic: facilityId,
        signature: credentials.signature || '',
        facilityAcknowledgeTerm: value === 1,
        selectedoption: checked
      };

      const response = await Update(updateData, 'facilities');
      
      if (!response.error) {
        // Save FCM token after successful terms acceptance
        if (fToken && contactEmail && value === 1) {
          try {
            await sendFCMToken({ email: contactEmail, token: fToken }, 'facilities');
            console.log('FCM token saved after terms acceptance');
          } catch (fcmError) {
            console.error('Error saving FCM token:', fcmError);
            // Don't fail the terms acceptance if FCM token save fails
          }
        }
        
        setFacilityAcknowledgement(value === 1);
        Alert.alert(
          'Success!',
          value === 1 ? 'Terms accepted successfully!' : 'Terms declined.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (value === 1) {
                  navigation.navigate('FacilityProfile');
                } else {
                  navigation.navigate('FacilityLogin');
                }
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to update. Please try again.');
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error updating terms:', error);
      Alert.alert('Error', 'Failed to update. Please try again.');
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <MHeader navigation={navigation} back={true} />
      <SubNavbar navigation={navigation} name={"FacilityLogin"} />
      <ScrollView style={{ width: '100%', marginTop: height * 0.22 }} showsVerticalScrollIndicator={false}>
        <Hyperlink linkDefault={true}>
          <View style={styles.permission}>
            <View style={styles.titleBar}>
              <Text style={styles.title}>BOOKSMART™ TERMS OF USE</Text>
              {termsVersion && (
                <Text style={styles.versionText}>Version {termsVersion}</Text>
              )}
              {termsPublishedDate && (
                <Text style={styles.dateText}>Published: {formatDate(termsPublishedDate)}</Text>
              )}
              <View style={styles.termsContentWrapper}>
                <WebView
                  source={{ html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        * {
                          margin: 0;
                          padding: 0;
                          box-sizing: border-box;
                        }
                        body {
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          font-size: ${RFValue(14)}px;
                          line-height: 1.6;
                          color: black;
                          padding: 0;
                          margin: 0;
                          width: 100%;
                        }
                        p { 
                          margin: 0;
                          margin-bottom: 20px;
                          font-size: ${RFValue(14)}px;
                        }
                        div {
                          font-size: ${RFValue(14)}px;
                        }
                        strong, b { 
                          font-weight: bold;
                          font-size: ${RFValue(14)}px;
                        }
                        em, i { 
                          font-style: italic;
                          font-size: ${RFValue(14)}px;
                        }
                        u { 
                          text-decoration: underline;
                          font-size: ${RFValue(14)}px;
                        }
                        ul, ol { 
                          margin: 10px 0; 
                          padding-left: 20px;
                          font-size: ${RFValue(14)}px;
                        }
                        li { 
                          margin: 5px 0;
                          font-size: ${RFValue(14)}px;
                        }
                        h1, h2, h3, h4, h5, h6 { 
                          margin: 15px 0 10px 0; 
                          font-weight: bold;
                          font-size: ${RFValue(14)}px;
                        }
                      </style>
                    </head>
                    <body>
                      ${formatTermsContent(termsContent || 'Loading terms...', RFValue(14))}
                    </body>
                    </html>
                  ` }}
                  style={[styles.termsWebView, { height: webViewHeight }]}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={false}
                  onMessage={(event) => {
                    try {
                      const data = JSON.parse(event.nativeEvent.data);
                      if (data.type === 'content-height') {
                        setWebViewHeight(data.height);
                      }
                    } catch (e) {
                      console.error('Error parsing WebView message:', e);
                    }
                  }}
                  injectedJavaScript={`
                    (function() {
                      function updateHeight() {
                        const height = Math.max(
                          document.body.scrollHeight,
                          document.body.offsetHeight,
                          document.documentElement.clientHeight,
                          document.documentElement.scrollHeight,
                          document.documentElement.offsetHeight
                        );
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'content-height',
                          height: height
                        }));
                      }
                      updateHeight();
                      setTimeout(updateHeight, 500);
                      window.addEventListener('load', updateHeight);
                    })();
                  `}
                />
              </View>
            </View>

            {/* Dropdown */}
            <View style={styles.titleBar}>
              <Text style={[styles.text, { fontWeight: 'bold', marginTop: 0 }]}>Facility Acknowledge Terms? Yes/No</Text>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                iconStyle={styles.iconStyle}
                data={items}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={'Yes/No'}
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  if (!item || item.value === undefined) return;
                  setValue(item.value);
                  setIsFocus(false);
                  setCredentials(prev => ({
                    ...prev,
                    facilityAcknowledgeTerm: item.value === 1,
                    selectedoption: checked
                  }));
                }}
              />
            </View>

            {/* Signature Section */}
            {value === 1 && (
              <View style={styles.titleBar}>
                <Text style={[styles.text, { fontSize: RFValue(12), fontWeight: 'bold', marginTop: 0 }]}>
                  Facility Acknowledge Terms Signature <Text style={{ color: '#f00' }}>*</Text>
                </Text>

                {isSigned && credentials.signature ? (
                  <>
                    <Image
                      source={{ uri: `data:image/png;base64,${credentials.signature}` }}
                      style={styles.signaturePreview}
                    />
                    <View style={styles.buttonContainer}>
                      <Button title="Reset" onPress={handleReset} />
                    </View>
                  </>
                ) : (
                  <>
                    <SignatureCapture
                      style={styles.signature}
                      ref={signatureRef}
                      onSaveEvent={onSaveEvent}
                      saveImageFileInExtStorage={false}
                      showNativeButtons={false}
                      showTitleLabel={false}
                      viewMode="portrait"
                    />
                    <View style={styles.buttonContainer}>
                      <Button
                        title={isSaving ? 'Saving...' : 'Save'}
                        onPress={() => {
                          if (!isSigned && signatureRef.current) {
                            setIsSaving(true);
                            signatureRef.current.saveImage();
                          } else {
                            Alert.alert("Already signed", "Reset to re-sign.");
                          }
                        }}
                        disabled={isSaving || isSigned}
                      />
                      <Button title="Reset" onPress={handleReset} />
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Submit Button */}
            <View style={[styles.btn, { marginTop: 20, width: '90%' }]}>
              <HButton style={styles.subBtn} onPress={handlePreSubmit}>Submit</HButton>
            </View>

            <Image source={images.homepage} resizeMode="cover" style={styles.homepage} />
          </View>
        </Hyperlink>
      </ScrollView>
      <MFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative'
  },
  permission: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 10
  },
  titleBar: {
    width: '90%'
  },
  dropdown: {
    height: 30,
    width: '25%',
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10
  },
  placeholderStyle: {
    color: 'black',
    fontSize: RFValue(16),
  },
  selectedTextStyle: {
    color: 'black',
    fontSize: RFValue(16),
  },
  itemTextStyle: {
    color: 'black',
    fontSize: RFValue(16),
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  text: {
    fontSize: RFValue(14),
    color: 'black',
    fontWeight: 'normal',
    marginVertical: RFValue(20),
  },
  termsContentWrapper: {
    width: '100%',
    marginVertical: 0,
  },
  termsWebView: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  signature: {
    flex: 1,
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  signaturePreview: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  homepage: {
    width: 250,
    height: 200,
    marginTop: 30,
    marginBottom: 100
  },
  btn: {
    flexDirection: 'column',
    gap: 20,
    marginBottom: 30,
  },
  subBtn: {
    marginTop: 0,
    padding: 10,
    backgroundColor: '#A020F0',
    color: 'white',
    fontSize: RFValue(17),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  title: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#2a53c1',
    textDecorationLine: 'underline'
  },
  versionText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
    color: '#666'
  },
  dateText: {
    fontSize: RFValue(12),
    marginBottom: 15,
    color: '#999'
  },
  subTitle: {
    fontSize: RFValue(15),
    fontWeight: 'bold',
    color: 'black'
  },
});

