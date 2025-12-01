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
import { aicAtom, emailAtom, clinicalAcknowledgeTerm } from '../../context/ClinicalAuthProvider';
import Loader from '../Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const { width, height } = Dimensions.get('window');

export default function ClientNewTerms({ navigation }) {
    const [aic] = useAtom(aicAtom);
    const [email] = useAtom(emailAtom);
    const [clinicalAcknowledgement, setClinicalAcknowledgement] = useAtom(clinicalAcknowledgeTerm);
    
    const items = [
        { label: 'Yes', value: 1 },
        { label: 'No', value: 2 }
    ];
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [isSigned, setIsSigned] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [termsContent, setTermsContent] = useState('');
    const [termsVersion, setTermsVersion] = useState('');
    const [termsPublishedDate, setTermsPublishedDate] = useState('');
    const [fToken, setFToken] = useState('');
    
    const [credentials, setCredentials] = useState({
        signature: '',
        clinicalAcknowledgeTerm: false
    });
    let signatureRef = useRef(null);

    // Get FCM token on component mount
    useEffect(() => {
        const getFCMMsgToken = async () => {
            try {
                const token = await messaging().getToken();
                if (token) {
                    console.log("FCM Token in ClientNewTerms:", token);
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
                const response = await getPublishedTerms('clinician', email);
                if (response.error) {
                    // No terms available - show alert and go back to login
                    Alert.alert(
                        'No Terms Available',
                        'There are no terms of service available at this time. Please wait for the administrator to publish terms.',
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    navigation.navigate('ClientSignIn');
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
                                    navigation.navigate('ClientSignIn');
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
                                navigation.navigate('ClientSignIn');
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
        setCredentials(prevCredentials => ({
            ...prevCredentials, 
            signature: result.encoded
        }));
        setIsSigned(true);
        setIsSaving(false);
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

    const handleUploadSubmit = async () => {
        if (value !== 1) {
            Alert.alert('Warning!', 'Please select "Yes" to accept the terms.');
            return;
        }

        if (!isSigned) {
            Alert.alert('Warning!', 'Please sign and click Save button');
            return;
        }

        setIsSaving(true);
        try {
            // Get isTest flag to ensure we're using the correct database
            const isTest = await AsyncStorage.getItem('isTest');
            console.log('Submitting terms acceptance:', { aic, isTest: isTest === 'true' });
            
            const updateData = {
                aic: aic,
                signature: credentials.signature,
                clinicalAcknowledgeTerm: true
            };

            const response = await Update(updateData, 'clinical');
            
            if (!response.error) {
                // Save FCM token after successful terms acceptance
                if (fToken && email) {
                    try {
                        await sendFCMToken({ email: email, token: fToken }, 'clinical');
                        console.log('FCM token saved after terms acceptance');
                    } catch (fcmError) {
                        console.error('Error saving FCM token:', fcmError);
                        // Don't fail the terms acceptance if FCM token save fails
                    }
                }
                
                setClinicalAcknowledgement(true);
                Alert.alert(
                    'Success!',
                    'Terms accepted successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.navigate('MyHome');
                            }
                        }
                    ],
                    { cancelable: false }
                );
            } else {
                console.error('Update response error:', response.error);
                const errorMsg = typeof response.error === 'string' 
                    ? response.error 
                    : (response.error?.message || 'Failed to update. Please try again.');
                Alert.alert('Error', errorMsg);
                setIsSaving(false);
            }
        } catch (error) {
            console.error('Error updating terms:', error);
            Alert.alert('Error', error.message || 'Failed to update. Please try again.');
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
            <SubNavbar navigation={navigation} name={"ClientSignIn"} />
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
                            <Text style={styles.text}>
                                {termsContent || 'Loading terms...'}
                            </Text>
                        </View>

                        <View style={styles.titleBar}>
                            <Text style={[styles.text, {fontWeight: 'bold', marginBottom: 5}]}>Acknowledge Terms? Yes/No</Text>
                            <Dropdown
                                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.itemTextStyle}
                                data={items}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={'Select Yes/No'}
                                value={value}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={item => {
                                    setValue(item.value);
                                    setIsFocus(false);
                                    setCredentials(prevCredentials => ({
                                        ...prevCredentials, 
                                        clinicalAcknowledgeTerm: item.value === 1
                                    }));
                                }}
                            />
                        </View>
                        {value == 1 && <View style={styles.titleBar}>
                            <Text style={[styles.text, {fontWeight: 'bold', marginBottom: 5}]}>Signature <Text style={{color: '#f00'}}>*</Text></Text>
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
                        </View>}
                        <View style={[styles.btn, {marginTop: 20, width: '90%'}]}>
                            <HButton style={styles.subBtn} onPress={handleUploadSubmit} disabled={isSaving}>
                                {isSaving ? 'Processing...' : 'Submit'}
                            </HButton>
                        </View>
                        <Image
                            source={images.homepage}
                            resizeMode="cover"
                            style={styles.homepage}
                        />
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
    color: 'black',
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
    color: 'black'
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
    fontSize: RFValue(14),
  },
  placeholderStyle: {
    color: 'black',
    fontSize: RFValue(12),
  },
  selectedTextStyle: {
    color: 'black',
    fontSize: RFValue(12),
  },
  itemTextStyle: {
    color: 'black',
    fontSize: RFValue(12),
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: RFValue(12),
  },
  title: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: 'black',
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
  text: {
    fontSize: RFValue(14),
    color: 'black',
    fontWeight: 'normal',
    marginVertical: 20,
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
});

