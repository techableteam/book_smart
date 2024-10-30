import React, { useState, useRef, useEffect } from 'react';
import { Alert, Animated, Easing, StyleSheet, Pressable, View, Text, ScrollView, TouchableOpacity, Modal, StatusBar, Button, Image } from 'react-native';
import { TextInput } from 'react-native-paper';
import SignatureCapture from 'react-native-signature-capture';
import DatePicker from 'react-native-date-picker';
import HButton from '../../components/Hbutton';
import MHeader from '../../components/Mheader';
import MFooter from '../../components/Mfooter';
import { Signup } from '../../utils/useApi';
import images from '../../assets/images';
import Loader from '../Loader';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs'
import AnimatedHeader from '../AnimatedHeader';
import { Dimensions } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";
import constStyles from '../../assets/styles';

const { width, height } = Dimensions.get('window');

export default function ClientSignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [title, setTitle] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [ssNumber, setSSNumber] = useState('');
  const [verifySSNumber, setVerifySSNumber] = useState('');
  const [fileType, setFiletype] = useState('');
  const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);
  const [address, setAddress] = useState({
    streetAddress: '',
    streetAddress2: '',
    city: '',
    state: '',
    zip: '',
  });
  const [photoImage, setPhotoImage] = useState({
    content: '',
    type: '',
    name: ''
  });
  const [signature, setSignature] = useState({content: ''});
  const [userRole, setuserRole] = useState('Clinician');
  const [showModal, setShowModal] = useState(false);
  const [showCalender, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [sending, setSending] = useState(false);
  useEffect(() => {
    const isBirthdayValid = birthday instanceof Date && !isNaN(birthday.getTime());
    const areRequiredFieldsFilled =
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      email.trim() !== '' &&
      phoneNumber.trim() !== '' &&
      title.trim() !== '' &&
      ssNumber.trim() !== '' &&
      verifySSNumber.trim() !== '' &&
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      signature.content.trim() !== '' &&
      isBirthdayValid; // Check if signature content exists

    setIsButtonEnabled(areRequiredFieldsFilled); // Enable button if required fields are filled
  }, [firstName, lastName, email, phoneNumber, title, birthday,
      ssNumber, verifySSNumber, password, confirmPassword, signature]);
  
  let signatureRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
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

  const handleItemPress = (text) => {
    setTitle(text);
    setShowModal(!showModal);
  };

  const handleTitles = () => {
    setShowModal(!showModal);
  };

  const handleDayChange = (day) => {
    setBirthday(day);
  };

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
          
          setPhotoImage({
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
          
          setPhotoImage({
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
      setPhotoImage({content: `${fileContent}`, type: fileType, name: res[0].name});
      toggleFileTypeSelectModal();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Handle other errors
      }
    }
  };

  const showPswWrongAlert = () => {
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

  const onSaveEvent = (result) => {
    setSignature((prev) => ({...prev, content: result.encoded}));
  };

  // const getSignature = () => {
  //   if (signatureRef.current) {
  //     signatureRef.current.saveImage();
  //   }
  // };

  // const resetSignature = () => {
  //   if (signatureRef.current) {
  //     signatureRef.current.resetImage();
  //   }
  // };
  
  const formatPhoneNumber = (input) => {
    const cleaned = input.replace(/\D/g, '');

    if (cleaned.length === 1 || cleaned.length === 2) {
      return cleaned;
    }

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
    setPhoneNumber(formattedNumber);
  };

  const handleBack = () => {
    navigation.navigate('ClientSignIn');
  };

  const showWrongAlerts = () => {
    Alert.alert(
      'Warning!',
      `You have to input all gaps!`,
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

  const successAlerts = () => {
    Alert.alert(
      "SignUp Success",
      "",
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate("ClientFinishSignup");
          },
        },
      ],
      { cancelable: false }
    )
  };

  const handleInputAddress = (field, value) => {
    setAddress(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handlePreSubmit = () => {
    handleSubmit();
    if (!isSubmitting) {
      // setIsSubmitting(true);
      // getSignature();
      // setTimeout(() => {
      //   handleSubmit();
      // }, 2000);
    }
  };

  const validation = () => {
    // Create an array of checks for each field with corresponding error messages
    const fieldChecks = [
      { field: email, message: 'Email is required' },
      { field: firstName, message: 'First name is required' },
      { field: lastName, message: 'Last name is required' },
      { field: phoneNumber, message: 'Phone number is required' },
      { field: title, message: 'Title is required' },
      { field: birthday, message: 'Birthday is required' },
      { field: ssNumber, message: 'Social Security Number is required' },
      { field: verifySSNumber, message: 'Verify Social Security Number is required' },
      { field: address.streetAddress, message: 'Street address is required' },
      { field: address.city, message: 'City is required' },
      { field: address.state, message: 'State is required' },
      { field: address.zip, message: 'ZIP code is required' },
      { field: password, message: 'Password is required' },
    ];
  
    // Check each field; if one is empty, show the corresponding alert and return false
    for (const check of fieldChecks) {
      if (check.field === '') {
        Alert.alert(
          'Warning!',
          check.message,
          [{ text: 'OK', onPress: () => console.log(`${check.message} alert acknowledged`) }],
          { cancelable: false }
        );
        return false; // Return false if any validation fails
      }
    }
  
    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      showPswWrongAlert();
      return false;
    }

    if (signature.content === '') {
      Alert.alert(
        'Warning!',
        "signature required",
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
      return false;
    }
  
    return true; // Return true if all fields are valid
  };

  const handleSubmit = async () => {
    if (!validation()) {
      setIsSubmitting(false); // Validation failed, stop submission
      return;
    }
    try {
      setSending(true);
      const credentials = {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        title,
        birthday,
        socialSecurityNumber: ssNumber,
        verifiedSocialSecurityNumber: verifySSNumber,
        address,
        photoImage,
        signature: signature.content,
        userRole,
      };

      const response = await Signup(credentials, 'clinical');

      if (!response?.error) {
        setSending(false);
        successAlerts();
        setIsSubmitting(false);
      } else {
        setSending(false);
        setIsSubmitting(false);
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
      setSending(false);
      setIsSubmitting(false);
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
      <StatusBar translucent backgroundColor="transparent" />
      <MHeader navigation={navigation}/>
      <ScrollView style = {styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.modal}>
          <View style={styles.intro}>
            <AnimatedHeader title="CAREGIVERS REGISTER HERE!" />
            <View style={{flexDirection:'row', justifyContent: 'center', marginVertical: RFValue(20)}}>
              <Text style={[constStyles.signUpText, {flexDirection:'row'}]}>
                NOTE: Your Registration will be in <Text style={[constStyles.signUpText, {color:'#0000ff'}]}>"PENDING"</Text>
                &nbsp;Status until your information is verified. Once
                <Text style={[constStyles.signUpText, {color:'#008000'}]}> "APPROVED" </Text>you will be notified by email.
              </Text>
            </View>
          </View>
          <View style={styles.authInfo}>
            <Text style={styles.subject}>CONTACT INFORMATION</Text>
            <View>
              <Text style={constStyles.signUpSubtitle}> Name <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[constStyles.signUpinput, {width: '50%'}]}
                  placeholder="First"
                  onChangeText={e => setFirstName(e)}
                  value={firstName || ''}
                />
                <TextInput
                  style={[constStyles.signUpinput, {width: '50%'}]}
                  placeholder="Last"
                  onChangeText={e => setLastName(e)}
                  value={lastName || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.signUpSubtitle}> Email <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[constStyles.signUpinput, {width: '100%'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={e => setEmail(e)}
                  value={email || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.signUpSubtitle}> Phone <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  placeholder="(___) ___-____"
                  value={phoneNumber}
                  style={[constStyles.signUpinput, {width: '100%'}]}
                  onChangeText={(e) => handlePhoneNumberChange(e)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.signUpSubtitle}> Title <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{position: 'relative', width: '100%', gap: 5}}>
                <Pressable style= {{width: '100%', height: 50, zIndex: 10}} onPress={handleTitles}>
                </Pressable>
                  <TextInput
                    style={[constStyles.signUpinput, {width: '100%', zIndex: 0, position: 'absolute', top: 0}]}
                    placeholder=""
                    editable= {false}
                    value={title ? title : 'Select Title...' }
                  />
                {showModal && <Modal
                  Visible={false}
                  transparent= {true}
                  animationType="slide"
                  onRequestClose={() => {
                    setShowModal(!showModal);
                  }}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.calendarContainer}>
                      <Text style={constStyles.signUpSubtitle} onPress={()=> handleItemPress('')}>Select Title...</Text>
                      <Text style={constStyles.signUpSubtitle} onPress={()=> handleItemPress('CNA')}>CNA</Text>
                      <Text style={constStyles.signUpSubtitle} onPress={()=> handleItemPress('LPN')}>LPN</Text>
                      <Text style={constStyles.signUpSubtitle} onPress={()=> handleItemPress('RN')}>RN</Text>
                    </View>
                  </View>
                </Modal>}
              </View>
            </View>
            <View style={styles.email}>
              <Text style={constStyles.signUpSubtitle}> Date of Birth <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'column', width: '100%', gap: 5, position: 'relative'}}>
                <TouchableOpacity onPress={() => setShowCalendar(true)} style={{width: '100%', height: 40, zIndex: 1}}></TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '100%', position: 'absolute', zIndex: 0, color: 'black'}]}
                  placeholder=""
                  value={birthday.toDateString()}
                  editable={false}
                />
                {showCalender && 
                  <>
                    <DatePicker
                      date={birthday}
                      theme='light'
                      onDateChange={(day) => handleDayChange(day)}
                      mode="date"
                      androidVariant="native"
                    />
                    <Button title="confirm" onPress={(day) =>{setShowCalendar(!showCalender);}} />
                  </>
                }
              </View>
            </View>
            <View style={styles.email}>
              <Text style={constStyles.signUpSubtitle}> SS# <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[constStyles.signUpinput, {width: '100%'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="numeric"
                  onChangeText={e => setSSNumber(e)}
                  value={ssNumber || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={constStyles.signUpSubtitle}> Verify SS# <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[constStyles.signUpinput, {width: '100%'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="numeric"
                  onChangeText={e => setVerifySSNumber(e)}
                  value={verifySSNumber || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={constStyles.signUpSubtitle}> Caregiver Address <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'column', width: '100%', gap: 5}}>
                <View style={{width: '100%', marginBottom: 10}}>
                  <TextInput
                    style={[constStyles.signUpinput, {width: '100%', marginBottom: 0}]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleInputAddress('streetAddress', e)}
                    value={address.streetAddress || ''}
                  />
                  <Text style={constStyles.signUpsmalltitle}>Street Address<Text style={{color: 'red'}}> *</Text></Text>
                </View>
                <View style={{width: '100%', marginBottom: 10}}>
                  <TextInput
                    style={[constStyles.signUpinput, {width: '100%', marginBottom: 0}]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleInputAddress('streetAddress2', e)}
                    value={address.streetAddress2 || ''}
                  />
                  <Text style={constStyles.signUpsmalltitle}>Street Address2</Text>
                </View>
                <View style={{flexDirection: 'row', width: '100%', gap: 5, marginBottom: 30}}>
                  <View style={[constStyles.signUpinput, {width: '45%'}]}>
                    <TextInput
                      placeholder=""
                      style={[constStyles.signUpinput, {width: '100%', marginBottom: 0}]}
                      onChangeText={e => handleInputAddress('city', e)}
                      value={address.city || ''}
                    />
                    <Text style={constStyles.signUpsmalltitle}>City<Text style={{color: 'red'}}> *</Text></Text>
                  </View>
                  <View style={[constStyles.signUpinput, {width: '20%'}]}>
                    <TextInput
                      placeholder=""
                      style={[constStyles.signUpinput, {width: '100%', marginBottom: 0, paddingLeft: 1}]}
                      onChangeText={e => handleInputAddress('state', e)}
                      value={address.state || ''}
                    />
                    <Text style={constStyles.signUpsmalltitle}>State<Text style={{color: 'red'}}> *</Text></Text>
                  </View>
                  <View style={[constStyles.signUpinput, {width: '30%'}]}>
                    <TextInput
                      placeholder=""
                      style={[constStyles.signUpinput, {width: '100%', marginBottom: 0}]}
                      onChangeText={e => handleInputAddress('zip', e)}
                      value={address.zip || ''}
                    />
                    <Text style={constStyles.signUpsmalltitle}>Zip<Text style={{color: 'red'}}> *</Text></Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View>
              <Text style={constStyles.signUpSubtitle}> Upload Pic. (Optional)</Text>
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={toggleFileTypeSelectModal} style={styles.chooseFile}>
                  <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(12), color: 'black'}}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={photoImage.name || ''}
                />
              </View>
            </View>

            <View style={styles.password}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{
                  backgroundColor: 'yellow', 
                  marginBottom: RFValue(10), 
                  fontSize: RFValue(15), 
                  fontWeight: 'bold', 
                  color: 'black'}}> 
                  Create Password 
                </Text>
                <Text style={{color: 'red'}}>*</Text>
              </View>
              <TextInput
                autoCorrect={false}
                autoCapitalize="none"
                secureTextEntry={true}
                style={[constStyles.signUpinput, {width: '100%'}]}
                placeholder=""
                onChangeText={e => setPassword(e)}
                value={password || ''}
              />
              <TextInput
                autoCorrect={false}
                autoCapitalize="none"
                secureTextEntry={true}
                style={[constStyles.signUpinput, {width: '100%'}]}
                placeholder=""
                onChangeText={e => setConfirmPassword(e)}
                value={confirmPassword || ''}
              />
              <Text style={[constStyles.signUpSubtitle, { fontStyle:'italic', fontSize: RFValue(14), color: 'red' }]}>Create your password to access the platform </Text>
            </View>
            
            <View style={styles.password}>
              <Text style={constStyles.signUpSubtitle}>Signature<Text style={{color: 'red'}}>*</Text> </Text>  
              <SignatureCapture
                style={styles.signature}
                ref={signatureRef}
                onSaveEvent={onSaveEvent}
                saveImageFileInExtStorage={false}
                showNativeButtons={true}
              />
            </View>
            
            <View style = {{marginTop: RFValue(20)}}>
              <Text style={{fontWeight: '400', color: 'black', fontSize: RFValue(12)}}>
                As a web marketplace dedicated to booking shifts for independent contractors and customers like you, we require your signature on this disclosure statement to ensure clarity and transparency in our working relationship. By signing, you acknowledge your understanding of our role as a web-based intermediary between independent contractors and customers needing shifts booked. We are committed to upholding ethical standards, ensuring compliance with industry regulations, and prioritizing your best interests throughout the placement process. Your signature signifies mutual agreement and cooperation as we work together to match skills with open shifts. Thank you for trusting BookSmart™ for your next gig!
              </Text>

            </View>

            <View style={[styles.btn, {marginTop: RFValue(20)}]}>
              <HButton style={styles.subBtn} 
                onPress={ handlePreSubmit }>
                Submit
              </HButton>
            </View>

            <Text style={{textDecorationLine: 'underline', color: '#2a53c1', fontSize: RFValue(14), marginBottom: 20}}
              onPress={handleBack}
            >
              Back to 🏚️ Caregiver Home
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
                  <Text style={constStyles.signUpheaderText}>Choose File</Text>
                  <TouchableOpacity style={{ width: 20, height: 20 }} onPress={toggleFileTypeSelectModal}>
                    <Image source={images.close} style={{ width: 20, height: 20 }} />
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <View style={[styles.modalBody, { marginBottom: 20 }]}>
                    <View style={styles.cameraContain}>
                      <TouchableOpacity activeOpacity={0.5} style={constStyles.signUpbtnSheet} onPress={openCamera}>
                        <Image source={images.camera} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={constStyles.signUpbtnSheet} onPress={pickGallery}>
                        <Image source={images.gallery} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={constStyles.signUpbtnSheet} onPress={pickFile}>
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
      <Loader visible={sending} />
      <MFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    backgroundColor: 'red',
    padding: 20,
  },
  container: {
    marginBottom: 0,
    backgroundColor: 'rgba(155, 155, 155, 0.61)'
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
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginLeft: '5%',
    padding: 15,
    width: '90%',
    backgroundColor: 'transparent'
  },
  smalltitle:{
    color: 'black', 
    paddingLeft: 5, 
    fontSize: RFValue(13)
  },
  textStyle: {
    color: 'black'
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
  
  modal: {
    width: '90%',
    borderRadius: 10,
    marginBottom: 100,
    margin: '5%',
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
    paddingHorizontal: 20
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  
  subject: {
    padding: RFValue(5),
    backgroundColor: '#77f9ff9c',
    borderRadius: 2,
    borderColor: 'black',
    width: width * 0.65,
    color: 'black',
    fontWeight: 'bold',
    marginTop: RFValue(20),
    fontSize: RFValue(14),
    borderRadius: RFValue(5),
    textAlign: 'center'
  },
  mark: {
    width: '70%',
    height: 75,
    marginLeft: '15%',
  },
  homepage: {
    width: '45%',
    height: 130,
    marginTop: 10,
    marginLeft: '25%',
  },
  
  middleText: {
    fontSize: 16,
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
  btn: {flexDirection: 'column',
    gap: 20,
    marginBottom: 30,
  },
  subBtn: {
    padding: RFValue(10),
    backgroundColor: '#A020F0',
    color: 'white',
    fontSize: RFValue(16),
  },
  drinksButton: {
    fontSize: 18,
    padding: 15,
    borderWidth: 3,
    borderColor: 'white',

  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000000',
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
    width: '40%', 
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
  cameraContain: {
		flex: 1,
		alignItems: 'flex-start',
		justifyContent: 'center',
		flexDirection: 'row'
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black'
  },
  closeButton: {
    color: 'red',
  },
  body: {
    marginTop: 10,
    paddingHorizontal:20,
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

