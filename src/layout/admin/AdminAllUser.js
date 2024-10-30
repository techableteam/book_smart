import React, { useState, useEffect } from 'react';
import { TouchableWithoutFeedback, Alert, Modal, View, Dimensions, TextInput, Image, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import { Table } from 'react-native-table-component';
import { updateUserInfo, removeAccount, getAllUsersList } from '../../utils/useApi';
import { Dropdown } from 'react-native-element-dropdown';
import AHeader from '../../components/Aheader';
import { useFocusEffect } from '@react-navigation/native';
import AnimatedHeader from '../AnimatedHeader';
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function AdminAllUser({ navigation }) {
  const [data, setData] = useState([]);
  const [cellData, setCellData] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [modal, setModal] = useState(false)  
  const [isJobFocus, setJobIsFocus] = useState(false);
  const [isLogicFocus, setIsLogicFocus] = useState(false);
  const [isFieldFocus, setIsFieldFocus] = useState(false);
  const [isConditionFocus, setIsConditionFocus] = useState(false);
  const [isValueOptionFocus, setIsValueOptionFocus] = useState(false);
  const [addfilterModal, setAddFilterModal] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [curPage, setCurPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [valueOption, setValueOption] = useState([]);
  const [pageList, setPageList] = useState([
    {label: 'Page 1', value: 1}
  ]);
  const widths = [200, 300, 150, 250, 150, 120];
  const tableHead = [
    'Name',
    'Email',
    'UserRole',
    'Facility',
    '✏️ User Status',
    'Delete'
  ];
  const userStatus = [
    {label: 'activate', value: 'activate'},
    {label: 'inactivate', value: 'inactivate'},
    {label: 'pending approval', value: 'pending approval'}
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
    { label: 'Name', value: 'Name'},
    { label: 'Email', value: 'Email'},
    { label: 'User Roles', value: 'User Roles'},
    { label: 'User Status', value: 'User Status'},
  ];
  const fieldConditions = {
    'Name': [
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'starts with', value: 'starts with' },
      { label: 'ends with', value: 'ends with' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Email': [
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'starts with', value: 'starts with' },
      { label: 'ends with', value: 'ends with' },
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
    'User Status': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
  };
  const [conditionItems, setConditionItems] = useState(fieldConditions['Name']);

  const [filters, setFilters] = useState([
    { logic: '', field: 'Name', condition: 'contains', value: '', valueType: 'text' },
  ]);

  const addFilter = () => {
    setFilters([...filters, { logic: 'and', field: 'Name', condition: 'contains', value: '', valueType: 'text' }]);
  };

  const removeFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleRemoveFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    getData({ search: search, page: curPage, filters: newFilters });
    setFilters(newFilters);
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

      if (value === 'User Roles' || value === 'User Status') {
        newFilters[index]['valueType'] = 'select';
        if (value === 'User Roles') {
          setValueOption(rolesList);
        } else if (value === 'User Status') {
          setValueOption(userStatus);
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
        if (newFilters[index]['field'] === 'User Roles' || newFilters[index]['field'] === 'User Status') {
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

  const getData = async (requestData = { search: search, page: curPage, filters: filters }) => {
    setLoading(true);
    let result = await getAllUsersList(requestData, 'Admin');
    if(!result) {
      setData(['No Data'])
    } else {
      setData(result.userList);
      let pageContent = [];
      for (let i = 1; i <= result.totalPageCnt; i++) {
        pageContent.push({ label: 'Page ' + i, value: i });
      }
      setPageList(pageContent);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [curPage]);

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  const toggleModal = () => {
    setModal(!modal);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    toggleAddFilterModal();
    getData();
  };

  const handleCellClick = (data) => {
    setCellData(data);
    setStatus(data[4]);
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
    try {
      const response = await updateUserInfo({userEmail: cellData[1], userRole: cellData[2], status: status, password: ''}, 'admin');

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

  const handleSearch = (event) => {
    event.persist();
    getData();
  };

  const handleReset = (event) => {
    event.persist();
  
    setSearch(''); 
    getData({ search: '', page: curPage, filters: filters });
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

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <AHeader navigation={navigation}  currentPage={5} />
      <SubNavbar navigation={navigation} name={"AdminLogin"}/>
      <ScrollView
        style={{ width: '100%', marginTop: height * 0.25 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topView}>
          <AnimatedHeader title="ALL PLATFORM USERS" />
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
              <View style={{flexDirection: 'row',  width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                  <Text style={styles.profileTitle}>🖥️ ALL PLATFORM USERS</Text>
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
              </View>
              {isSubmitted && <View style={{ flexDirection: 'row', marginBottom: 5, flexWrap: 'wrap' }}>
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
                        } else if (cellIndex == 5) {
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
                                <Text style={styles.profileTitle}>Delete</Text>
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
                          <Text style={styles.removeButton}>Remove</Text>
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
                  <Text style={styles.headerText}>Update</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={[styles.body, { marginBottom: 0, marginTop: 0 }]}>
                  <View style={[styles.modalBody, { marginTop: 0 }]}>
                    <Text style={{ fontSize: RFValue(15), marginBottom: 5, marginTop: 20 }}>User Status</Text>
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
  removeButton: {
    color: 'white',
    textAlign: 'center'
  },
  filterRow: {
    width: '100%',
    marginBottom: 30
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
    fontSize: RFValue(14),
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#22138e',
    fontWeight: 'bold',
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
    marginTop: 30
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
    color: 'black'
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: RFValue(16),
  },
  button: {
    backgroundColor: '#A020F0', // Button color
    padding: 10,
    marginTop: 30,           // Padding inside the button
    borderRadius: 5,          // Rounded corners
  },
  buttonText: {
    color: 'white',            // Text color
    fontSize: RFValue(16),              // Text size
  },
  input: {
    backgroundColor: 'white', 
    height: 40, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
  },
});
