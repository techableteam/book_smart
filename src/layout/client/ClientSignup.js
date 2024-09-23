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
// Choose file
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import RNFS from 'react-native-fs'

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
  
    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.error('Camera error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        // Handle the response
        const fileUri = response.assets[0].uri;
        const fileContent = await RNFS.readFile(fileUri, 'base64');
        
        setPhotoImage({
          content: fileContent,
          type: 'image',
          name: response.assets[0].fileName,
        });
      }
    });
  };

  const pickGallery = async () => {
    const options = {
      mediaType: 'photo', // you can also use 'mixed' or 'video'
      quality: 1, // 0 (low) to 1 (high)
    };
  
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        const pickedImage = response.assets[0].uri;
        const fileContent = await RNFS.readFile(pickedImage, 'base64');
        
        setPhotoImage({
          content: fileContent,
          type: 'image',
          name: response.assets[0].fileName,
        });
      }
    });
  };

  const pickFile = async () => {
    try {
      let type = [DocumentPicker.types.images, DocumentPicker.types.pdf]; // Specify the types of files to pick (images and PDFs)
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
            setPassword('');
            setConfirmPassword('');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const onSaveEvent = (result) => {
    setSignature((prev) => ({...prev, content: result.encoded}));
  };

  const getSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.saveImage();
    }
  };

  const resetSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.resetImage();
    }
  };
  
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
    // if (email === '' || 
    //   firstName === '' || 
    //   lastName === '' || 
    //   phoneNumber === '' || 
    //   title === '' || 
    //   birthday === '' || 
    //   ssNumber === '' || 
    //   verifySSNumber === '' || 
    //   address.streetAddress === '' || 
    //   address.city === '' || 
    //   address.state === '' || 
    //   address.zip === '' || 
    //   password === '' ||
    //   signature.content === ''
    // ) {
    //   if (signature.content === '') {
    //     Alert.alert(
    //       'Warning!',
    //       "signature required",
    //       [
    //         {
    //           text: 'OK',
    //           onPress: () => {
    //             console.log('OK pressed');
    //           },
    //         },
    //       ],
    //       { cancelable: false }
    //     );
    //   } else {
    //     showWrongAlerts();
    //   }
    //   console.log(email, firstName, lastName, phoneNumber, title, birthday, ssNumber, verifySSNumber, address, password, signature.content.length, signautreData.length);
    //   showWrongAlerts();
    //   setIsSubmitting(false);
    // } else if (password !== confirmPassword) {
    //   showPswWrongAlert();
    //   setIsSubmitting(false);
    // } else {
    //   console.log('call api');
    //   try {
    //     const credentials = {
    //       firstName,
    //       lastName,
    //       email,
    //       password,
    //       phoneNumber,
    //       title,
    //       birthday,
    //       socialSecurityNumber: ssNumber,
    //       verifiedSocialSecurityNumber: verifySSNumber,
    //       address,
    //       photoImage,
    //       signature: signature.content,
    //       userRole,
    //     };

    //     const response = await Signup(credentials, 'clinical');

    //     if (!response?.error) {
    //       successAlerts();
    //       setIsSubmitting(false);
    //     } else {
    //       setIsSubmitting(false);
    //       if (response.error.status == 500) {
    //         Alert.alert(
    //           'Warning!',
    //           "Can't register now",
    //           [
    //             {
    //               text: 'OK',
    //               onPress: () => {
    //                 console.log('OK pressed');
    //               },
    //             },
    //           ],
    //           { cancelable: false }
    //         );
    //       } else if (response.error.status == 409) {
    //         Alert.alert(
    //           'Alert',
    //           "The Email is already registered",
    //           [
    //             {
    //               text: 'OK',
    //               onPress: () => {
    //                 console.log('OK pressed');
    //               },
    //             },
    //           ],
    //           { cancelable: false }
    //         );
    //       } else if (response.error.status == 405) {
    //         Alert.alert(
    //           'Alert',
    //           "User not approved",
    //           [
    //             {
    //               text: 'OK',
    //               onPress: () => {
    //                 console.log('OK pressed');
    //               },
    //             },
    //           ],
    //           { cancelable: false }
    //         );
    //       } else {
    //         Alert.alert(
    //           'Failure!',
    //           'Network Error',
    //           [
    //             {
    //               text: 'OK',
    //               onPress: () => {
    //                 console.log('OK pressed');
    //               },
    //             },
    //           ],
    //           { cancelable: false }
    //         );
    //       }
    //     }
    //   } catch (error) {
    //     setIsSubmitting(false);
    //     console.error('Signup failed: ', error);
    //     Alert.alert(
    //       'Failure!',
    //       'Network Error',
    //       [
    //         {
    //           text: 'OK',
    //           onPress: () => {
    //             console.log('OK pressed');
    //           },
    //         },
    //       ],
    //       { cancelable: false }
    //     );
    //   }
    // }
    if (!validation()) {
      setIsSubmitting(false); // Validation failed, stop submission
      return;
    }
    try {
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
        successAlerts();
        setIsSubmitting(false);
      } else {
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
            <View style={styles.backTitle} />
            <Animated.View style={[styles.backTitle, { opacity: fadeAnim, backgroundColor: '#0f00c4' }]}></Animated.View>
            <Text style={styles.title}>CAREGIVERS REGISTER HERE!</Text>
            <View style={{flexDirection:'row', justifyContent: 'center', marginVertical: 10}}>
              {/* <View style={styles.marker} /> */}
              <Text style={[styles.text, {flexDirection:'row'}]}>
                NOTE: Your Registration will be in <Text style={[styles.text, {color:'#0000ff'}]}>"PENDING"</Text> {"\n"}
                &nbsp;Status until your information is verified. Once
                <Text style={[styles.text, {color:'#008000'}]}> "APPROVED" </Text>you will be notified by email.
              </Text>
            </View>
          </View>
          <View style={styles.authInfo}>
            <Text style={styles.subject}>CONTACT INFORMATION</Text>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Name <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[styles.input, {width: '50%'}]}
                  placeholder="First"
                  onChangeText={e => setFirstName(e)}
                  value={firstName || ''}
                />
                <TextInput
                  style={[styles.input, {width: '50%'}]}
                  placeholder="Last"
                  onChangeText={e => setLastName(e)}
                  value={lastName || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Email <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[styles.input, {width: '100%'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={e => setEmail(e)}
                  value={email || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Phone <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  placeholder="(___) ___-____"
                  value={phoneNumber}
                  style={[styles.input, {width: '100%'}]}
                  onChangeText={(e) => handlePhoneNumberChange(e)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Title <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{position: 'relative', width: '100%', gap: 5}}>
                <Pressable style= {{width: '100%', height: 50, zIndex: 10}} onPress={handleTitles}>
                </Pressable>
                  <TextInput
                    style={[styles.input, {width: '100%', zIndex: 0, position: 'absolute', top: 0}]}
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
                      <Text style={styles.subtitle} onPress={()=> handleItemPress('')}>Select Title...</Text>
                      <Text style={styles.subtitle} onPress={()=> handleItemPress('CNA')}>CNA</Text>
                      <Text style={styles.subtitle} onPress={()=> handleItemPress('LPN')}>LPN</Text>
                      <Text style={styles.subtitle} onPress={()=> handleItemPress('RN')}>RN</Text>
                    </View>
                  </View>
                </Modal>}
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Date of Birth <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'column', width: '100%', gap: 5, position: 'relative'}}>
                <TouchableOpacity onPress={() => setShowCalendar(true)} style={{width: '100%', height: 40, zIndex: 1}}></TouchableOpacity>
                <TextInput
                  style={[styles.input, {width: '100%', position: 'absolute', zIndex: 0, color: 'black'}]}
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
              <Text style={styles.subtitle}> SS# <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[styles.input, {width: '100%'}]}
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
              <Text style={styles.subtitle}> Verify SS# <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[styles.input, {width: '100%'}]}
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
              <Text style={styles.subtitle}> Caregiver Address <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'column', width: '100%', gap: 5}}>
                <View style={{width: '100%', marginBottom: 10}}>
                  <TextInput
                    style={[styles.input, {width: '100%', marginBottom: 0}]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleInputAddress('streetAddress', e)}
                    value={address.streetAddress || ''}
                  />
                  <Text style={{ color: 'black', paddingLeft: 5 }}>Street Address<Text style={{color: 'red'}}> *</Text></Text>
                </View>
                <View style={{width: '100%', marginBottom: 10}}>
                  <TextInput
                    style={[styles.input, {width: '100%', marginBottom: 0}]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleInputAddress('streetAddress2', e)}
                    value={address.streetAddress2 || ''}
                  />
                  <Text style={{ color: 'black', paddingLeft: 5 }}>Street Address2</Text>
                </View>
                <View style={{flexDirection: 'row', width: '100%', gap: 5, marginBottom: 30}}>
                  <View style={[styles.input, {width: '45%'}]}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, {width: '100%', marginBottom: 0}]}
                      onChangeText={e => handleInputAddress('city', e)}
                      value={address.city || ''}
                    />
                    <Text style={{ color: 'black', paddingLeft: 5 }}>City<Text style={{color: 'red'}}> *</Text></Text>
                  </View>
                  <View style={[styles.input, {width: '20%'}]}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, {width: '100%', marginBottom: 0, paddingLeft: 1}]}
                      onChangeText={e => handleInputAddress('state', e)}
                      value={address.state || ''}
                    />
                    <Text style={{ color: 'black', paddingLeft: 5 }}>State<Text style={{color: 'red'}}> *</Text></Text>
                  </View>
                  <View style={[styles.input, {width: '30%'}]}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, {width: '100%', marginBottom: 0}]}
                      onChangeText={e => handleInputAddress('zip', e)}
                      value={address.zip || ''}
                    />
                    <Text style={{ color: 'black', paddingLeft: 5 }}>Zip<Text style={{color: 'red'}}> *</Text></Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.email}>
              <Text style={styles.subtitle}> Upload Pic. (Optional)</Text>
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={toggleFileTypeSelectModal} style={styles.chooseFile}>
                  <Text style={{fontWeight: '400', padding: 0, fontSize: 14, color: 'black'}}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, {width: '70%', color: 'black'}]}
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
                  marginBottom: 10, 
                  fontSize: 16, 
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
                style={[styles.input, {width: '100%'}]}
                placeholder=""
                onChangeText={e => setPassword(e)}
                value={password || ''}
              />
              <TextInput
                autoCorrect={false}
                autoCapitalize="none"
                secureTextEntry={true}
                style={[styles.input, {width: '100%'}]}
                placeholder=""
                onChangeText={e => setConfirmPassword(e)}
                value={confirmPassword || ''}
              />
              <Text style={[styles.subtitle, { fontStyle:'italic', fontSize: 14, color: 'red' }]}> Create your password to access the platform </Text>
            </View>
            
            <View style={styles.password}>
              <Text style={styles.subtitle}>Signature<Text style={{color: 'red'}}>*</Text> </Text>  
              
              <SignatureCapture
                style={styles.signature}
                ref={signatureRef}
                onSaveEvent={onSaveEvent}
                saveImageFileInExtStorage={false}
                showNativeButtons={true}
              />

              {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <SignatureCapture
                  style={styles.signature}
                  ref={signatureRef}
                  onSaveEvent={onSaveEvent}
                  saveImageFileInExtStorage={false}
                  showNativeButtons={false}
                />
                <TouchableOpacity onPress={resetSignature} style={{ backgroundColor: '#ccc', padding: 5, width: 'auto', height: 'auto', marginLeft: 5 }}>
                  <Text style={{fontWeight: '400', padding: 0, fontSize: 14, color: 'black'}}>Reset</Text>
                </TouchableOpacity>
              </View> */}

            </View>
            
            <View style={[styles.email, {marginTop: 20}]}>
              <Text style={{fontWeight: '400', color: 'black'}}>
                As a web marketplace dedicated to booking shifts for independent contractors and customers like you, we require your signature on this disclosure statement to ensure clarity and transparency in our working relationship. By signing, you acknowledge your understanding of our role as a web-based intermediary between independent contractors and customers needing shifts booked. We are committed to upholding ethical standards, ensuring compliance with industry regulations, and prioritizing your best interests throughout the placement process. Your signature signifies mutual agreement and cooperation as we work together to match skills with open shifts. Thank you for trusting BookSmart™ for your next gig!
              </Text>

            </View>

            <View style={[styles.btn, {marginTop: 20}]}>
              <HButton style={styles.subBtn} 
                onPress={ handlePreSubmit }>
                Submit
              </HButton>
            </View>

            <Text style={{textDecorationLine: 'underline', color: '#2a53c1', marginBottom: 100}}
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
                <View style={styles.header}>
                  <Text style={styles.headerText}>Choose File</Text>
                  <TouchableOpacity style={{ width: 20, height: 20 }} onPress={toggleFileTypeSelectModal}>
                    <Image source={images.close} style={{ width: 20, height: 20 }} />
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <View style={[styles.modalBody, { marginBottom: 20 }]}>
                    <View style={styles.cameraContain}>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={() => {handleChangeFileType('photo'); openCamera();}}>
                        <Image source={images.camera} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={() => {handleChangeFileType('gallery'); pickGallery();}}>
                        <Image source={images.gallery} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={() => {handleChangeFileType('library'); pickFile();}}>
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
    marginTop: 97,
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
  text: {
    fontSize: 14,
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
    // marginBottom: 100,
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
    marginTop: 30
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
    fontSize: 18,
    borderRadius: 5,
    textAlign: 'center'
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
    fontSize: 16,
    color: 'black',
    textAlign: 'left',
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: 'bold'
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
    marginTop: 0,
    padding: 10,
    backgroundColor: '#A020F0',
    color: 'white',
    fontSize: 16,
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
    height: '20%,',
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
