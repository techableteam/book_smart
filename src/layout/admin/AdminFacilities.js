import React, { useState, useEffect } from 'react';
import { TouchableWithoutFeedback, Modal, TextInput, View, Image, Dimensions, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { Table } from 'react-native-table-component';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import AHeader from '../../components/Aheader';
import { getAllFacility, getFacilityInfo, updatePassword, updateUserInfo } from '../../utils/useApi';
import AnimatedHeader from '../AnimatedHeader';
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function AdminFacilities({ navigation }) {
  const [data, setData] = useState([]);
  const [cellData, setCellData] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [status, setStatus] = useState('');
  const [isStatusFocus, setStatusIsFocus] = useState(false);
  const [resetPWModal, setResetPWModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tmpPassword, setTmpPassword] = useState('');
  const [facility, setFacility] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [userProfileModal, setUserProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [curPage, setCurPage] = useState(1);
  const [isLogicFocus, setIsLogicFocus] = useState(false);
  const [isFieldFocus, setIsFieldFocus] = useState(false);
  const [isConditionFocus, setIsConditionFocus] = useState(false);
  const [isValueOptionFocus, setIsValueOptionFocus] = useState(false);
  const [addfilterModal, setAddFilterModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [valueOption, setValueOption] = useState([]);
  const [pageList, setPageList] = useState([
    {label: 'Page 1', value: 1}
  ]);
  const widths = [100, 150, 250, 200, 150, 150, 150, 100];
  const tableHead = [
    'ID',
    'Date Added',
    'Company Name',
    'Contact Name',
    '✏️ User Status',
    'User Roles',
    'View Shifts',
    'P.W.'
  ];
  const statusList = [
    {label: 'activate', value: 'activate'},
    {label: 'inactivate', value: 'inactivate'},
    {label: 'pending approval', value: 'pending approval'},
  ];
  const rolesList = [
    {label: 'Clinician', value: 'Clinician'},
    {label: 'Administrator', value: 'Administrator'},
    {label: 'Facility', value: 'Facility'},
  ];
  const logicItems = [
    {label: 'and', value: 'and'},
    {label: 'or', value: 'or'}
  ];
  const fieldsItems = [
    { label: 'AIC-ID', value: 'AIC-ID'},
    { label: 'Date Added', value: 'Date Added'},
    { label: 'Company Name', value: 'Company Name'},
    { label: 'Contact Name', value: 'Contact Name'},
    { label: 'User Status', value: 'User Status'},
    { label: 'User Roles', value: 'User Roles'},
  ];
  const fieldConditions = {
    'AIC-ID': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'higher than', value: 'higher than' },
      { label: 'lower than', value: 'lower than' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Date Added': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'is during the current', value: 'is during the current' },
      { label: 'is during the previous', value: 'is during the previous' },
      { label: 'is during the next', value: 'is during the next' },
      { label: 'is before the previous', value: 'is before the previous' },
      { label: 'is after the next', value: 'is after the next' },
      { label: 'is before', value: 'is before' },
      { label: 'is after', value: 'is after' },
      { label: 'is today', value: 'is today' },
      { label: 'is today or before', value: 'is today or before' },
      { label: 'is today or after', value: 'is today or after' },
      { label: 'is before today', value: 'is before today' },
      { label: 'is after today', value: 'is after today' },
      { label: 'is before current time', value: 'is before current time' },
      { label: 'is after current time', value: 'is after current time' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Company Name': [
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'starts with', value: 'starts with' },
      { label: 'ends with', value: 'ends with' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Contact Name': [
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'starts with', value: 'starts with' },
      { label: 'ends with', value: 'ends with' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'User Status': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'User Roles': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
  };
  const [conditionItems, setConditionItems] = useState(fieldConditions['AIC-ID']);
  const [filters, setFilters] = useState([
    { logic: '', field: 'AIC-ID', condition: 'is', value: '', valueType: 'text' },
  ]);

  const removeFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleRemoveFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    getData({ search: search, page: curPage, filters: newFilters }, true);
    setFilters(newFilters);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    toggleAddFilterModal();
    const requestData = { search: search, page: curPage, filters: filters };
    getData(requestData, true);
  };


  const addFilter = () => {
    setFilters([...filters, { logic: 'and', field: 'AIC-ID', condition: 'is', value: '', valueType: 'text' }]);
  };

  const handleFilterChange = (index, key, value) => {
    const newFilters = [...filters];

    if (key === 'logic') {
      const updatedFilters = newFilters.map((filter) => ({
        ...filter,
        logic: value,
      }));
      setFilters(updatedFilters);
      return;
    } else if (key === 'field') {
      setConditionItems(fieldConditions[value]);

      if (value === 'User Status' || value === 'User Roles') {
        newFilters[index]['valueType'] = 'select';
        if (value === 'User Status') {
          setValueOption(statusList);
        } else if (value === 'User Roles') {
          setValueOption(rolesList);
        }
        newFilters[index]['condition'] = 'is';
      } else {
        newFilters[index]['valueType'] = 'text';
      }
      newFilters[index][key] = value;
    } else if (key == 'condition') {
      if (value == 'is any' || value == 'is blank' || value == 'is not blank') {
        newFilters[index]['valueType'] = '';
      } else {
        if (newFilters[index]['field'] === 'User Status' || newFilters[index]['field'] === 'User Roles') {
          newFilters[index]['valueType'] = 'select';
        } else {
          newFilters[index]['valueType'] = 'text';
        }
      }
    } else {
      newFilters[index][key] = value;
    }
    setFilters(newFilters);
  };

  const getData = async (requestData = { search: search, page: curPage, filters: filters }, isFilter = isSubmitted ) => {
    if (!isFilter) {
      requestData.filters = [];
    }
    setLoading(true);
    let data = await getAllFacility(requestData, 'facilities');
    if(!data) {
      setData(['No Data'])
    } else {
      let pageContent = [];
      for (let i = 1; i <= data.totalPageCnt; i++) {
        pageContent.push({ label: 'Page ' + i, value: i });
      }
      setPageList(pageContent);
      setData(data.dataArray);
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  useEffect(() => {
    getData();
  }, [curPage]);

  const handleReset = (event) => {
    event.persist();
    setSearch(''); 
    getData({ search: '', page: curPage, filters: filters});
  };
  
  const handleSearch = (event) => {
    event.persist();
    getData();
  };

  const toggleAddFilterModal = () => {
    setAddFilterModal(!addfilterModal)
  };

  const renderInputField = (filter, index) => {
    const { valueType, value } = filter;

    if (valueType === 'text') {
      return (
        <TextInput
          style={[styles.input, { color: 'black', paddingVertical: 5 }]}
          placeholder=""
          value={value}
          onChangeText={(text) => handleFilterChange(index, 'value', text)}
        />
      );
    }

    if (valueType === 'select') {
      return (
        <Dropdown
          style={[styles.dropdown, {width: '100%'}, isValueOptionFocus && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          iconStyle={styles.iconStyle}
          data={valueOption}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={''}
          value={filter.value}
          onFocus={() => setIsValueOptionFocus(true)}
          onBlur={() => setIsValueOptionFocus(false)}
          onChange={item => {
            handleFilterChange(index, 'value', item.value);
            setIsValueOptionFocus(false);
          }}
          renderLeftIcon={() => (
            <View
              style={styles.icon}
              color={isValueOptionFocus ? 'blue' : 'black'}
              name="Safety"
              size={20}
            />
          )}
        />
      );
    }
    return (<></>);
  };

  const toggleStatusModal = () => {
    setStatusModal(!statusModal);
  };

  const handleCellClick = (data) => {
    setCellData(data);
    setStatus(data[4]);
    toggleStatusModal();
  };

  const handleUpdate = async () => {
    try {
      const response = await updateUserInfo({userEmail: cellData[8], userRole: cellData[5], status: status, password: ''}, 'admin');
      if (!response?.error) {
        getData();
        toggleStatusModal();
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

  const toggleRestPWModal = () => {
    setResetPWModal(!resetPWModal);
  };

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

    let response = await updatePassword({ userId: cellData[0], userRole: 'Facilities', password, tmpPassword }, 'admin');
    getData();
    toggleRestPWModal();
  };

  const formatDate = (origin) => {
    const date = new Date(origin);
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    return formattedDate;
  };

  const toggleUserProfileModal = () => {
    setUserProfileModal(!userProfileModal);
  };

  const handleShowFacilityInfoModal = async (data) => {
    setLoading(true);
    let response = await getFacilityInfo({ userId: data[0] }, 'facilities');
    if (!response.error) {
      let shiftsData = response.jobData;
      shiftsData.unshift(shiftsTableHeader);
      console.log(response.userData);
      console.log(response.jobData);
      setFacility(response.userData);
      setShifts(shiftsData);
      toggleUserProfileModal();
      setLoading(false);
    } else {
      setLoading(false);
      Alert.alert(
        'Warning!',
        "Can't get facility, Please try again later",
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
    }
  };

  const shiftsTableHeaderWidth = [100, 150, 100, 150, 200];
  const shiftsTableHeader = ['Job-ID', 'Entry Date', 'Job #', 'Job Status', 'Shift Dates & Times'];
  const RenderItem = ({ item, index }) => (
    <View
      key={index}
      style={{
        backgroundColor: index == 0 ? '#ccffff' : '#fff',
        flexDirection: 'row',
      }}
    >
      {shiftsTableHeaderWidth.map((width, idx) => {
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

  const ShiftListTable = () => (
    <View style={{ borderColor: '#AAAAAA', borderWidth: 1, marginBottom: 3 }}>
      {shifts.map((item, index) => (
        <RenderItem key={index} item={item} index={index} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent"/>
      <AHeader navigation={navigation}  currentPage={6} />
      <SubNavbar navigation={navigation} name={"AdminLogin"}/>
      <ScrollView style={{ width: '100%', marginTop: height * 0.25 }} showsVerticalScrollIndicator={false}>
        <View style={styles.topView}>
          <AnimatedHeader title="ALL PLATFORM FACILITIES" />
          <View style={styles.bottomBar} />
        </View>
        <View style={{ marginTop: 30, flexDirection: 'row', width: '90%', marginLeft: '5%', gap: 10 }}>
          <TouchableOpacity style={[styles.subBtn, { width: 'auto' }]} onPress={() => navigation.navigate('AddNewFacility')}>
            <View style={{ backgroundColor: 'white', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              <Text style={{ fontWeight: 'bold', color: '#194f69', textAlign: 'center', lineHeight: 15 }}>+</Text>
            </View>
            <Text style={styles.profileTitle}>Add A New Facility</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profile}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ backgroundColor: '#000080', color: 'white', paddingHorizontal: 5 }}>TOOL TIPS</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Displays all Facilities within the platform.</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Click <Text style={{fontWeight: 'bold'}}>"VIEW SHIFT"</Text> - to view all shifts associated with the facility.</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Change status to <Text style={{ color: '#ff0000', fontWeight: 'bold' }}>"INACTIVE"</Text> to deactivate facility.</Text>
          </View>
        </View>
        <View>
          <View style={styles.body}>
            <View style={styles.modalBody}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30, width: '95%' }]}>
                  <Text style={styles.profileTitle}>🖥️ ALL PLATFORM FACILITIES</Text>
                </View>
              </View>
              <View style={styles.searchBar}>
                <TextInput
                  style={styles.searchText}
                  placeholder=""
                  onChangeText={e => setSearch(e)}
                  value={search}
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                  <Text>Search</Text>
                </TouchableOpacity>
                {search && <TouchableOpacity style={styles.searchBtn} onPress={handleReset}>
                  <Text>Reset</Text>
                </TouchableOpacity>}
              </View>
              {/* <View>
                <TouchableOpacity style={[styles.filterBtn, { marginLeft: 0, marginBottom: 5 }]} onPress={toggleAddFilterModal}>
                  <Text>Add Filter</Text>
                </TouchableOpacity>
              </View> */}
              {/* {isSubmitted && <View style={{ flexDirection: 'row', marginBottom: 5, flexWrap: 'wrap' }}>
                {filters.map((item, index) => (
                  <View key={index} style={styles.filterItem}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={styles.filterItemTxt}> {item.field}</Text>
                      <Text style={styles.filterItemTxt}> {item.condition}</Text>
                      <Text style={styles.filterItemTxt}> {item.value}</Text>
                    </View>
                    <View style={{ marginLeft: 5 }}>
                      <TouchableOpacity style={{width: 20, height: 20, }} onPress={() => handleRemoveFilter(index)}>
                        <Image source = {images.close} style={{width: 20, height: 20}}/>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>} */}
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                iconStyle={styles.iconStyle}
                data={pageList}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={'Page 1'}
                value={curPage ? curPage : 1}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setCurPage(item.value);
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
              <ScrollView horizontal={true} style={{ width: '100%', borderWidth: 1, marginBottom: 30, borderColor: 'rgba(0, 0, 0, 0.08)' }}>
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
                        if (cellIndex == 4) {
                          return (
                            <TouchableWithoutFeedback key={cellIndex} onPress={() => handleCellClick(rowData)}>
                              <View style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2', width: widths[cellIndex]}]}>
                                <Text style={[styles.tableText, {borderWidth: 0}]}>{cellData}</Text>
                              </View>
                            </TouchableWithoutFeedback>
                          );
                        } else if (cellIndex >= tableHead.length) {
                          return (<View key={cellIndex}></View>);
                        } else if (cellIndex == 6) {
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
                                  handleShowFacilityInfoModal(rowData);
                                }}
                              >
                                <Text style={styles.profileTitle}>View</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else if (cellIndex == 7) {
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
                                  setCellData(rowData);
                                  toggleRestPWModal();
                                }}
                              >
                                <Text style={styles.profileTitle}>Reset</Text>
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
                  <View style={[styles.modalBody, { marginTop: 0, marginBottom: 0 }]}>
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
            visible={statusModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setStatusModal(!statusModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>User Status</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleStatusModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <View style={styles.modalBody}>
                    <Dropdown
                      style={[styles.dropdown, {width: '100%'}, isFocus && { borderColor: 'blue' }]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      itemTextStyle={styles.itemTextStyle}
                      iconStyle={styles.iconStyle}
                      data={statusList}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={''}
                      value={status}
                      onFocus={() => setStatusIsFocus(true)}
                      onBlur={() => setStatusIsFocus(false)}
                      onChange={item => {
                        setStatus(item.value);
                        setStatusIsFocus(false);
                      }}
                      renderLeftIcon={() => (
                        <View
                          style={styles.icon}
                          color={isStatusFocus ? 'blue' : 'black'}
                          name="Safety"
                          size={20}
                        />
                      )}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleUpdate} underlayColor="#0056b3">
                      <Text style={styles.buttonText}>
                        Submit
                      </Text>
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
                  <Text style={styles.headerText}>Facility Details / Shifts</Text>
                  <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleUserProfileModal}>
                    <Image source = {images.close} style={{width: 20, height: 20}}/>
                  </TouchableOpacity>
                </View>
                <View style={[styles.body, { marginBottom: 100, paddingHorizontal: 10 }]}>
                  <ScrollView>
                    <View style={[styles.modalBody, { padding: 0, paddingVertical: 10, marginTop: 0 }]}>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Date Added</Text>
                        <Text style={styles.content}>{formatDate(facility?.entryDate)}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>ID</Text>
                        <Text style={styles.content}>{facility?.aic}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Company Name</Text>
                        <Text style={styles.content}>{facility?.companyName}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Contact Name</Text>
                        <Text style={styles.content}>{facility?.firstname} {facility?.lastName}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Contact Email</Text>
                        <Text style={[styles.content, { color: 'blue' }]}>{facility?.contactEmail}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Contact Phone</Text>
                        <Text style={[styles.content, { color: 'blue' }]}>{facility?.contactPhone}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '95%', justifyContent: 'center', alignItems: 'center'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: RFValue(12) }]}>🖥️ ALL FACILITY SHIFT LISTINGS</Text>
                        </View>
                      </View>
                      <View style={{maxHeight: 200, flexDirection: 'row', width: '100%', paddingRight: '5%'}}>
                        <ScrollView horizontal={true} style={{width: '100%'}}>
                          <ShiftListTable />
                        </ScrollView>
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={addfilterModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setAddFilterModal(!addfilterModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.calendarContainer, { height: '80%' }]}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Filter</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleAddFilterModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={[styles.body, { marginBottom: 100 }]}>
                  <ScrollView>
                    <Text style={{ fontSize: RFValue(15), marginBottom: 5, marginTop: 20 }}>Where</Text>
                    {filters.map((filter, index) => (
                      <View key={index} style={styles.filterRow}>
                        {index !== 0 && (
                          <Dropdown
                            style={[styles.dropdown, {width: '100%'}, isLogicFocus && { borderColor: 'blue' }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            itemTextStyle={styles.itemTextStyle}
                            iconStyle={styles.iconStyle}
                            data={logicItems}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={''}
                            value={filter.logic}
                            onFocus={() => setIsLogicFocus(true)}
                            onBlur={() => setIsLogicFocus(false)}
                            onChange={item => {
                              handleFilterChange(index, 'logic', item.value);
                              setIsLogicFocus(false);
                            }}
                            renderLeftIcon={() => (
                              <View
                                style={styles.icon}
                                color={isLogicFocus ? 'blue' : 'black'}
                                name="Safety"
                                size={20}
                              />
                            )}
                          />
                        )}
                        <Dropdown
                          style={[styles.dropdown, {width: '100%'}, isFieldFocus && { borderColor: 'blue' }]}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          inputSearchStyle={styles.inputSearchStyle}
                          itemTextStyle={styles.itemTextStyle}
                          iconStyle={styles.iconStyle}
                          data={fieldsItems}
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder={''}
                          value={filter.field}
                          onFocus={() => setIsFieldFocus(true)}
                          onBlur={() => setIsFieldFocus(false)}
                          onChange={item => {
                            handleFilterChange(index, 'field', item.value);
                            setIsFieldFocus(false);
                          }}
                          renderLeftIcon={() => (
                            <View
                              style={styles.icon}
                              color={isFieldFocus ? 'blue' : 'black'}
                              name="Safety"
                              size={20}
                            />
                          )}
                        />
                        <Dropdown
                          style={[styles.dropdown, {width: '100%'}, isConditionFocus && { borderColor: 'blue' }]}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          inputSearchStyle={styles.inputSearchStyle}
                          itemTextStyle={styles.itemTextStyle}
                          iconStyle={styles.iconStyle}
                          data={conditionItems}
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder={''}
                          value={filter.condition}
                          onFocus={() => setIsConditionFocus(true)}
                          onBlur={() => setIsConditionFocus(false)}
                          onChange={item => {
                            handleFilterChange(index, 'condition', item.value);
                            setIsConditionFocus(false);
                          }}
                          renderLeftIcon={() => (
                            <View
                              style={styles.icon}
                              color={isConditionFocus ? 'blue' : 'black'}
                              name="Safety"
                              size={20}
                            />
                          )}
                        />
                        {renderInputField(filter, index)}
                        <TouchableOpacity style={[styles.button, { marginLeft: 0 }]} onPress={() => removeFilter(index)}>
                          <Text style={{ color: 'white', textAlign: 'center' }}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity style={[styles.button, { marginLeft: 0 }]} onPress={addFilter}>
                      <Text style={styles.buttonText}>Add filter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, { marginLeft: 0 }]} onPress={handleSubmit} underlayColor="#0056b3">
                      <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
      <Loader visible={loading} />
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
  content: {
    fontSize: RFValue(16),
    lineHeight: 30,
    width: '60%'
  },
  topView: {
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
  titles: {
    fontWeight: 'bold',
    fontSize: RFValue(16),
    lineHeight: 30,
    width: '40%'
  },
  title: {
    fontSize: RFValue(18),
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
    fontSize: RFValue(14),
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
  filterItem: {
    paddingHorizontal: 10,
    height: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: '#2a53c1',
    marginRight: 5,
    marginBottom: 3,
    borderRadius: 50,
  },
  filterItemTxt: {
    color: 'blue',
    textDecorationLine: 'underline'
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
    marginBottom: 20
  },
  profileTitle: {
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: RFValue(14),
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
    fontSize: RFValue(18),
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
    width: 150,
    backgroundColor: 'white',
    paddingVertical: 5,
    color: 'black',
    height: 30,
  },
  searchBtn: {
    width: 80,
    height: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: '#2a53c1',
    marginLeft: 5
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
    color: 'black',
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
    fontSize: RFValue(14),
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
    color: 'black',
    height: 40,
    fontSize: RFValue(16),
  },
  button: {
    backgroundColor: '#A020F0',
    padding: 10,
    marginTop: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: RFValue(16),
  },
  input: {
    backgroundColor: 'white', 
    height: 40, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
  },
});
