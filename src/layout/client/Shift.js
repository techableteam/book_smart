import React, { useState } from 'react';
import { Modal, TextInput, View, Image, Platform, Alert, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { PermissionsAndroid } from 'react-native';
import { MyShift, updateTimeSheet } from '../../utils/useApi';
import images from '../../assets/images';
import HButton from '../../components/Hbutton'
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import ImageButton from '../../components/ImageButton';
// Choose file
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs'
import Loader from '../Loader';
import AnimatedHeader from '../AnimatedHeader';
import { Dimensions } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function Shift ({ navigation }) {
  const [isModal, setModal] = useState(false);
  const [isUpload, setUpload] = useState(false);
  const [value, setValue] = useState(100);
  const [isFocus, setIsFocus] = useState(false);
  const [data, setData] = useState([]);
  const [userInfos, setUserInfo] = useState([]);
  const [detailedInfos, setDetailedInfos] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [submitData, setSubmitData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [fileType, setFiletype] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);
  const [content, setContent] = useState({
    startTime: '',
    endTime: '',
    lunch: '',
    comments: ''
  });
  const [loading, setLoading] = useState(false); // loading
  const [info, setInfo] = useState([
    {title: 'Job-ID', content: ""},
    {title: 'Entry Date', content: ''},
    {title: 'Caregiver', content: ''},
    {title: 'Date', content: ''},
    {title: 'Hours Worked', content: ""},
    {title: 'Hours Submitted?', content: "yes"},
    {title: 'Hours Approved?', content: "pending"},
  ]);
  const pageItems = [
    {label: '10 per page', value: '10'},
    {label: '25 per page', value: '25'},
    {label: '50 per page', value: '50'},
    {label: '100 per page', value: '100'},
    {label: '500 per page', value: '500'},
    {label: '1000 per page', value: '1000'},
  ];
  
  const getData = async () => {
    setLoading(true);
    let data = await MyShift('jobs', 'Clinician');
    if(!data) {
      setData(['No Data'])
    } else {
      setData(data);
      const transformedData = data.reportData.map(item => [{
        title: 'Job-ID',
        content: item.jobId
      },{
        title: 'Location',
        content: item.location
      },{
        title: 'Rate',
        content: item.payRate
      },{
        title: 'Status',
        content: item.shiftStatus
      },
      {
        title: 'Date',
        content: item.shiftDate
      },
      {
        title: 'Shift',
        content: item.shiftTime
      },
      {
        title: 'Caregiver',
        content: item.caregiver
      },{
        title: 'TimeSheet',
        content: item.timeSheet.name
      }]);

      setUserInfo(transformedData);
      const len = transformedData.length;
      const page = Math.ceil(len / value);
      setTotalPages(page);
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  // useEffect(() => {
  //   getData();
  // }, []);

  async function requestStoragePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to delete files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  const handleNavigate = (navigateUrl) => {
    navigation.navigate(navigateUrl);
  };

  const handleContent = (target, e) => {
    setContent({...content, [target]: e});
  };

  const handleSubmit = () => {
    toggleModal();
  };
  
  const toggleModal = () => {
    setModal(!isModal);
  };

  const handleShowFile = (data) => {
    const jobIdObject = data.find(item => item.title === 'Job-ID');
    const jobId = jobIdObject ? jobIdObject.content : null;
    setUpload(false);
    navigation.navigate("FileViewer", { jobId: jobId, fileData: '' });
  };

  const handleUploadSubmit = async () => {
    setLoading(true);
    setUpload(!isUpload);
    const data = {jobId: submitData.jobId, timeSheet: submitData.timeSheet};
    if (submitData.timeSheet?.name != '') {
      const response = await updateTimeSheet(data, 'jobs');
      setLoading(false);
      if (!response?.error) {
        getData();
        Alert.alert(
          'Success!',
          'Your timesheet has been submitted',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('');
              },
            }
          ],
          { cancelable: false }
        );
      } else {
        setUpload(!isUpload);
        Alert.alert('Failure!', 'Pleae try later', [
          {
            text: 'OK',
            onPress: () => {
              console.log('');
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    } else {
      setLoading(false);
      setUpload(!isUpload);
      Alert.alert('Failure!', 'Please upload documentation', [
        {
          text: 'OK',
          onPress: () => {
            console.log('');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const toggleUploadModal = () => {
    setUpload(!isUpload);
  };

  const handleUploadEdit = (id) => {
    let infoData = data.reportData.find(item => item.jobId === id)
    let detailInfo = [
      { title: 'Job-ID', content: infoData.jobId },
      { title: 'Caregiver', content: infoData.caregiver },
      { title: 'TimeSheet', content: infoData.timeSheet.name },
    ];
    setSubmitData(infoData);
    setDetailedInfos(detailInfo);
    // toggleUploadModal();
    navigation.navigate('UploadTimesheet', { detailInfo: detailInfo, fileData: infoData });
  };

  //-----------------------------------------File Upload---------------------

  const toggleFileTypeSelectModal = () => {
    setFiletypeSelectModal(!fileTypeSelectModal);
  };

  const handleShowSelectModal = () => {
    setFiletypeSelectModal(!fileTypeSelectModal);
    toggleUploadModal();
  };

  const handleChangeFileType = (mode) => {
    setFiletype(mode);
    toggleFileTypeSelectModal();
    // toggleUploadModal();
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
            'Camera error: ' + response.error,
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
            'Camera errorCode: ' + response.errorCode,
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
          Alert.alert(
            'Alert!',
            'Camera Opened',
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
          const fileUri = response.assets[0].uri;
          const fileContent = await RNFS.readFile(fileUri, 'base64');
          
          setSubmitData({
            ...submitData,
            timeSheet: {
              content: fileContent,
              type: 'image',
              name: response.assets[0].fileName,
            },
          });
          
          setTimeout(() => {
            toggleUploadModal();
          }, 1000);
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
          
          setSubmitData({
            ...submitData,
            timeSheet: {
              content: fileContent,
              type: 'image',
              name: response.assets[0].fileName,
            }
          });
          setTimeout(() => {
            toggleUploadModal();
          }, 1000);
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
      setSubmitData({...submitData, timeSheet: {content: fileContent, type: fileType, name: res[0].name}});
      toggleUploadModal();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Handle other errors
      }
    }
  };

  const fileDownload = async () => {
    const fileName = 'BookSmart_Timesheet.pdf';
    dir = RNFS.ExternalStorageDirectoryPath;
  
    if (Platform.OS === 'ios') {
      dir = RNFS.DocumentDirectoryPath;
    } 
      
    const filePath = `${dir}/${fileName}`;
  
    try {
      // Check if the file exists before attempting to delete
      const fileExists = await RNFS.exists(filePath);
      if (fileExists) {

        const hasPermission = await requestStoragePermission();
        if (hasPermission) {
          await RNFS.unlink(filePath)
            .then(() => {
              console.log('Previous file deleted successfully');
            })
            .catch((err) => {
              console.log('delete file erro => ', err);
            });
        } else {
          console.log('Permission denied.');
        }
      }
    } catch (err) {
      console.log('Error deleting the previous file:', err.message);
    }
  
    const options = {
      fromUrl: 'https://lyntex.io/wp-content/uploads/2024/04/BookSmart-Timesheet-2024.pdf',
      toFile: filePath,
      background: true,
      discretionary: true,
      progress: (res) => {
        const progress = (res.bytesWritten / res.contentLength) * 100;
        setDownloading(true);
        setLoading(true);
        console.log(`Download progress: ${progress.toFixed(2)}%`);
      }
    };
  
    console.log('File path:', filePath);
  
    try {
      const result = await RNFS.downloadFile(options).promise;
      console.log('Download result:', result);
      setDownloading(false);
      setLoading(false);
  
      Alert.alert(
        'Alert',
        'The Timesheet has been downloaded',
        [
          {
            text: 'OK',
            onPress: () => console.log('OK pressed'),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.log('There was an error downloading the file:', error.message);
  
      // Retry file download if file creation fails
      if (error.code === 'ENOENT') {
        console.log('Retrying file download...');
        // Retry downloading the file by attempting the same logic again
        // await fileDownload();
        Alert.alert(
          'Alert',
          'Already downloaded',
          [
            {
              text: 'OK',
              onPress: () => console.log('OK pressed'),
            },
          ],
          { cancelable: false }
        );
      }
    }
  };  

  const handleDelete = () => {
    setDetailedInfos(prevUploadInfo => {
      return prevUploadInfo.map((item, index) => {
        if (index === 2) { // Index 2 corresponds to the third item (0-based index)
            return { ...item, content: '' }; // Update the content of the third item
        }
        return item; // Keep other items unchanged
      });
    });
  };
  
  const getItemsForPage = (page) => {
    const startIndex = (page-1) * value;
    const endIndex = Math.min(startIndex + value, userInfos.length);
    return userInfos.slice(startIndex, endIndex);
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const itemsToShow = getItemsForPage(currentPage);

  // if (downloading || isSubmitted) {
  //   return (
  //     <Loader />
  //   );
  // }

  return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <MHeader navigation={navigation} />
        <SubNavbar navigation={navigation} name={'ClientSignIn'}/>
        <ScrollView style={{width: '100%', marginTop: height * 0.25}} showsVerticalScrollIndicator={false}>
          <View style={styles.topView}>
            <AnimatedHeader title="AWARDED & COMPLETED SHIFTS" />
            <View style={styles.bottomBar}/>
          </View>
          <Text style={styles.text}>All of your<Text style={{fontWeight: 'bold'}}>&nbsp;"AWARDED"&nbsp;</Text> shifts will appear below. Once you have completed a shift, upload your timesheet and the shift status will update to <Text style={{fontWeight: 'bold'}}>&nbsp;"PENDING VERIFICAITON"&nbsp;</Text>.</Text>
          {downloading ? (
            <Text style={[styles.text, { marginTop: RFValue(15) }]}>Downloading...</Text>
          ) : (
            <TouchableOpacity onPress={fileDownload}>
              <Text style={[styles.text, { marginTop: RFValue(15), color: 'blue', textDecorationLine: 'underline' }]}>DOWNLOAD TIMESHEET HERE</Text>
            </TouchableOpacity>
          )}
          <View style={styles.imageButton}>
            <ImageButton title={"My Home"} onPress={() => handleNavigate('MyHome')} />
            <ImageButton title={"My Profile"} onPress={() => handleNavigate('EditProfile')} />
            <ImageButton title={"All Shift Listings"} onPress={() => handleNavigate('ShiftListing')} />
            <ImageButton title={"My Reporting"} onPress={() => handleNavigate('Reporting')} />
          </View>
          <View style={styles.profile}>
            <View style={styles.profileTitleBg}>
              <Text style={styles.profileTitle}>🖥️ MY SHIFTS</Text>
            </View>
            {/* <Text style={styles.name}>100 per page</Text> */}
            <View style= {{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                iconStyle={styles.iconStyle}
                data={pageItems}
                // search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={'100 per page'}
                // searchPlaceholder="Search..."
                value={value ? value : pageItems[3].value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setValue(item.value);
                  setIsFocus(false);
                  const len = userInfos.length;
                  console.log(len, 'ddddd00000')
                  const page = Math.ceil(len / item.value);
                  setTotalPages(page);
                }}
                renderLeftIcon={() => (
                  <View
                    style={styles.icon}
                    color={isFocus ? 'blue' : 'black'}
                    name="Safety"
                    size={20}
                  />
                )}
              />
              { totalPages> 1 &&
                <View style={{display: 'flex', flexDirection: 'row', height: 30, marginBottom: 10, alignItems: 'center'}}>
                  <Text onPress={handlePrevPage} style={{width: 20}}>{currentPage>1 ? "<": " "}</Text>
                  <Text style={{width: 20}}>{" "+currentPage+" "}</Text>
                  <Text onPress={handleNextPage} style={{width: 20}}>{currentPage<totalPages ? ">" : " "}</Text>
                </View>
              }
            </View>
            {itemsToShow.map((it, idx) =>
              <View key={idx} style={styles.subBar}>
                {it.map((item, index) => 
                  <View key={index} style={{flexDirection: 'row', width: '100%', gap: 10}}>
                    <Text style={[styles.titles, item.title=="JOB-ID" ? {backgroundColor: "#00ffff"} : {}]}>{item.title}</Text>
                    {item.title == "TimeSheet" ? (
                      <Text
                        style={[styles.content, { color: '#2a53c1', textDecorationLine: 'underline'}]}
                        onPress={() => { handleShowFile(it); }}
                      >{item.content}</Text>
                    ) : (
                      <Text style={styles.content}>{item.content}</Text>
                    )}
                  </View>
                )}
                <View style={{ flex:1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <TouchableOpacity style={[styles.edit, {marginTop: RFValue(15), backgroundColor: '#A020F0'}]} onPress = {() => handleUploadEdit(it[0].content)}>
                    <Text style={{color: 'white', fontSize: RFValue(14), fontWeight:'bold'}}> Upload Timesheet</Text>
                  </TouchableOpacity>
                </View>
              </View>)
            }
          </View>
        </ScrollView>

        {isModal && <Modal
          Visible={false}
          transparent= {true}
          animationType="slide"
          onRequestClose={() => {
            setModal(!isModal);
          }}
        >
          <StatusBar translucent backgroundColor='transparent' />
          <ScrollView style={styles.modalsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.viewContainer}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Add Hours</Text>
                <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleModal}>
                  <Image source = {images.close} style={{width: 20, height: 20,}}/>
                </TouchableOpacity>
              </View>
              <View style={styles.body}>
                <View style={[styles.profileTitleBg, {marginTop: 20, width: '40%'}]}>
                  <Text style={[styles.profileTitle, {textAlign: 'left'}]}>JOB DETAILS</Text>
                </View>
                <View style={styles.modalBody}>
                  {info.map((item, index) => 
                    <View key={index} style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>{item.title}</Text>
                      <Text style={styles.content}>{item.content}</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.profileTitleBg, {marginTop: 20}]}>
                  <Text style={styles.profileTitle}>ADD YOUR HOURS BELOW</Text>
                </View>
                <View style={styles.msgBar}>
                  <Text style={[styles.subtitle, {textAlign: 'left', marginTop: 10, fontWeight: 'bold'}]}>Select - "Clock In & Clock Out Times"</Text>
                  <View style ={styles.timeSheet}>
                    <TextInput
                      style={styles.inputs}
                      onChangeText={(e) => handleContent('startTime',e)}
                      value={content.startTime || ''}
                      multiline={true}
                      textAlignVertical="top"
                      placeholder=""
                    />
                    <Text style= {{height: 30}}>to</Text>
                    <TextInput
                      style={styles.inputs}
                      onChangeText={(e) => handleContent('endTime',e)}
                      value={content.endTime || ''}
                      multiline={true}
                      textAlignVertical="top"
                      placeholder=""
                    />
                  </View>
                </View>
                <View style={styles.msgBar}>
                  <Text style={[styles.subtitle, {textAlign: 'left', marginTop: 10, fontWeight: 'bold'}]}>Add Lunch</Text>
                  <View style ={styles.timeSheet}>
                    <TextInput
                      style={[styles.inputs, {width: '100%'}]}
                      onChangeText={(e) => handleContent('lunch',e)}
                      value={content.lunch || ''}
                      multiline={true}
                      textAlignVertical="top"
                      placeholder=""
                    />
                  </View>
                </View>
                <View style={styles.msgBar}>
                  <Text style={[styles.subtitle, {textAlign: 'left', marginTop: 10, fontWeight: 'bold'}]}>Hours Comments - "optional"</Text>
                  <View style ={styles.timeSheet}>
                    <TextInput
                      style={[styles.inputs, {width: '100%'}]}
                      onChangeText={(e) => handleContent('comments',e)}
                      value={content.comments || ''}
                      multiline={true}
                      textAlignVertical="top"
                      placeholder=""
                    />
                  </View>
                </View>
                <View style={[styles.btn, {marginTop: 20}]}>
                  <HButton style={styles.subBtn} onPress={ handleSubmit }>
                    Submit
                  </HButton>
                </View>
              </View>
            </View>
          </ScrollView>
        </Modal>}
        
        {isUpload && <Modal
          Visible={false}
          transparent= {true}
          animationType="slide"
          onRequestClose={() => {
            setUpload(!isUpload);
          }}
        >
          <StatusBar translucent backgroundColor='transparent' />
          <ScrollView style={styles.modalsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.viewContainer}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Upload TimeSheet</Text>
                <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleUploadModal}>
                  <Image source = {images.close} style={{width: 20, height: 20,}}/>
                </TouchableOpacity>
              </View>
              <View style={styles.body}>
                <View style={styles.modalBody}>
                  <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                    <Text style={[styles.titles, {marginBottom: 5, lineHeight: 20, marginTop: 20, paddingLeft: 2}]}>{detailedInfos[0]?.title}</Text>
                    <Text style={[styles.content, {lineHeight: 20, marginTop: 0}]}>{detailedInfos[0]?.content}</Text>
                  </View>
                  <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                    <Text style={[styles.titles, {marginBottom: 5, lineHeight: 20, marginTop: 20, paddingLeft: 2}]}>{detailedInfos[1]?.title}</Text>
                    <Text style={[styles.content, {lineHeight: 20, marginTop: 0}]}>{detailedInfos[1]?.content}</Text>
                  </View>
                  <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                    <Text style={[styles.titles, {marginBottom: 5, lineHeight: 20, marginTop: 20, paddingLeft: 2}]}>{detailedInfos[2]?.title}</Text>
                    {detailedInfos[2]?.content && 
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(detailedInfos); }}>{detailedInfos[2]?.content}</Text>
                        <Text style={{color: 'blue'}} onPress= {handleDelete}>&nbsp;&nbsp;remove</Text>
                      </View>
                    }
                  </View>
                  <View style={{flexDirection: 'row', width: '100%'}}>
                    <TouchableOpacity title="Select File" onPress={handleShowSelectModal} style={styles.chooseFile}>
                      <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.input, {width: '70%', color: 'black'}]}
                      placeholder=""
                      autoCorrect={false}
                      autoCapitalize="none"
                      value={submitData?.timeSheet?.name || ''}
                    />
                  </View>
                </View>
                <View style={[styles.btn, {marginTop: 20}]}>
                  <HButton style={styles.subBtn} onPress={handleUploadSubmit }>
                    Submit
                  </HButton>
                </View>
              </View>
            </View>
          </ScrollView>
        </Modal>}

        {fileTypeSelectModal && 
          <Modal
            visible={true} // Changed from Visible to visible
            transparent={true}
            animationType="slide"
            onRequestClose={() => {
              setFiletypeSelectModal(false); // Close the modal
            }}
          >
            <StatusBar translucent backgroundColor='transparent' />
            <ScrollView style={styles.modalsContainer} showsVerticalScrollIndicator={false}>
              <View style={[styles.viewContainer, { marginTop: '1%' }]}>
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
        }
        <Loader visible={loading}/>
        <MFooter />
      </View>
  )
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    width: '100%'
  },
  topView: {
    marginTop: 30,
    marginLeft: '10%',
    width: '80%',
    position: 'relative'
  },
  backTitle: {
    backgroundColor: 'black',
    width: '100%',
    height: '55',
    marginTop: 10,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
    color: 'black',
    top: 10
  },
  title: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
    backgroundColor: 'transparent',
    paddingVertical: 10
  },
  bottomBar: {
    marginTop: RFValue(30),
    height: RFValue(5),
    backgroundColor: '#4f70ee1c',
    width: '100%'
  },
  text: {
    fontSize: RFValue(13),
    color: 'black',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: RFValue(30),
    width: '96%',
    marginLeft: '2%'
  },
  imageButton: {
    width: '90%',
    marginLeft: '5%',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  profile: {
    marginTop: 20,
    width: '84%',
    marginLeft: '7%',
    padding: 20,
    backgroundColor: '#c2c3c42e',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#b0b0b0',
    marginBottom: 100
  },
  titles: {
    fontWeight: 'bold',
    fontSize: RFValue(14),
    lineHeight: RFValue(30),
    width: '35%'
  },
  content: {
    fontSize: RFValue(14),
    lineHeight: RFValue(30),
    width: '60%'
  },
  profileTitleBg: {
    backgroundColor: '#BC222F',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    marginLeft: '10%',
    marginBottom: 20
  },
  profileTitle: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: RFValue(16)
  },
  name: {
    fontSize: 14,
    marginVertical: 10,
  },
  edit: {
    backgroundColor: '#22138e',
    padding: RFValue(10),
    borderRadius: RFValue(10),
    fontWeight: 'bold',
    color: 'white',
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: RFValue(10)
  },
  subBar: {
    width: '100%',
    backgroundColor: "#dcd6fa",
    padding: RFValue(10),
    borderRadius: RFValue(20),
    borderWidth: 2,
    borderColor: "#c6c5c5",
    marginBottom: RFValue(10)
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
  dropdown: {
    height: RFValue(40),
    width: '60%',
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: RFValue(8),
    paddingHorizontal: RFValue(8),
    marginBottom: RFValue(10)
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
  placeholderStyle: {
    color: 'black',
    fontSize: 16,
  },
  selectedTextStyle: {
    color: 'black',
    fontSize: RFValue(14),
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
    fontSize: RFValue(16),
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
    backgroundColor: '#dcd6fa',
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
  },
  closeButton: {
    color: 'red',
  },
  body: {
    marginTop: 10,
    paddingHorizontal:20,
  },
  inputs: {
    marginTop: 5,
    marginBottom: 20,
    height: 30,
    width: '40%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    paddingVertical: 5
  },
  btn: {flexDirection: 'column',
    gap: 20,
    marginBottom: 30,
  },
  subBtn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#A020F0',
    color: 'white',
    fontSize: 16,
  },
  timeSheet: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'white', 
    height: 30, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
    paddingVertical: 5
  },
  chooseFile: {
    width: '30%', 
    height: 30, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'black',
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
  