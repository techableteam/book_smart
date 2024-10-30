import React, { useState, useRef, useEffect } from 'react';
import { Alert, Animated, Easing, StyleSheet, View, Text, Dimensions, ScrollView, TouchableOpacity, Modal, StatusBar, Image } from 'react-native';
import { TextInput } from 'react-native-paper';
import images from '../../assets/images';
import HButton from '../../components/Hbutton';
import MHeader from '../../components/Mheader';
import MFooter from '../../components/Mfooter';
import { Signup } from '../../utils/useApi';
// Choose file
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs'
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function AddNewFacility({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    const increaseAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const decreaseAnimation = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const sequenceAnimation = Animated.sequence([increaseAnimation, decreaseAnimation]);

    Animated.loop(sequenceAnimation).start();
  }, [fadeAnim]);

  const [fileType, setFiletype] = useState('');
  const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);

  //--------------------------------------------Credentials-----------------------------
  const [credentials, setCredentials] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    contactEmail: '',
    password: '',
    contactPhone: '',
    address: {
      street: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
    },
    avatar: {
      type: '',
      content: '',
      name: ''
    },
    confirmPassword: '',
    signature: '',
    userRole: 'Facilities'
  })

  const handleCredentials = (target, e) => {
    if (target !== "street" && target !== "street2" && target !== "city" && target !== "state" && target !== "zip") {
      let value = e;
      if (target === 'contactEmail') {
        value = e.toLowerCase();
      }
      setCredentials({...credentials, [target]: value});
    } else {
      setCredentials({ ...credentials, address: { ...credentials.address, [target]: e } })
    }
  }
  const toggleFileTypeSelectModal = () => {
    setFiletypeSelectModal(!fileTypeSelectModal);
  };
  
  const handleChangeFileType = (mode) => {
    setFiletype(mode);
    toggleFileTypeSelectModal();
  };

  const openCamera = async () => {
    const options = {
      mediaType: 'photo', // Use 'video' for video capture
      quality: 1, // 1 for high quality, 0 for low quality
    };
    try {
      launchCamera(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.error) {
          Alert.alert(
            'Alert!',
            'Camera error: ', response.error,
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('');
                },
              },
            ],
            { cancelable: false }
          );
          console.error('Camera error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else if (response.errorCode) {
          Alert.alert(
            'Alert!',
            'Camera errorCode: ', response.errorCode,
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('');
                },
              },
            ],
            { cancelable: false }
          );
          console.log('Camera error code: ', response.errorCode);
        } else {
          const fileUri = response.assets[0].uri;
          const fileContent = await RNFS.readFile(fileUri, 'base64');
          
          handleCredentials('avatar', {
            content: fileContent,
            type: 'image',
            name: response.assets[0].fileName,
          });
          toggleFileTypeSelectModal();
        }
      });
    } catch (err) {
      Alert.alert(
        'Alert!',
        'Camera Issue: ' + JSON.stringify(err),
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('');
            },
          },
        ],
        { cancelable: false }
      );
    }
  };
  
  const pickGallery = async () => {
    const options = {
      mediaType: 'photo', // you can also use 'mixed' or 'video'
      quality: 1, // 0 (low) to 1 (high)
    };
  
    try {
      launchImageLibrary(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          Alert.alert(
            'Alert!',
            'ImagePicker Issue: ' + JSON.stringify(response.error),
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('');
                },
              },
            ],
            { cancelable: false }
          );
          console.log('ImagePicker Error: ', response.error);
        } else if (response.assets && response.assets.length > 0) {
          const pickedImage = response.assets[0].uri;
          const fileContent = await RNFS.readFile(pickedImage, 'base64');
          
          handleCredentials('avatar', {
            content: fileContent,
            type: 'image',
            name: response.assets[0].fileName,
          });
          toggleFileTypeSelectModal();
        } else {
          Alert.alert(
            'Alert!',
            'ImagePicker Issue: ' + JSON.stringify(response),
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('');
                },
              },
            ],
            { cancelable: false }
          );
        }
      });
    } catch (err) {
      Alert.alert(
        'Alert!',
        'Camera Issue: ' + JSON.stringify(err),
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('');
            },
          },
        ],
        { cancelable: false }
      );
    }
  };
  
  const pickFile = async () => {
    try {
      let type = [DocumentPicker.types.images, DocumentPicker.types.pdf];
      const res = await DocumentPicker.pick({
        type: type,
      });
  
      const fileContent = await RNFS.readFile(res[0].uri, 'base64');
  
      let fileType;
      if (res[0].type === 'application/pdf') {
        fileType = 'pdf';
      } else if (res[0].type.startsWith('image/')) {
        fileType = 'image';
      } else {
        fileType = 'unknown';
      }
      handleCredentials('avatar', { content: `${fileContent}`, type: fileType, name: res[0].name });
      toggleFileTypeSelectModal();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Handle other errors
      }
    }
  };

  const [confirmPassword, setConfirmPassword] = useState('');

  //Alert
  const showAlert = () => {
    Alert.alert(
      'Warning!',
      "The Password doesn't matched. Please try again.",
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handlePassword = () => {
    if (credentials.password !== confirmPassword ) {
      return true;
    } else {
      return false;
    }
  }
 
  //------------------------------------------Phone Input----------------
  const formatPhoneNumber = (input) => {
    // Remove all non-numeric characters from the input
    const cleaned = input.replace(/\D/g, '');

    // If the cleaned input has 1 or 2 characters, return it as is
    if (cleaned.length === 1 || cleaned.length === 2) {
        return cleaned;
    }

    // Apply the desired phone number format
    let formattedNumber = '';
    if (cleaned.length >= 3) {
        formattedNumber = `(${cleaned.slice(0, 3)})`;
    }
    if (cleaned.length > 3) {
        formattedNumber += ` ${cleaned.slice(3, 6)}`;
    }
    if (cleaned.length > 6) {
        formattedNumber += `-${cleaned.slice(6, 10)}`;
    }
    return formattedNumber;
  };

  const handlePhoneNumberChange = (text) => {
    const formattedNumber = formatPhoneNumber(text); 
    handleCredentials('contactPhone', formattedNumber);
  };

  const handleBack = () => {
    navigation.navigate('AdminFacilities');
  }

  //Alert
  const showAlerts = (name) => {
    Alert.alert(
      'Warning!',
      `You have to input ${name}!`,
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('OK pressed')
          },
        },
      ],
      { cancelable: false }
    );
  };

  const validation = () => {
    // Create an array of checks for each required field with corresponding error messages
    const fieldChecks = [
      { field: credentials.companyName, message: 'Company Name is required' },
      { field: credentials.contactEmail, message: 'Contact Email is required' },
      { field: credentials.firstName, message: 'First Name is required' },
      { field: credentials.lastName, message: 'Last Name is required' },
      { field: credentials.contactPhone, message: 'Contact Phone is required' },
      { field: credentials.password, message: 'Password is required' },
      { field: credentials.confirmPassword, message: 'Password is required' },
      { field: credentials.address?.street, message: 'Street Address is required' },
      { field: credentials.address?.city, message: 'City is required' },
      { field: credentials.address?.state, message: 'State is required' },
      { field: credentials.address?.zip, message: 'ZIP code is required' },
    ];
  
    // Iterate over the field checks and show an alert for the first empty field
    for (const check of fieldChecks) {
      if (!check.field || check.field === '') {
        Alert.alert(
          'Validation Error',
          check.message,
          [{ text: 'OK', onPress: () => console.log(`${check.message} alert acknowledged`) }],
          { cancelable: false }
        );
        return false; // Return false if any field is invalid
      }
    }

    if (credentials.password !== credentials.confirmPassword) {
      showPswWrongAlert();
      return false;
    }
  
    return true; // Return true if all fields are valid
  };

  const showPswWrongAlert = () => {
    Alert.alert(
      'Warning!',
      "The Password doesn't matched. Please try again.",
      [
        {
          text: 'OK',
          onPress: () => {
            setPassword('');
            setConfirmPassword('');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleSubmit = async () => {
    if (!validation()) {
      return;
    }
    try {
      const response = await Signup(credentials, "facilities");
      if (!response?.error) {
        navigation.navigate('AdminFacilities');
      } else {
        if (response.error.status == 500) {
          Alert.alert(
            'Warning!',
            "Can't register now",
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('OK pressed');
                },
              },
            ],
            { cancelable: false }
          );
        } else if (response.error.status == 409) {
          Alert.alert(
            'Alert',
            "The Email is already registered",
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('OK pressed');
                },
              },
            ],
            { cancelable: false }
          );
        } else if (response.error.status == 405) {
          Alert.alert(
            'Alert',
            "User not approved",
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('OK pressed');
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert(
            'Failure!',
            'Network Error',
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('OK pressed');
                },
              },
            ],
            { cancelable: false }
          );
        }
      }
    } catch (error) {
      console.error('Signup failed: ', error);
      Alert.alert(
        'Failure!',
        'Network Error',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK pressed');
            },
          },
        ],
        { cancelable: false }
      );
    }
  }
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent"/>
      <MHeader navigation={navigation} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.modal}>
          <View style={styles.intro}>
            <AnimatedHeader title="Add A New Facility"/>
          </View>
          <View style={styles.authInfo}>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Company Name <Text style={{ color: 'red' }}>*</Text>  </Text>
              <View style={{ flexDirection: 'row', width: '100%', gap: 5 }}>
                <TextInput
                  style={[styles.input, { width: '100%' }]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  onChangeText={e => handleCredentials('companyName', e)}
                  value={credentials.companyName || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Contact Name <Text style={{ color: 'red' }}>*</Text> </Text>
              <View style={{ flexDirection: 'row', width: '100%', gap: 5 }}>
                <TextInput
                  style={[styles.input, { width: '50%' }]}
                  placeholder="First"
                  onChangeText={e => handleCredentials('firstName', e)}
                  value={credentials.firstName || ''}
                />
                <TextInput
                  style={[styles.input, { width: '50%' }]}
                  placeholder="Last"
                  onChangeText={e => handleCredentials('lastName', e)}
                  value={credentials.lastName || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Contact Email <Text style={{ color: 'red' }}>*</Text> </Text>
              <View style={{ flexDirection: 'row', width: '100%', gap: 5 }}>
                <TextInput
                  style={[styles.input, { width: '100%' }]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={e => handleCredentials('contactEmail', e)}
                  value={credentials.contactEmail || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Contact Phone <Text style={{ color: 'red' }}>*</Text> </Text>
              <View style={{ flexDirection: 'row', width: '100%', gap: 5 }}>
                <TextInput
                  value={credentials.contactPhone}
                  style={[styles.input, {width: '100%'}]}
                  onChangeText={e => handlePhoneNumberChange(e)}
                  keyboardType="phone-pad"
                  placeholder=""
                />
              </View>
            </View>
            <View style={styles.password}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{
                  backgroundColor: 'yellow',
                  marginBottom: 10,
                  fontSize: RFValue(16),
                  fontWeight: 'bold',
                  color: 'black'
                }}>
                  Create Password
                </Text>
                <Text style={{ color: 'red' }}>*</Text>
              </View>
              <TextInput
                autoCorrect={false}
                autoCapitalize="none"
                secureTextEntry={true}
                style={[styles.input, { width: '100%' }]}
                placeholder="Password"
                onChangeText={e => handleCredentials('password', e)}
                value={credentials.password || ''}
              />
              <TextInput
                autoCorrect={false}
                autoCapitalize="none"
                secureTextEntry={true}
                style={[styles.input, { width: '100%' }]}
                placeholder="Confirm Password"
                onChangeText={e => handleCredentials('confirmPassword', e)}
                value={credentials.confirmPassword || ''}
              />
              <Text style={[styles.subtitle, { fontStyle: 'italic', fontSize: RFValue(14), color: 'red' }]}>Create your password to access the platform</Text>
            </View>
            {/* <View style={styles.password}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{
                  marginBottom: 10,
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: 'black'
                }}>
                  Enter Password Again
                </Text>
              </View>
              <TextInput
                autoCorrect={false}
                autoCapitalize="none"
                // secureTextEntry={true}
                style={[styles.input, { width: '100%' }]}
                placeholder=""
                onChangeText={e => handleCredentials('contactPassword', e)}
                value={credentials.contactPassword || ''}
              />
              <Text style={[styles.subtitle, { fontSize: 14, fontWeight: '400' }]}> Send yourself a copy of your login information! ( optional ) </Text>
            </View> */}
            <View style={styles.email}>
              <Text style={styles.subtitle}> Address <Text style={{color: 'red'}}>*</Text></Text>
              <View style={{ flexDirection: 'column', width: '100%', gap: 5 }}>
                <View style={{ width: '100%', marginBottom: 10 }}>
                  <TextInput
                    style={[styles.input, { width: '100%', marginBottom: 0 }]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleCredentials('street', e)}
                    value={credentials.address.street || ''}
                  />
                  <Text style={{ color: 'black', paddingLeft: 5 }}>Street Address<Text style={{color: 'red'}}> *</Text></Text>
                </View>
                <View style={{ width: '100%', marginBottom: 10 }}>
                  <TextInput
                    style={[styles.input, { width: '100%', marginBottom: 0 }]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleCredentials('street2', e)}
                    value={credentials.address.street2 || ''}
                  />
                  <Text style={{ color: 'black', paddingLeft: 5 }}>Street Address2</Text>
                </View>
                <View style={{ flexDirection: 'row', width: '100%', gap: 5, marginBottom: 30 }}>
                  <View style={[styles.input, { width: '45%' }]}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, { width: '100%', marginBottom: 0 }]}
                      onChangeText={e => handleCredentials('city', e)}
                      value={credentials.address.city || ''}
                    />
                    <Text style={{ color: 'black', paddingLeft: 5 }}>City<Text style={{color: 'red'}}> *</Text></Text>
                  </View>
                  <View style={[styles.input, { width: '20%' }]}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, { width: '100%', marginBottom: 0 }]}
                      onChangeText={e => handleCredentials('state', e)}
                      value={credentials.address.state || ''}
                    />
                    <Text style={{ color: 'black', paddingLeft: 5 }}>State<Text style={{color: 'red'}}> *</Text></Text>
                  </View>
                  <View style={[styles.input, { width: '30%' }]}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, { width: '100%', marginBottom: 0 }]}
                      onChangeText={e => handleCredentials('zip', e)}
                      value={credentials.address.zip || ''}
                    />
                    <Text style={{ color: 'black', paddingLeft: 5 }}>Zip<Text style={{color: 'red'}}> *</Text></Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.email}>
              <Text style={styles.subtitle}> Logo / Pic</Text>
              <View style={{ flexDirection: 'row', width: '100%' }}>
                <TouchableOpacity title="Select File" onPress={toggleFileTypeSelectModal} style={styles.chooseFile}>
                  <Text style={{ fontWeight: '400', padding: 0, fontSize: RFValue(14), color: 'black' }}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { width: '70%', color: 'black' }]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.avatar.name || ''}
                />
              </View>
              <Text style={{ color: 'black' }}> "optional"</Text>
            </View>

            <View style={[styles.btn, { marginTop: 20 }]}>
              <HButton style={styles.subBtn} onPress={handleSubmit}>
                Submit
              </HButton>
            </View>

            <Text style={{ textDecorationLine: 'underline', color: '#2a53c1', marginBottom: 20 }}
              onPress={handleBack}
            >
              Back to 🏚️ All Facilities
            </Text>
          </View>
        </View>
        {fileTypeSelectModal && (
          <Modal
            visible={fileTypeSelectModal} // Changed from Visible to visible
            transparent={true}
            animationType="slide"
            onRequestClose={() => {
              setFiletypeSelectModal(false); // Close the modal
            }}
          >
            <StatusBar translucent backgroundColor='transparent' />
            <ScrollView style={styles.modalsContainer} showsVerticalScrollIndicator={false}>
              <View style={[styles.viewContainer, { marginTop: '50%' }]}>
                <View style={[styles.header, { height: 100 }]}>
                  <Text style={styles.headerText}>Choose File</Text>
                  <TouchableOpacity style={{ width: 20, height: 20 }} onPress={toggleFileTypeSelectModal}>
                    <Image source={images.close} style={{ width: 20, height: 20 }} />
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <View style={[styles.modalBody, { marginBottom: 20 }]}>
                    <View style={styles.cameraContain}>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={openCamera}>
                        <Image source={images.camera} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={pickGallery}>
                        <Image source={images.gallery} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={pickFile}>
                        <Image source={images.folder} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Folder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </Modal>
        )}
      </ScrollView>
      <MFooter />
    </View>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    // paddingVertical: 4,
    // paddingHorizontal: 10,
    borderRadius: 4,
    color: 'black',
    // paddingRight: 30,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 86%)',
    margin: 0,
  },
  inputAndroid: {
    fontSize: 8,
    // paddingHorizontal: 10,
    // paddingVertical: 0,
    margin: 0,
    borderRadius: 10,
    color: 'black',
    // paddingRight: 30,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 86%)',
  },
});

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    backgroundColor: 'red',
    padding: 20,
  },
  container: {
    marginBottom: 0,
    backgroundColor: 'rgba(155, 155, 155, 0.61))'
  },
  scroll: {
    marginTop: height * 0.15,
  },
  backTitle: {
    backgroundColor: 'black',
    width: '90%',
    height: 55,
    marginLeft: '5%',
    position: 'absolute',
    marginTop: 10,
    borderRadius: 10
  },
  title: {
    fontSize: RFValue(20),
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginLeft: '5%',
    padding: 15,
    width: '90%',
    backgroundColor: 'transparent'
  },
  marker: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    marginRight: 10,
    marginTop: 17
  },
  text: {
    fontSize: RFValue(14),
    color: 'hsl(0, 0%, 29%)',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24
  },
  modal: {
    width: '90%',
    borderRadius: 10,
    margin: '5%',
    marginBottom: 100,
    borderWidth: 1,
    borderColor: 'grey',
    overflow: 'hidden',
    shadowColor: 'black', // Shadow color
    shadowOffset: { width: 0, height: 10 }, // Shadow offset
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 3, // Shadow radius
    elevation: 0, // Elevation for Android devices
    backgroundColor: '#ffffffa8',
  },
  intro: {
    marginTop: 30,
    paddingHorizontal: 20,
    marginBottom: 20
  },
  input: {
    backgroundColor: 'white',
    height: 30,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 86%)',
  },
  subject: {
    padding: 5,
    backgroundColor: '#77f9ff9c',
    borderRadius: 2,
    borderColor: 'black',
    width: '80%',
    color: 'black',
    fontWeight: 'bold',
    marginTop: 30,
    marginLeft: '10%',
    fontSize: RFValue(18),
    borderRadius: 5,
  },
  mark: {
    width: '70%',
    height: 75,
    marginLeft: '15%',
  },
  homepage: {
    // paddingHorizontal: 30,
    // paddingVertical: 70,
    width: '45%',
    height: 130,
    marginTop: 10,
    marginLeft: '25%',
  },
  subtitle: {
    fontSize: RFValue(16),
    color: 'black',
    textAlign: 'left',
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: 'bold'
  },
  middleText: {
    fontSize: RFValue(16),
    margin: 0,
    lineHeight: 16,
    color: 'black'
  },
  authInfo: {
    marginLeft: 20,
    marginRight: 20,

  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 130
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
    fontSize: RFValue(16),
  },
  drinksButton: {
    fontSize: RFValue(18),
    padding: 15,
    borderWidth: 3,
    borderColor: 'white',

  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: '#000',
  },
  signature: {
    flex: 1,
    width: '100%',
    height: 150,
  },
  chooseFile: {
    width: '30%',
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'black'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
    width: '60%',
    height: '30%',
    marginLeft: '20',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: 20
  },
  modalsContainer: {
    paddingTop: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  viewContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 30,
    elevation: 5,
    width: '90%',
    marginLeft: '5%',
    flexDirection: 'flex-start',
    borderWidth: 3,
    borderColor: '#7bf4f4',
    marginBottom: 100
  },
  modalBody: {
    backgroundColor: '#e3f2f1',
    borderRadius: 10,
    borderColor: '#c6c5c5',
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    height: '20%',
    padding: 20,
    borderBottomColor: '#c4c4c4',
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: 'black'
  },
  textStyle: {
    color: 'black'
  },
  closeButton: {
    color: 'red',
  },
  body: {
    marginTop: 10,
    paddingHorizontal:20,
  },
  cameraContain: {
		flex: 1,
		alignItems: 'flex-start',
		justifyContent: 'center',
		flexDirection: 'row'
	},
  pressBtn:{
    top: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingRight: 10
  },
  btnSheet: {
		height: 100,
		width:100,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
		shadowOpacity: 0.5,
		shadowRadius: 10,
		margin: 5,
		shadowColor: '#000',
		shadowOffset: { width: 3, height: 3 },
		marginVertical: 14, padding: 5,
	},
});
