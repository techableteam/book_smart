import React, { useState, useEffect } from 'react';
import { TouchableWithoutFeedback, Alert, Modal, TextInput, View, Image, Animated, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import { Table, Row } from 'react-native-table-component';
import { UpdateUser, Clinician, updateUserInfo, removeAccount } from '../../utils/useApi';
import { Dropdown } from 'react-native-element-dropdown';
import AHeader from '../../components/Aheader';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminAllUser({ navigation }) {
  const [backgroundColor, setBackgroundColor] = useState('#0000ff');
  const [data, setData] = useState([]);
  const [cellData, setCellData] = useState(null);
  const [rowData, setRowData] = useState(null);
  const [useRole, setUserRole] = useState(0)
  const [modalItem, setModalItem] = useState(100);
  const [label, setLabel] = useState(null);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [modal, setModal] = useState(false)  
  const [isJobFocus, setJobIsFocus] = useState(false);
  const [suc, setSuc] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const widths = [120, 250, 150, 150, 80];
  const tableHead = [
    'Name',
    'Email',
    'userRole',
    '✏️ User Status',
    'Delete'
  ];
  const pageItems = [
    {label: '10 per page', value: '1'},
    {label: '25 per page', value: '2'},
    {label: '50 per page', value: '3'},
    {label: '100 per page', value: '4'},
    {label: '500 per page', value: '5'},
    {label: '1000 per page', value: '6'},
  ];
  const userStatus = [
    {label: 'activate', value: 'activate'},
    {label: 'inactivate', value: 'inactivate'},
    {label: 'pending approval', value: 'pending approval'}
  ];
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

  function formatData(data) {
    return data.map(item => {
      const fullName = `${item[1]} ${item[2]}`;
      return [fullName, item[4], item[6], item[5], ""];
    });
  };

  const getData = async () => {
    let clinicalData = await Clinician('clinical/getAllList', 'Admin');
    let adminData = await Clinician('admin/admin', "Admin")
    let facilityData = await Clinician('facilities/facility', 'Admin')
    
    if(!clinicalData) {
      setData(['No Data'])
    } else {
      const modifiedData1 = clinicalData;
      const modifiedData2 = formatData(adminData);
      const modifiedData3 = formatData(facilityData);
      const modifiedArray = [...modifiedData1, ...modifiedData2, ...modifiedData3];
      setData(modifiedArray);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  const toggleModal = () => {
    setModal(!modal);
  };

  const handleCellClick = (data) => {
    console.log(data);
    setCellData(data);
    setStatus(data[3]);
    toggleModal();
  };

  const handleRemove = async (data) => {
    try {
      let response = await removeAccount({ email: data[1], role: data[2] }, "admin");
      if (!response?.error) {
        getData();
      } else {
        Alert.alert(
          'Failure!',
          'Please retry again later',
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
    } catch (e) {
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
  };

  const handleUpdate = async () => {
    // if (password != '') {
    //   if (password != confirmPassword) {
    //     Alert.alert(
    //       'Warning!',
    //       "The Password doesn't matched. Please try again.",
    //       [
    //         {
    //           text: 'OK',
    //           onPress: () => {
    //             setPassword('');
    //             setConfirmPassword('');
    //             console.log('OK pressed')
    //           },
    //         },
    //       ],
    //       { cancelable: false }
    //     );
    //     return;
    //   }
    // }

    try {
      const response = await updateUserInfo({userEmail: cellData[1], userRole: cellData[2], status: status, password: password}, 'admin');

      if (!response?.error) {
        getData();
        toggleModal();
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
    } catch (error) {
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
  };

  const handlePress = async() => {
    let totalData = {};
    let sendingData = {};

    if (modalItem === 2) {
      const name = rowData[0].split(" ");

      if (label === 'Clinician' || label === 'Admin') {
        sendingData = {firstName: name[0], lastName: name[1], email: rowData[1], userRole: label, userStatus: rowData[3]}
      } else {
        sendingData = {firstName: name[0], lastName: name[1], contactEmail: rowData[1], userRole: label, userStatus: rowData[3]}
      }
    } else if (modalItem === 0) {
      if ( useRole === 'Clinician' || useRole === 'Admin') {
        sendingData = {firstName: label.firstName, lastName: label.lastName, email: rowData[1], userRole: rowData[2], userStatus: rowData[3]}
      } else {
        sendingData = {firstName: label.firstName, lastName: label.lastName, contactEmail: rowData[1], userRole: rowData[2], userStatus: rowData[3]}
      }
    } else if (modalItem === 1) {
      const name = rowData[0].split(" ");
      sendingData = {
        firstName: name[0],
        lastName: name[1],
        userRole: rowData[2],
        userStatus: rowData[3],
      };
      
      if (useRole === 'Clinician' || useRole === 'Admin') {
        sendingData.email = rowData[1];
        if (modalItem === 1) {
          sendingData.updateEmail = label;
        }
      } else {
        sendingData.contactEmail = rowData[1];
      }
    } else {
      const name = rowData[0].split(" ");
      if ( useRole === 'Clinician' || useRole === 'Admin') {
        sendingData = {firstName: name[0], lastName: name[1], email: rowData[1], userRole: rowData[2], userStatus: label}
      } else {
        sendingData = {firstName: name[0], lastName: name[1], contactEmail: rowData[1], userRole: rowData[2], userStatus: label}
      }
    }
    totalData = {updateData: sendingData, userRole: useRole}
    let data = await UpdateUser(totalData, 'admin');
    if(data) setSuc(suc+1);
    else setSuc(suc);
    toggleModal();
    getData();
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <AHeader navigation={navigation}  currentPage={5} />
      <SubNavbar navigation={navigation} name={"AdminLogin"}/>
      <ScrollView
        style={{ width: '100%', marginTop: 155 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topView}>
          <Animated.View style={[styles.backTitle, { backgroundColor }]}>
            <Text style={styles.title}>ALL PLATFORM USERS</Text>
          </Animated.View>
          <View style={styles.bottomBar} />
        </View>
        <View style={{ marginTop: 30, flexDirection: 'row', width: '90%', marginLeft: '5%', gap: 10 }}></View>
        <View style={styles.profile}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ backgroundColor: '#000080', color: 'white', paddingHorizontal: 5 }}>TOOL TIPS</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Displays ALL Platform Users</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Deleting a user will remove them from the platform</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>To Deactivate a <Text style={{fontWeight: 'bold'}}>"USER"</Text> change the status to <Text style={{ color: '#ff0000', fontWeight: 'bold' }}>"INACTIVE"</Text></Text>
          </View>
        </View>
        <View>
          <View style={styles.body}>
            <View style={styles.modalBody}>
              <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                <Text style={styles.profileTitle}>🖥️ ALL PLATFORM USERS</Text>
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
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={'100 per page'}
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
                        if (cellIndex == 3) {
                          return (
                            <TouchableWithoutFeedback key={cellIndex} onPress={() => handleCellClick(rowData)}>
                              <View style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2', width: widths[cellIndex]}]}>
                                <Text style={[styles.tableText, {borderWidth: 0}]}>{cellData}</Text>
                              </View>
                            </TouchableWithoutFeedback>
                          );
                        } else if (cellIndex == 4) {
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
                                  Alert.alert('Alert!', 'Are you sure you want to delete this?', [
                                    {
                                      text: 'OK',
                                      onPress: () => {
                                        handleRemove(rowData);
                                      },
                                    },
                                    { text: 'Cancel', style: 'cancel' },
                                  ]);
                                }}
                              >
                                <Text style={styles.profileTitle}>Del</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else {
                          return (
                            <View key={cellIndex} style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2' }, {width: widths[cellIndex]}]}>
                              <Text style={[styles.tableText, cellIndex == 1 ? { borderWidth: 0, color: 'blue' } : { borderWidth: 0 }]}>{cellData}</Text>
                            </View>
                          );
                        }
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
                    <Text style={{ fontSize: 15, marginBottom: 5, marginTop: 20 }}>User Status</Text>
                    <Dropdown
                      style={[styles.dropdown, {width: '100%'}, isFocus && { borderColor: 'blue' }]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      itemTextStyle={styles.itemTextStyle}
                      iconStyle={styles.iconStyle}
                      data={userStatus}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={''}
                      value={status}
                      onFocus={() => setJobIsFocus(true)}
                      onBlur={() => setJobIsFocus(false)}
                      onChange={item => {
                        setStatus(item.value);
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

                    {/* <Text style={{ fontSize: 15, marginBottom: 5, marginTop: 20 }}>Change Password</Text>

                    <TextInput
                      autoCorrect={false}
                      autoCapitalize="none"
                      secureTextEntry={true}
                      style={[styles.input, {width: '100%', color: 'black'}]}
                      placeholder="Please enter new password"
                      onChangeText={e => setPassword(e)}
                      value={password}
                    />
                    <TextInput
                      autoCorrect={false}
                      autoCapitalize="none"
                      secureTextEntry={true}
                      style={[styles.input, {width: '100%', color: 'black'}]}
                      placeholder="Please enter confirm password"
                      onChangeText={e => setConfirmPassword(e)}
                      value={confirmPassword}
                    /> */}
                    
                    <TouchableOpacity style={styles.button} onPress={handleUpdate} underlayColor="#0056b3">
                      <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
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
    // elevation: 1,
    // // shadowColor: 'rgba(0, 0, 0, 0.4)',
    // // shadowOffset: { width: 1, height: 1 },
    // shadowRadius: 0,
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
  row: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 86%)',
    // height: 40,
    position: 'relative',
    backgroundColor: 'white',
    width: '100%',
  },
  evenRow: {
    backgroundColor: '#7be6ff4f', // Set the background color for even rows
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
  },
  closeButton: {
    color: 'red',
  },
  body: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginBottom: 30
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 30,
    elevation: 5,
    width: '80%',
    // height: '43%',
    marginLeft: '20',
    flexDirection: 'flex-start',
    borderWidth: 3,
    borderColor: '#7bf4f4',
  },
  modalBody: {
    // backgroundColor: 'rgba(79, 44, 73, 0.19)',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 30,
    paddingLeft: '5%'
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
    backgroundColor: '#007BFF', // Button color
    padding: 10,    
    marginLeft: '35%',
    marginTop: 30,           // Padding inside the button
    borderRadius: 5,          // Rounded corners
    
  },
  buttonText: {
    color: 'white',            // Text color
    fontSize: 16,              // Text size
  },
  input: {
    backgroundColor: 'white', 
    height: 40, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
  },
});
