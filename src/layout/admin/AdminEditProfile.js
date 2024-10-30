import { Alert, StyleSheet, View, Image, Text, ScrollView, TouchableOpacity, Modal, StatusBar, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import images from '../../assets/images';
import { TextInput } from 'react-native-paper';
import HButton from '../../components/Hbutton';
import MHeader from '../../components/Mheader';
import MFooter from '../../components/Mfooter';
import { getAdminInfo, Update } from '../../utils/useApi';
import MSubNavbar from '../../components/MSubNavbar';
import { useAtom } from 'jotai';
import { emailAtom, firstNameAtom, lastNameAtom } from '../../context/AdminAuthProvider'
// Choose file
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs'
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function AdminEditProfile({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useAtom(emailAtom);
  const [tfirstName, settfirstNmae] = useAtom(firstNameAtom);
  const [tlastName, settlastNmae] = useAtom(lastNameAtom);
  const [temail, setTemail] = useState('');
  const [avatar, setAvatar] = useState({ name: '', type: '', content: '' });
  const [address, setAddress]= useState({ street: '', street2: '', city: '', state: '', zip: '' });
  const [fileType, setFiletype] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);

  // //--------------------------------------------Credentials-----------------------------
  // const [ credentials, setCredentials ] = useState({
  //   firstName: firstName,
  //   lastName: lastName,
  //   email: email,
  //   phone: phone,
  //   companyName: companyName,
  //   birthday: Date("07/24/2024"),
  //   socialSecurityNumber: '123123123',
  //   address: address,
  //   photoImage: avatar,
  // });

  const getData = async () => {
    setLoading(true);
    let response = await getAdminInfo({ email: email });
    console.log(response);
    if (response?.error) {
      setFirstName('');
      setLastName('');
      setCompanyName('');
      setPhone('');
      setAvatar({  name: '', type: '', content: '' });
      setTemail('');
      setAddress({ street: '', street2: '', city: '', state: '', zip: '' });
    } else {
      setFirstName(response.user.firstName);
      setLastName(response.user.lastName);
      setCompanyName(response.user.companyName);
      setPhone(response.user.phone);
      setAvatar(response.user.photoImage);
      setTemail(response.user.email);
      setAddress(response.user.address);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleChangeAddress = (target, e) => {
    setAddress((prevAddress) => ({
      ...prevAddress,
      [target]: e, // Access the value from the event target
    }));
  };

  //-------------------------------------------File Upload----------------------------

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
          
          setAvatar({
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
          
          setAvatar({
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
      setAvatar({ content: `${fileContent}`, type: fileType, name: res[0].name });
      toggleFileTypeSelectModal();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Handle other errors
      }
    }
  };

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
    setPhone(formattedNumber);
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
    if (email === '' || firstName === '' || lastName ==='') {
        showAlerts('all gaps')
    } else {
      setLoading(true);
      try {
        const credentials = {
          firstName,
          lastName,
          email: temail,
          phone,
          photoImage: avatar,
          address,
          companyName
        };
        const response = await Update(credentials, "Admin");
        setFirstName(response.user.firstName);
        setLastName(response.user.lastName);
        setEmail(response.user.email);
        settfirstNmae(response.user.firstName);
        settlastNmae(response.user.lastName);
        navigation.goBack();
      } catch (error) {
        console.error('Signup failed: ', error);
      }
      setLoading(false);
    }
  }

  const handleRemove = (name) => {
    setAvatar({type: "", content: "", name: ""});
  }

  const handleShowFile = (data) => {
    navigation.navigate("FileViewer", { jobId: '', fileData: data });
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        translucent backgroundColor="transparent"
      />
      <MHeader navigation={navigation}/>
      <MSubNavbar navigation={navigation} name={"Admin"} />
      <ScrollView style = {styles.scroll}    
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modal}>
          <View style={styles.authInfo}>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Company Name </Text>
                <TextInput
                  style={[styles.input, {width: '100%'}]}
                  placeholder=""
                  onChangeText={e => setCompanyName(e)}
                  value={companyName}
                />
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Name <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[styles.input, {width: '50%'}]}
                  placeholder="First"
                  onChangeText={e => setFirstName(e)}
                  value={firstName}
                />
                <TextInput
                  style={[styles.input, {width: '50%'}]}
                  placeholder="Last"
                  onChangeText={e => setLastName(e)}
                  value={lastName}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}>  Email <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  style={[styles.input, {width: '100%'}]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={e => setTemail(e)}
                  value={temail}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}>  Phone <Text style={{color: 'red'}}>*</Text> </Text>
              <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                <TextInput
                  value={phone}
                  style={[styles.input, {width: '100%'}]}
                  onChangeText={handlePhoneNumberChange}
                  keyboardType="phone-pad"
                  placeholder={''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Logo </Text>
              {avatar.name &&
              <View style={{marginBottom: 10}}>
                <Text style={{ color: 'blue' }} onPress={() => handleShowFile(avatar)}>{avatar.name}</Text>
                <Text style={{color: '#0000ff', textDecorationLine: 'underline'}}
                  onPress = {() => handleRemove('photoImage')}
                >remove</Text>
              </View>}
              
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TouchableOpacity title="Select File" onPress={toggleFileTypeSelectModal} style={styles.chooseFile}>
                  <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14), color:"black"}}>Choose File</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { width: '65%', color: 'black', height: 30 }]}
                  placeholder=""
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={avatar.name || ''}
                />
              </View>
            </View>
            <View style={styles.email}>
              <Text style={styles.subtitle}> Address </Text>
              <View style={{flexDirection: 'column', width: '100%', gap: 5}}>
                <View style={{width: '100%', marginBottom: 10}}>
                  <TextInput
                    style={[styles.input, {width: '100%', marginBottom: 0}]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleChangeAddress('street', e)}
                    value={address.street || ''}
                  />
                  <Text style = {{color:"black", marginLeft:5}}>Street Address</Text>
                </View>
                <View style={{width: '100%', marginBottom: 10}}>
                  <TextInput
                    style={[styles.input, {width: '100%', marginBottom: 0}]}
                    placeholder=""
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={e => handleChangeAddress('street2', e)}
                    value={address.street2 || ''}
                  />
                  <Text style = {{color:"black", marginLeft:5}}>Street Address2</Text>
                </View>
                <View style={{flexDirection: 'row', width: '100%', gap: 5, marginBottom: 30}}>
                  <View style={{width: '45%'}}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, {width: '100%', marginBottom: 0}]}
                      onChangeText={e => handleChangeAddress('city', e)}
                      value={address.city || ''}
                    />
                    <Text style = {{color:"black", marginLeft:5}}>City</Text>
                  </View>
                  <View style={{width: '20%'}}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, {width: '100%', marginBottom: 0}]}
                      onChangeText={e => handleChangeAddress('state', e)}
                      value={address.state || ''}
                    />
                    <Text style = {{color:"black", marginLeft:5}}>State</Text>
                  </View>
                  <View style={{width: '30%'}}>
                    <TextInput
                      placeholder=""
                      style={[styles.input, {width: '100%', marginBottom: 0}]}
                      // keyboardType="numeric" // Set the keyboardType to "numeric" for zip input
                      onChangeText={e => handleChangeAddress('zip', e)}
                      value={address.zip || ''}
                    />
                    <Text style = {{color:"black", marginLeft:5}}>Zip</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={[styles.btn, {marginTop: 20}]}>
              <HButton style={styles.subBtn} onPress={ handleSubmit }>
                Submit
              </HButton>
            </View>
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
    paddingVertical: 5
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
    marginBottom: 50,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 130
  },
  btn: {
    flexDirection: 'column',
    gap: 20
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
    height: 40, 
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
    fontSize: RFValue(18),
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
