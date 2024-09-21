import React, { useState, useEffect, useMemo } from 'react';
import { Alert, Modal, TextInput, View, Image, Animated, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from 'react-native-paper';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import { useFocusEffect } from '@react-navigation/native';
import { Table } from 'react-native-table-component';
import RadioGroup from 'react-native-radio-buttons-group';
import { Update, Clinician, updatePassword, getUserProfile, getUserInfo } from '../../utils/useApi';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import { Dropdown } from 'react-native-element-dropdown';
import AHeader from '../../components/Aheader';
// Choose file
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs'

export default function AllCaregivers({ navigation }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [appliedList, setAppliedList] = useState([]);
  const [awardedList, setAwardedList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tmpPassword, setTmpPassword] = useState('');
  const [userProfileModal, setUserProfileModal] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [resetPWModal, setResetPWModal] = useState(false);
  const [data, setData] = useState([]);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false); 
  const [modal, setModal] = useState(false)
  const [cellData, setCellData] = useState(null);
  const [rowData, setRowData] = useState(null);
  const [modalItem, setModalItem] = useState(0);
  const [label, setLabel] = useState(null);
  const [jobValue, setJobValue] = useState(null);
  const [isJobFocus, setJobIsFocus] = useState(false);
  const [suc, setSuc] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#0000ff');
  const [clinicians, setClinicians] = useState([]);
  const [sfileType, setFiletype] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);
  const widths = [120, 150, 150, 180, 300, 150, 150, 150, 80, 100, 80, 120];
  let colorIndex = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      if (colorIndex >= 0.9) {
        colorIndex = 0;
      } else {
        colorIndex += 0.1;
      }
      const randomColor = colorIndex == 0 ? `#00000${Math.floor(colorIndex * 256).toString(16)}` : `#0000${Math.floor(colorIndex * 256).toString(16)}`;
      setBackgroundColor(randomColor);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const radioButtons = useMemo(() => ([
    {
      id: 1,
      label: 'Yes',
      value: true
    },
    {
      id: 2,
      label: 'No',
      value: false
    }
  ]), []);

  const tableHead = [
    'Entry Date',
    'Name',
    'Phone',
    'Degree/Discipline',
    'Email',
    'View Shifts / Profile',
    'Verification',
    '✏️ User Status',
    'Awarded',
    'Applied for',
    'Ratio',
    'P.W.'
  ];
  const pageItems = [
    {label: '10 per page', value: '1'},
    {label: '25 per page', value: '2'},
    {label: '50 per page', value: '3'},
    {label: '100 per page', value: '4'},
    {label: '500 per page', value: '5'},
    {label: '1000 per page', value: '6'},
  ];
  const location = [
    {label: 'Select...', value: 'Select...'},
    {label: 'activate', value: 'activate'},
    {label: 'inactivate', value: 'inactivate'},
    {label: 'pending', value: 'pending'},
  ];

  function formatData(data) {
    return data.map(item => {
        const date = new Date(item[0]);
        const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
        const fullName = `${item[1]} ${item[2]}`;
        return [formattedDate, fullName, item[3], item[4], item[5], item[6], item[7], item[8], item[9], item[10], item[11], item[12], item[13]];
    });
  }

  const formatDate = (origin) => {
    const date = new Date(origin);
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    return formattedDate;
  };

  const getData = async () => {
    let data = await Clinician('clinical/clinician', 'Admin');
    if(!data) {
      setData(['No Data'])
    } else {
      const modifiedData = formatData(data);
      setData(modifiedData)
    }
    const uniqueValues = new Set();
    const transformed = [];

    data.forEach(subarray => {
      const value = subarray[1];
      if (!uniqueValues.has(value)) {
        uniqueValues.add(value); 
        transformed.push({ label: value, value: value });
      }
    });
    setClinicians(transformed);
  };

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  const handleResetPW = async () => {
    if (password != confirmPassword) {
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
      return;
    }

    let response = await updatePassword({ userId: selectedUserId, password, tmpPassword }, 'admin');
    getData();
    toggleRestPWModal();
  };

  const toggleRestPWModal = () => {
    setResetPWModal(!resetPWModal);
  };

  const toggleUserProfileModal = () => {
    setUserProfileModal(!userProfileModal);
  };

  const toggleVerificationModal = () => {
    setVerificationModal(!verificationModal);
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  const handleShowUserInfoModal = async () => {
    let response = await getUserInfo({ userId: selectedUserId }, 'clinical');

    if (!response?.error) {
      setSelectedUser(response.userData);
      toggleVerificationModal();
    } else {
      setSelectedUser(null);
    }
  };

  const handleShowProfileModal = async () => {
    let response = await getUserProfile({ userId: selectedUserId }, 'clinical');

    if (!response?.error) {
      let appliedData = response.appliedList;
      appliedData.unshift(appliedTableHeader);

      let awardedData = response.awardedList;
      awardedData.unshift(awardedTableHeader);

      setSelectedUser(response.userData);
      setAppliedList(appliedData);
      setAwardedList(awardedData);

      toggleUserProfileModal();
    } else {
      setSelectedUser(null);
      setAppliedList([]);
      setAwardedList([]);
    }
  };

  const appliedTableHeaderWidth = [150, 150, 140, 400];
  const appliedTableHeader = ['Bid-ID', 'Entry Date', 'Job', 'Message From Applicant'];
  const RenderItem = ({ item, index }) => (
    <View
      key={index}
      style={{
        backgroundColor: index == 0 ? '#ccffff' : '#fff',
        flexDirection: 'row',
      }}
    >
      {appliedTableHeaderWidth.map((width, idx) => {
        return (
          <Text
            key={idx}
            style={[styles.tableText, { width, textAlign: 'center' }]}
          >
            {item[idx]}
          </Text>
        );
      })}
    </View>
  );

  const awardedTableHeaderWidth = [150, 150, 140, 150];
  const awardedTableHeader = ['Job-ID', 'Entry Date', 'Facility', 'Job Status'];
  const RenderItem1 = ({ item, index }) => (
    <View
      key={index}
      style={{
        backgroundColor: index == 0 ? '#ccffff' : '#fff',
        flexDirection: 'row',
      }}
    >
      {awardedTableHeaderWidth.map((width, idx) => {
        return (
          <Text
            key={idx}
            style={[styles.tableText, { width, textAlign: 'center' }]}
          >
            {item[idx]}
          </Text>
        );
      })}
    </View>
  );
  
  const AppliedListTable = () => (
    <View style={{ borderColor: '#AAAAAA', borderWidth: 1, marginBottom: 3 }}>
      {appliedList.map((item, index) => (
        <RenderItem key={index} item={item} index={index} />
      ))}
    </View>
  );

  const AwardedListTable = () => (
    <View style={{ borderColor: '#AAAAAA', borderWidth: 1, marginBottom: 3 }}>
      {awardedList.map((item, index) => (
        <RenderItem1 key={index} item={item} index={index} />
      ))}
    </View>
  );

  const handleCellClick = (cellData, rowIndex, cellIndex) => {
    setCellData(cellData);
    const rowD = data[rowIndex][3];
    setModalItem(cellIndex);
    if(cellIndex==1) {
      const name = cellData.split(' ');
      setLabel({firstName: name[0], lastName: name[1]});
    } else {
      setLabel(cellData.toString());
    }
    setRowData(rowD);
    if (cellIndex !== 0 ) {
      toggleModal();
    }
  };

  const formatPhoneNumber = (input) => {
    const cleaned = input.replace(/\D/g, '');

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

  const handlePress = async() => {
    let sendData = label;
    let sendingData = {}
    if (modalItem === 1) {
      const emailData = {email: rowData}
      sendingData = {
        ...emailData, // Ensure rowData is defined and contains the appropriate value
        ...sendData // Use sendData for jobNum
      };
    } else if (modalItem === 2) {
      sendingData = {
        email: rowData,
        phoneNumber: sendData // Use sendData for location
      };
    } else if (modalItem === 3)  {
      // Handle other modalItems as needed
      sendingData = {
        email: rowData,
        updateEmail: sendData // Use sendData for location
      };
    } else if (modalItem === 4)  {
      // Handle other modalItems as needed
      sendingData = {
        email: rowData,
        userStatus: sendData // Use sendData for location
      };
    }
    let Data = await Update(sendingData, 'clinical');
    if(Data) setSuc(suc+1);
    else setSuc(suc);
    toggleModal();
    getData();
  };

  const handleRemove = (name) => {
    handleCredentials(name, {
      content: '',
      name: '',
      type: ''
    });
  };

  // File Manager
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
  
    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.error('Camera error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
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
      handleCredentials(sfileType, {content: `${fileContent}`, type: fileType, name: res[0].name});
      toggleFileTypeSelectModal();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Handle other errors
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent backgroundColor="transparent"
      />
      <AHeader navigation={navigation}  currentPage={4} />
      <SubNavbar navigation={navigation} name={"AdminLogin"}/>
      <ScrollView style={{ width: '100%', marginTop: 155 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topView}>
          <Animated.View style={[styles.backTitle, { backgroundColor }]}>
            <Text style={styles.title}>COMPANY JOBS / SHIFTS</Text>
          </Animated.View>
          <View style={styles.bottomBar} />
        </View>
        <View style={{ marginTop: 30, flexDirection: 'row', width: '90%', marginLeft: '5%', gap: 10 }}>
        </View>
        <View style={styles.profile}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ backgroundColor: '#000080', color: 'white', paddingHorizontal: 5 }}>TOOL TIPS</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>When A New <Text style={{fontWeight: 'bold'}}>"CAREGIVER"</Text> signs-up, they will have a status of <Text style={{ color: '#0000ff', fontWeight: 'bold' }}>"PENDING APPROVAL"</Text></Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Once you have verified the <Text style={{fontWeight: 'bold'}}>CAREGIVER</Text> information, update the status to <Text style={{ color: '#008000', fontWeight: 'bold' }}>"ACTIVE"</Text>.</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>The CAREGIVER will receive an Approval email, and can then login to view Jobs / Shifts</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>To Deactivate a <Text style={{fontWeight: 'bold'}}>"CAREGIVER"</Text> change the status to <Text style={{ color: '#ff0000', fontWeight: 'bold' }}>"INACTIVE"</Text></Text>
          </View>
        </View>
        <View>
          <View style={styles.body}>
            <View style={styles.modalBody}>
              <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                <Text style={styles.profileTitle}>ALL CAREGIVERS</Text>
              </View>
              <View style={styles.searchBar}>
                {/* <TextInput style={styles.searchText} /> */}
                {/* <TouchableOpacity style={styles.searchBtn}>
                  <Text>Add filters</Text>
                </TouchableOpacity> */}
              </View>
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
              <ScrollView horizontal={true} style={{ width: '95%', borderWidth: 1, marginBottom: 30, borderColor: 'rgba(0, 0, 0, 0.08)' }}>
                <Table >
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ccffff' }}>
                    {tableHead.map((item, index) => (
                      <Text
                        key={index}
                        style={[styles.tableText, { width: widths[index], textAlign: 'center' }]}
                      >
                        {item}
                      </Text>
                    ))}
                  </View>
                  {data.map((rowData, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: 'row' }}>
                      {rowData.map((cellData, cellIndex) => {
                        if (cellData === 'view_shift') {
                          return (
                            <View key={cellIndex} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', backgroundColor: '#E2E2E2', width: widths[cellIndex] }}>
                              <TouchableOpacity
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  paddingHorizontal: 20,
                                  paddingVertical: 5,
                                  backgroundColor: 'green',
                                  borderRadius: 20,
                                }}
                                onPress={() => {
                                  console.log('user => ', rowData[12]);
                                  setSelectedUserId(rowData[12]);
                                  handleShowProfileModal();
                                }}
                              >
                                <Text style={styles.profileTitle}>View Here</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else if (cellData === 'verification') {
                          return (
                            <View key={cellIndex} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', backgroundColor: '#E2E2E2', width: widths[cellIndex] }}>
                              <TouchableOpacity
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  paddingHorizontal: 20,
                                  paddingVertical: 5,
                                  backgroundColor: 'green',
                                  borderRadius: 20,
                                }}
                                onPress={() => {
                                  console.log('user =>', rowData[12]);
                                  setSelectedUserId(rowData[12]);
                                  handleShowUserInfoModal();
                                }}
                              >
                                <Text style={styles.profileTitle}>View here</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else if (cellData === 'pw') {
                          return (
                            <View key={cellIndex} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', backgroundColor: '#E2E2E2', width: widths[cellIndex] }}>
                              <TouchableOpacity
                                style={{
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  paddingHorizontal: 20,
                                  paddingVertical: 5,
                                  backgroundColor: 'green',
                                  borderRadius: 20,
                                }}
                                onPress={() => {
                                  console.log('user > ', rowData[12]);
                                  setSelectedUserId(rowData[12]);
                                  toggleRestPWModal();
                                }}
                              >
                                <Text style={styles.profileTitle}>Reset</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else if (cellIndex >= tableHead.length) {
                          return (<View key={cellIndex}></View>);
                        } else {
                          if (cellIndex == 2 || cellIndex == 4) {
                            return (
                              <View key={cellIndex} style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2' }, {width: widths[cellIndex]}]}>
                                <Text style={[styles.tableText, {borderWidth: 0, color: 'blue' }]}>{cellData}</Text>
                              </View>
                            );
                          } else {
                            return (
                              <View key={cellIndex} style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2' }, {width: widths[cellIndex]}]}>
                                <Text style={[styles.tableText, {borderWidth: 0}]}>{cellData}</Text>
                              </View>
                            );
                          }
                        }
                        // <TouchableWithoutFeedback key={cellIndex} onPress={() => handleCellClick(cellData, rowIndex, cellIndex)}>
                        //   <View key={cellIndex} style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2' }, {width: widths[cellIndex]}]}>
                        //     <Text style={[styles.tableText, {borderWidth: 0}]}>{cellData}</Text>
                        //   </View>
                        // </TouchableWithoutFeedback> 
                      })}
                    </View>
                  ))}
                </Table>
              </ScrollView>
            </View>
          </View>
          
          <Modal
            visible={modal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setModal(!modal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>{tableHead[modalItem]}</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <View style={styles.modalBody}>
                    {
                      (modalItem === 4) ?
                        <Dropdown
                          style={[styles.dropdown, {width: '100%'}, isFocus && { borderColor: 'blue' }]}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          inputSearchStyle={styles.inputSearchStyle}
                          itemTextStyle={styles.itemTextStyle}
                          iconStyle={styles.iconStyle}
                          data={location}
                          // search
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder={cellData}
                          // searchPlaceholder="Search..."
                          value={jobValue}
                          onFocus={() => setJobIsFocus(true)}
                          onBlur={() => setJobIsFocus(false)}
                          onChange={item => {
                            setJobValue(item.value);
                            setLabel(item.label);
                            setJobIsFocus(false);
                          }}
                          renderLeftIcon={() => (
                            <View
                              style={styles.icon}
                              color={isJobFocus ? 'blue' : 'black'}
                              name="Safety"
                              size={20}
                            />
                          )}
                        />
                      :
                      (modalItem === 2) || (modalItem === 3) ?
                        (<TextInput
                          style={[styles.searchText, {width: '100%', paddingTop: 0, height: 30, textAlignVertical: 'center'}]}
                          placeholder=""
                          onChangeText={e => {
                            const formattedNumber = formatPhoneNumber(e);
                            if (modalItem === 2) {setLabel(formattedNumber)}
                            else {setLabel(e)}
                          }}
                          value={label || ''}
                          keyboardType={modalItem && "phone-pad"}
                        />)
                      :
                      (modalItem === 1) ?
                        (<View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 20}}>
                          <TextInput
                            style={[styles.searchText, {width: '40%', paddingTop: 0, height: 30, textAlignVertical: 'center'}]}
                            placeholder=""
                            onChangeText={e => setLabel({...label, firstName: e})}
                            value={label.firstName || ''}
                          />
                          <TextInput
                            style={[styles.searchText, {width: '40%', paddingTop: 0, height: 30, textAlignVertical: 'center'}]}
                            placeholder=""
                            onChangeText={e => setLabel({...label, lastName: e})}
                            value={label.lastName || ''}
                          />
                        </View>
                        )
                      :
                      <></>
                    }
                    <TouchableOpacity style={styles.button} onPress={handlePress} underlayColor="#0056b3">
                      <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={resetPWModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setResetPWModal(!resetPWModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Reset Password</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleRestPWModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <View style={styles.modalBody}>
                    <Text style={styles.subtitle}> Password <Text style={{color: 'red'}}>*</Text></Text>
                    <TextInput
                      autoCorrect={false}
                      autoCapitalize="none"
                      secureTextEntry={true}
                      style={[styles.input, {width: '100%', color: 'black'}]}
                      placeholder="Password"
                      onChangeText={e => setPassword(e)}
                      value={password}
                    />
                    <TextInput
                      autoCorrect={false}
                      autoCapitalize="none"
                      secureTextEntry={true}
                      style={[styles.input, {width: '100%', color: 'black'}]}
                      placeholder="Confirm Password"
                      onChangeText={e => setConfirmPassword(e)}
                      value={confirmPassword}
                    />
                    <Text style={styles.subtitle}> Temp Password </Text>
                    <TextInput
                      autoCorrect={false}
                      autoCapitalize="none"
                      style={[styles.input, {width: '100%', color: 'black'}]}
                      placeholder=""
                      onChangeText={e => setTmpPassword(e)}
                      value={tmpPassword}
                    />
                    <Text>Enter Password again to send in email notification</Text>
                    <TouchableOpacity style={styles.button} onPress={handleResetPW}>
                      <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={userProfileModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setUserProfileModal(!userProfileModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.calendarContainer, { height: '80%' }]}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Facility View Job Details</Text>
                  <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleUserProfileModal}>
                    <Image source = {images.close} style={{width: 20, height: 20}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <ScrollView>
                    <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: 12 }]}>🖥️ CAREGIVER PROFILE</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Image
                          resizeMode="cover"
                          style={styles.nurse}
                          source={selectedUser?.photoImage?.name != "" ? 'data:image/jpeg;base64,' + selectedUser?.photoImage?.content : images.profile}
                        />
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Entry Date</Text>
                        <Text style={styles.content}>{formatDate(selectedUser?.entryDate)}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#F7F70059', marginBottom: 5, paddingLeft: 2}]}>Name</Text>
                        <Text style={styles.content}>{selectedUser?.firstName} {selectedUser?.lastName}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Email</Text>
                        <Text style={[styles.content, { color: 'blue' }]}>{selectedUser?.email}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Phone</Text>
                        <Text style={styles.content}>{selectedUser?.phoneNumber}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Degree/Discipline</Text>
                        <Text style={styles.content}>{selectedUser?.title}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Total Bids / Offers</Text>
                        <Text style={styles.content}>{selectedUser?.appliedCnt}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Total Awarded</Text>
                        <Text style={styles.content}>{selectedUser?.awardedCnt}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Bid to Award Ratio</Text>
                        <Text style={styles.content}>{selectedUser?.ratio}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Nurse Aver. Job Rating</Text>
                        <Text style={styles.content}>
                          <StarRatingDisplay
                            rating={selectedUser?.avgJobRating}
                            maxStars={5}
                            starSize={25}
                          />
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Bnak Name</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Routing Number</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Account Number</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Bank Account Type</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: 12 }]}>🖥️ SHIFTS APPLIED FOR</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', paddingRight: '5%'}}>
                        <ScrollView horizontal={true} style={{width: '100%'}}>
                          <AppliedListTable />
                        </ScrollView>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: 12 }]}>🖥️ SHIFTS AWARDED</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', paddingRight: '5%'}}>
                        <ScrollView horizontal={true} style={{width: '100%'}}>
                          <AwardedListTable />
                        </ScrollView>
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={verificationModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setVerificationModal(!verificationModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.calendarContainer, { height: '80%' }]}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Caregiver Verification</Text>
                  <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleVerificationModal}>
                    <Image source = {images.close} style={{width: 20, height: 20}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <ScrollView>
                    <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: 12 }]}>🖥️ CAREGIVER PROFILE</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Name</Text>
                        <Text style={styles.content}>{selectedUser?.firstName} {selectedUser?.lastName}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>SS #</Text>
                        <Text style={styles.content}>{selectedUser?.socialSecurityNumber}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Degree/Disicipline</Text>
                        <Text style={styles.content}>{selectedUser?.title}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Phone</Text>
                        <Text style={[styles.content, { color: 'blue' }]}>{selectedUser?.phoneNumber}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Email</Text>
                        <Text style={[styles.content, { color: 'blue' }]}>{selectedUser?.email}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Caregiver Address</Text>
                        <Text style={styles.content}>{selectedUser?.address.streetAddress + " " + selectedUser?.address.streetAddress2 + " " + selectedUser?.address.city + " " + selectedUser?.address.state + " " + selectedUser?.address.zip}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>User Status</Text>
                        <Text style={styles.content}>{selectedUser?.userStatus}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Signature</Text>
                        {selectedUser?.signature != "" && <Image
                          resizeMode="cover"
                          style={{ width: '90%', height: 'auto' }}
                          source={'data:image/jpeg;base64,' + selectedUser?.signature}
                        />}
                      </View>

                      <View style={[styles.line, { backgroundColor: '#8d8dff' }]}></View>

                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: 12 }]}>🖥️ CAREGIVER DOCUMENTS</Text>
                        </View>
                      </View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>


                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {marginBottom: 5, backgroundColor: '#F7F70059'}]}>Driver's License</Text>
                        {selectedUser?.driverLicense?.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(selectedUser?.driverLicense); }}>{selectedUser?.driverLicense?.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: 14}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={selectedUser?.driverLicense?.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={() => console.log('clicked')}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>
                      
                      <View style={[styles.line, { backgroundColor: '#8d8dff' }]}></View>

                      
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>
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
                <View style={[styles.body, { marginBottom: 0 }]}>
                  <View style={[styles.modalBody, { paddingHorizontal: 20, borderRadius: 15, borderWidth: 2, borderColor: '#c6c5c5', backgroundColor: '#e3f2f1', paddingVertical: 20 }]}>
                    <View style={styles.cameraContain}>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={() => {openCamera();}}>
                        <Icon name="camera" size={50} color="#ccc" />
                        <Text style={styles.textStyle}>Camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={() => {pickFile();}}>
                        <Icon name="image" size={50} color="#ccc" />
                        <Text style={styles.textStyle}>Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </Modal>
        )}
        </View>
      </ScrollView>
      <MFooter />
    </View>
  )
}

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
  line: {
    width: '100%',
    height: 5,
    marginVertical: 15
},
  nurse: {
    width: 200,
    height: 200,
    margin: 10
  },
  backTitle: {
    backgroundColor: 'black',
    width: '100%',
    height: 55,
    marginTop: 10,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
    color: 'black',
    top: 10
  },
  content: {
    fontSize: 16,
    lineHeight: 30,
    width: '60%'
  },
  titles: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 30,
    width: '35%'
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
    marginTop: 30,
    height: 5,
    backgroundColor: '#4f70ee1c',
    width: '100%'
  },
  text: {
    fontSize: 14,
    color: 'black',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 30,
    width: '90%',
    marginLeft: '5%'
  },
  imageButton: {
    width: '100%',
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
  },
  name: {
    fontSize: 14,
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#22138e',
    fontWeight: 'bold',
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
  row: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 86%)',
    position: 'relative',
    backgroundColor: 'white',
    width: '100%',
  },
  evenRow: {
    backgroundColor: '#7be6ff4f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    height: 80,
    padding: 20,
    borderBottomColor: '#c4c4c4',
    borderBottomWidth: 1,
  },
  subtitle: {
    backgroundColor: '#F7F70059',
    marginBottom: 5
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: 'red',
  },
  body: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginBottom: 100
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: '#e3f2f1',
    borderRadius: 30,
    elevation: 5,
    width: '90%',
    flexDirection: 'column',
    borderWidth: 3,
    borderColor: '#7bf4f4',
  },
  modalBody: {
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '60%',
    borderRadius: 10,
    marginBottom: 10
  },
  searchText: {
    width: '70%',
    backgroundColor: 'white',
    paddingBottom: 0,
  },
  searchBtn: {
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: '#2a53c1',
    height: 30
  },
  filter: {
    width: '90%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 5,
  },
  filterBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    gap: 5
  },
  filterText: {
    color: '#2a53c1',
  },
  subBtn: {
    backgroundColor: '#194f69',
    borderColor: '#ffaa22',
    borderWidth: 2,
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    gap: 10,
    flexDirection: 'row'
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
  cameraContain: {
		flex: 1,
    width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
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
  head: {
    backgroundColor: '#7be6ff4f',
    // width: 2000,
    height: 40,
  },
  tableText: {
    paddingHorizontal: 10,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    borderWidth: 1, 
    borderColor: 'rgba(0, 0, 0, 0.08)',
    height: 40,
    textAlignVertical: 'center'
  },
  dropdown: {
    height: 30,
    width: '50%',
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10
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
    fontSize: 16,
  },
  itemTextStyle: {
    color: 'black'
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginTop: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  input: {
    backgroundColor: 'white', 
    height: 40, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
  },
});
