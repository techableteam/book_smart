import { Alert, StyleSheet, View, Image, Text, ScrollView, TouchableOpacity, Modal, StatusBar, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAtom } from 'jotai';
import images from '../../assets/images';
import { TextInput } from 'react-native-paper';
import HButton from '../../components/Hbutton';
import MHeader from '../../components/Mheader';
import MFooter from '../../components/Mfooter';
import DatePicker from 'react-native-date-picker';
import MSubNavbar from '../../components/MSubNavbar';
import { getUserInfo, Update } from '../../utils/useApi';
import { aicAtom } from '../../context/ClinicalAuthProvider';
// Choose file
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs'
import Loader from '../Loader';
import constStyles from '../../assets/styles';
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function EditProfile({ navigation }) {
  const [aic, setAIC] = useAtom(aicAtom);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [photoImage, setPhotoImage] = useState('');
  const [title, setTitle] = useState('');
  const [birthdays, setBirthdays] = useState('');
  const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
  const [driverLicense, setDriverLicense] = useState({
    content: '',
    type: '',
    name: ''
  }); 
  const [socialCard, setSocialCard] = useState({
    content: '',
    type: '',
    name: ''
  });
  const [physicalExam, setPhysicalExam] = useState({
    content: '',
    type: '',
    name: ''
  }); 
  const [ppd, setPPD] = useState({
    content: '',
    type: '',
    name: ''
  });
  const [mmr, setMMR] = useState({
    content: '',
    type: '',
    name: ''
  }); 
  const [healthcareLicense, setHealthcareLicense] = useState({
    content: '',
    type: '',
    name: ''
  });
  const [resume, setResume] = useState({
    content: '',
    type: '',
    name: ''
  }); 
  const [covidCard, setCovidCard] = useState({
    content: '',
    type: '',
    name: ''
  });
  const [bls, setBls] = useState({
    content: '',
    type: '',
    name: ''
  }); 
  const [sfileType, setFiletype] = useState('');
  const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [ credentials, setCredentials ] = useState({
    firstName: firstName,
    lastName: lastName,
    email: email,
    phoneNumber: phoneNumber,
    title: title,
    birthday: birthdays,
    socialSecurityNumber: socialSecurityNumber,
    address: address,
    photoImage: photoImage,
    driverLicense:driverLicense, 
    socialCard: socialCard,
    physicalExam: physicalExam, 
    ppd: ppd, 
    mmr: mmr, 
    healthcareLicense: healthcareLicense, 
    resume: resume, 
    covidCard: covidCard, 
    bls: bls
  });

  const getData = async () => {
    setLoading(true);
    let result = await getUserInfo({ userId: aic }, 'clinical');
    console.log(result);
    if (!result?.error) {
      const updatedCredentials = { ...credentials };
      Object.keys(updatedCredentials).forEach((key) => {
        if (result.userData[key]) {
          if (typeof updatedCredentials[key] === 'object') {
            updatedCredentials[key] = { ...updatedCredentials[key], ...result.userData[key] };
          } else if (result.userData[key] == true) {
            updatedCredentials[key] = result.userData[key] == true ? 1 : 0;
          } else {
            updatedCredentials[key] = result.userData[key];
          }
        }
      });
      setCredentials(updatedCredentials);
      setLoading(false);
    } else {
      setLoading(false);
      Alert.alert(
        'Warning!',
        'Please try again later',
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

  // useFocusEffect(
  //   React.useCallback(() => {
  //     getData();
  //   }, [])
  // );
  useEffect(() => {
    getData();
  }, []);

  const handleCredentials = (target, e) => {
    if (target !== "streetAddress" && target !== "streetAddress2" && target !== "city" && target !== "state" && target !== "zip") {
      setCredentials({...credentials, [target]: e});
    } else {
      setCredentials({...credentials, address: {...credentials.address, [target]: e}})
    }
  };

  const [showModal, setShowModal] = useState(false);
  const handleItemPress = (text) => {
    handleCredentials('title', text);
    setShowModal(false);
  };

  //-------------------------------------------Date Picker---------------------------------------
  const [birthday, setBirthday] = useState(new Date());
  const [showCalender, setShowCalendar] = useState(false);
  const handleDayChange = (target, day) => {
    setBirthday(day);
    handleCredentials(target, day);
  }

  //-------------------------------------------File Upload----------------------------
  const toggleFileTypeSelectModal = () => {
    setFiletypeSelectModal(!fileTypeSelectModal);
  };
  
  const handleChangeFileType = (name) => {
    setFiletype(name);
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
          
          handleCredentials(sfileType, {
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
          
          handleCredentials(sfileType, {
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
      handleCredentials(sfileType, { content: `${fileContent}`, type: fileType, name: res[0].name });
      toggleFileTypeSelectModal();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Handle other errors
      }
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
    handleCredentials('phoneNumber', formattedNumber);
  };

  const handleBack = () => {
    navigation.navigate('MyHome');
  };

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

  const handleSubmit = async () => {
    setLoading(true);
    if (credentials.email === '' || 
      credentials.firstName === '' || 
      credentials.lastName ==='' || 
      credentials.phoneNumber ==='' || 
      credentials.title ==='' || 
      credentials.birthday ==='' || 
      credentials.socialSecurityNumber ==='' || 
      credentials.address.streetAddress ==='' || 
      credentials.address.city ==='' || 
      credentials.address.state ==='' || 
      credentials.address.zip ==='') {
        showAlerts('all gaps')
        setLoading(false);
    } else {
      setLoading(true);
      try {
        const response = await Update(credentials, 'clinical');
        // setFirstName(response.user.firstName);
        // setLastName(response.user.lastName);
        // setBirthdays(response.user.birthday);
        // setPhoneNumber(response.user.phoneNumber);
        // setEmail(response.user.email);
        // setTitle(response.user.title);
        // setPhotoImage(response.user.photoImage);
        // setUserRole(response.user.userRole);
        // setDriverLicense(response.user.driverLicense);
        // setSocialCard(response.user.socialCard);
        // setPhysicalExam(response.user.physicalExam);
        // setPPD(response.user.ppd);
        // setMMR(response.user.mmr);
        // setHealthcareLicense(response.user.healthcareLicense);
        // setResume(response.user.resume);
        // setCovidCard(response.user.covidCard);
        // setBls(response.user.bls);
        console.log('successfully Updated')
        setLoading(false);
        navigation.navigate("MyHome")
      } catch (error) {
        setLoading(false);
        console.error('Update failed: ', error)
      }
    }
  }

  const handleRemove = (name) => {
    handleCredentials(name, {
      content: '',
      name: '',
      type: ''
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent"/>
      <MHeader navigation={navigation}/>
      <MSubNavbar navigation={navigation} name={"Caregiver"}/>
      <ScrollView style = {styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.modal}>
          <View style={styles.authInfo}>
            <View>
              <Text style={constStyles.loginSubTitle}> Name <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[constStyles.signUpinput, {width: '50%'}]}
                  placeholder="First"
                  onChangeText={e => handleCredentials('firstName', e)}
                  value={credentials.firstName || ''}
                />
                <TextInput
                  style={[constStyles.signUpinput, {width: '50%'}]}
                  placeholder="Last"
                  onChangeText={e => handleCredentials('lastName', e)}
                  value={credentials.lastName || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Email <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[constStyles.signUpinput, {width: '100%'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={e => handleCredentials('email', e)}
                  value={credentials.email || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Phone <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  value={credentials.phoneNumber}
                  style={[constStyles.signUpinput, {width: '100%'}]}
                  onChangeText={handlePhoneNumberChange}
                  keyboardType="phone-pad"
                  placeholder={credentials.phoneNumber}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> SSN <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[constStyles.signUpinput, {width: '100%'}]}
                  placeholder={credentials.socialSecurityNumber}
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="numeric" // Set the keyboardType to "numeric"
                  onChangeText={e => handleCredentials('socialSecurityNumber', e)}
                  value={credentials.socialSecurityNumber || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Date of Birth <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'column', width: '100%', gap: 5}}>
                <TouchableOpacity onPress={() => {setShowCalendar(true), console.log(showCalender)}} style={{width: '100%', height: RFValue(50), zIndex: RFValue(10)}}>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '100%', position: 'absolute', zIndex: 0}]}
                  placeholder=""
                  value={birthday.toDateString()}
                  editable={false}
                />
                
                {/* <Button title="Select Birthday" onPress={() => setShowCalendar(true)} /> */}
                {showCalender && 
                <>
                  <DatePicker
                    date={birthday}
                    onDateChange={(day) => handleDayChange('birthday', day)}
                    mode="date" // Set the mode to "date" to allow year and month selection
                    androidVariant="native"
                  />
                  <Button title="confirm" style = {constStyles.loginMainButton} onPress={(day) =>{setShowCalendar(!showCalender);}} />
                </>
                }
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Caregiver Address <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'column', width: '100%', gap: 5}}>
                <View style={{width: '100%', marginBottom: 10}}>
                  <TextInput
                    style={[constStyles.signUpinput, {width: '100%', marginBottom: 0}]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleCredentials('streetAddress', e)}
                    value={credentials.address.streetAddress || ''}
                  />
                  <Text style = {constStyles.signUpsmalltitle}>Street Address</Text>
                </View>
                <View style={{width: '100%', marginBottom: 10}}>
                  <TextInput
                    style={[constStyles.signUpinput, {width: '100%', marginBottom: 0}]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleCredentials('streetAddress2', e)}
                    value={credentials.address.streetAddress2 || ''}
                  />
                  <Text style = {constStyles.signUpsmalltitle}>Street Address2</Text>
                </View>
                <View style={{flexDirection: 'row', width: '100%', gap: 5, marginBottom: 30}}>
                  <View style={[constStyles.signUpinput, {width: '45%'}]}>
                    <TextInput
                      placeholder=""
                      style={[constStyles.signUpinput, {width: '100%', marginBottom: 0}]}
                      onChangeText={e => handleCredentials('city', e)}
                      value={credentials.address.city || ''}
                    />
                    <Text style = {constStyles.signUpsmalltitle}>City</Text>
                  </View>
                  <View style={[constStyles.signUpinput, {width: '20%'}]}>
                    <TextInput
                      placeholder=""
                      style={[constStyles.signUpinput, {width: '100%', marginBottom: 0}]}
                      onChangeText={e => handleCredentials('state', e)}
                      value={credentials.address.state || ''}
                    />
                    <Text style = {constStyles.signUpsmalltitle}>State</Text>
                  </View>
                  <View style={[constStyles.signUpinput, {width: '30%'}]}>
                    <TextInput
                      placeholder=""
                      style={[constStyles.signUpinput, {width: '100%', marginBottom: 0}]}
                      // keyboardType="numeric" // Set the keyboardType to "numeric" for zip input
                      onChangeText={e => handleCredentials('zip', e)}
                      value={credentials.address.zip || ''}
                    />
                    <Text style = {constStyles.signUpsmalltitle}>Zip</Text>
                  </View>
                </View>
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Title <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{position: 'relative', width: '100%', gap: 5, height: 50}}>
                <TouchableOpacity onPress = {()=>setShowModal(true)}
                  style={{height: 40, zIndex: 1}}
                >
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '100%', position: 'absolute', zIndex: 0}]}
                  placeholder="First"
                  editable= {false}
                  // onChangeText={e => handleCredentials('firstName', e)}
                  value={credentials.title != ''?credentials.title : 'Select Title ...' }
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
                      <Text style={constStyles.signUpinput} onPress={()=>handleItemPress('')}>Select Title...</Text>
                      <Text style={constStyles.signUpinput} onPress={()=>handleItemPress('CNA')}>CNA</Text>
                      <Text style={constStyles.signUpinput} onPress={()=>handleItemPress('LPN')}>LPN</Text>
                      <Text style={constStyles.signUpinput} onPress={()=>handleItemPress('RN')}>RN</Text>
                    </View>
                  </View>
                </Modal>}
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Pic. (Optional)</Text>
              {credentials.photoImage.name !== "" && <View style={{marginBottom: 10}}>
                <Text style={constStyles.profileChoosenText}
                  onPress={() => navigation.navigate("UserFileViewer", { userId: aic, filename: 'photoImage' })}
                >{credentials.photoImage.name} &nbsp;&nbsp;</Text>
                <Text style={constStyles.profileChoosenText}
                  onPress = {() => handleRemove('photoImage')}
                >remove</Text>
              </View>}
              
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={()=>handleChangeFileType('photoImage')} style={styles.chooseFile}>
                  <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(12), color: 'black'}}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.photoImage.name || ''}
                />
              </View>
            </View>
            <View style={styles.bottomBar}/>
          </View>
          <View style={styles.authInfo}>
            <View style={styles.profileTitleBg}>
              <Text style={styles.profileTitle}>MY DOCUMENTS</Text>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Driver's License</Text>
              {credentials.driverLicense.name !== "" &&<View style={{marginBottom: 10}}>
                <Text style={constStyles.profileChoosenText}
                  onPress={() => navigation.navigate("UserFileViewer", { userId: aic, filename: 'driverLicense' })}
                >{credentials.driverLicense.name} &nbsp;&nbsp;</Text>
                <Text style={constStyles.profileChoosenText}
                  onPress = {() => handleRemove('driverLicense')}
                >remove</Text>
              </View>}

              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={()=>handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                  <Text style={constStyles.profileChooseButton}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.driverLicense.name || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Social Security Card</Text>
              {credentials.socialCard.name !== "" &&<View style={{marginBottom: 10}}>
                <Text style={constStyles.profileChoosenText}
                  onPress={() => navigation.navigate("UserFileViewer", { userId: aic, filename: 'socialCard' })}
                >{credentials.socialCard.name} &nbsp;&nbsp;</Text>
                <Text style={constStyles.profileChoosenText}
                  onPress = {() => handleRemove('socialCard')}
                >remove</Text>
              </View>}
              
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={()=>handleChangeFileType('socialCard')} style={styles.chooseFile}>
                  <Text style={constStyles.profileChooseButton}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.socialCard.name || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Physical Exam</Text>
              {credentials.physicalExam.name !== "" &&<View style={{marginBottom: 10}}>
                <Text style={constStyles.profileChoosenText}
                onPress={() => navigation.navigate("UserFileViewer", { userId: aic, filename: 'physicalExam' })}
                >{credentials.physicalExam.name} &nbsp;&nbsp;</Text>
                <Text style={constStyles.profileChoosenText}
                  onPress = {() => handleRemove('physicalExam')}
                >remove</Text>
              </View>}
              
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={()=>handleChangeFileType('physicalExam')} style={styles.chooseFile}>
                  <Text style={constStyles.profileChooseButton}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.physicalExam.name || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> PPD (TB Test)</Text>
              {credentials.ppd.name !== "" &&<View style={{marginBottom: 10}}>
                <Text style={constStyles.profileChoosenText}
                onPress={() => navigation.navigate("UserFileViewer", { userId: aic, filename: 'ppd' })}
                >{credentials.ppd.name} &nbsp;&nbsp;</Text>
                <Text style={constStyles.profileChoosenText}
                  onPress = {() => handleRemove('ppd')}
                >remove</Text>
              </View>}
              
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={()=>handleChangeFileType('ppd')} style={styles.chooseFile}>
                  <Text style={constStyles.profileChooseButton}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.ppd.name || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> MMR (Immunizations)</Text>
              {credentials.mmr.name !== "" &&<View style={{marginBottom: 10}}>
                <Text style={constStyles.profileChoosenText}
                onPress={() => navigation.navigate("UserFileViewer", { userId: aic, filename: 'mmr' })}
                >{credentials.mmr.name} &nbsp;&nbsp;</Text>
                <Text style={constStyles.profileChoosenText}
                  onPress = {() => handleRemove('mmr')}
                >remove</Text>
              </View>}
              
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={()=>handleChangeFileType('mmr')} style={styles.chooseFile}>
                  <Text style={constStyles.profileChooseButton}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.mmr.name || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Healthcare License</Text>
              {credentials.healthcareLicense.name !== "" &&<View style={{marginBottom: 10}}>
                <Text style={constStyles.profileChoosenText}
                onPress={() => navigation.navigate("UserFileViewer", { userId: aic, filename: 'healthcareLicense' })}
                >{credentials.healthcareLicense.name} &nbsp;&nbsp;</Text>
                <Text style={constStyles.profileChoosenText}
                  onPress = {() => handleRemove('healthcareLicense')}
                >remove</Text>
              </View>}
              
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={()=>handleChangeFileType('healthcareLicense')} style={styles.chooseFile}>
                  <Text style={constStyles.profileChooseButton}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.healthcareLicense.name || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> Resume</Text>
              {credentials.resume.name !== "" &&<View style={{marginBottom: 10}}>
                <Text style={constStyles.profileChoosenText}
                onPress={() => navigation.navigate("UserFileViewer", { userId: aic, filename: 'resume' })}
                >{credentials.resume.name} &nbsp;&nbsp;</Text>
                <Text style={constStyles.profileChoosenText}
                  onPress = {() => handleRemove('resume')}
                >remove</Text>
              </View>}
              
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={()=>handleChangeFileType('resume')} style={styles.chooseFile}>
                  <Text style={constStyles.profileChooseButton}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.resume.name || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> COVID Card</Text>
              {credentials.covidCard.name !== "" &&<View style={{marginBottom: 10}}>
                <Text style={constStyles.profileChoosenText}
                onPress={() => navigation.navigate("UserFileViewer", { userId: aic, filename: 'covidCard' })}
                >{credentials.covidCard.name} &nbsp;&nbsp;</Text>
                <Text style={constStyles.profileChoosenText}
                  onPress = {() => handleRemove('covidCard')}
                >remove</Text>
              </View>}
              
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={()=>handleChangeFileType('covidCard')} style={styles.chooseFile}>
                  <Text style={constStyles.profileChooseButton}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.covidCard.name || ''}
                />
              </View>
            </View>
            <View>
              <Text style={constStyles.loginSubTitle}> BLS(CPR card)</Text>
              {credentials.bls.name !== "" &&<View style={{marginBottom: 10}}>
                <Text style={constStyles.profileChoosenText}
                onPress={() => navigation.navigate("UserFileViewer", { userId: aic, filename: 'bls' })}
                >{credentials.bls.name} &nbsp;&nbsp;</Text>
                <Text style={constStyles.profileChoosenText}
                  onPress = {() => handleRemove('bls')}
                >remove</Text>
              </View>}
              
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={()=>handleChangeFileType('bls')} style={styles.chooseFile}>
                  <Text style={constStyles.profileChooseButton}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[constStyles.signUpinput, {width: '70%', color: 'black'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={credentials.bls.name || ''}
                />
              </View>
              <Text style={[constStyles.signUpSubtitle, {lineHeight:30}]}> W - 9 {'\n'}
                Standard State Criminal{'\n'}
                Drug Test{'\n'}
                Hep B (shot or declination){'\n'}
                Flu (shot or declination){'\n'}
                CHRC 102 Form{'\n'}
                CHRC 103 Form{'\n'}
              </Text>
            </View>
            <View style={[styles.btn, {marginTop: 20}]}>
              <HButton style={styles.subBtn} onPress={ handleSubmit }>
                Submit
              </HButton>
            </View>
            <Text style={{textDecorationLine: 'underline', color: '#2a53c1', marginBottom: 20 }}
              onPress={handleBack}
            >
              Back to 🏚️ Caregiver Profile
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
      <Loader visible={loading} />
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
    backgroundColor: '#fffff8'
  },
  scroll: {
    marginTop: height * 0.25,
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
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginLeft: '5%',
    padding: 15,
    width: '90%',
    backgroundColor: 'transparent'
  },
  bottomBar: {
    marginTop: 20,
    height: 5,
    backgroundColor: '#C0D1DD',
    width: '100%'
  },
  profileTitleBg: {
    backgroundColor: '#BC222F',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    marginLeft: '10%',
    marginVertical: 20
  },
  profileTitle: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: RFValue(16)
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
    marginBottom: 100,
    borderWidth: 1,
    borderColor: 'grey',
    overflow: 'hidden',
    shadowColor: 'black', // Shadow color
    shadowOffset: { width: 0, height: 10 }, // Shadow offset
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 3, // Shadow radius
    elevation: 0, // Elevation for Android devices
    backgroundColor: "#dcd6fa",
  },
  intro: {
    marginTop: 30
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
    fontSize: 20,
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
  textStyle: {
    color: 'black'
  }
});
