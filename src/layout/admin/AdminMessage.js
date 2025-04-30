import React, { useState, useEffect } from 'react';
import { Alert, Modal, TextInput, View, Image, StyleSheet, Dimensions, ScrollView, StatusBar, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Text } from 'react-native-paper';
import { Table } from 'react-native-table-component';
import { CheckBox } from 'react-native-elements'
import { allCaregivers, getDegreeList, sendMessage } from '../../utils/useApi';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import { Dropdown } from 'react-native-element-dropdown';
import AHeader from '../../components/Aheader';
import Loader from '../Loader';
import AnimatedHeader from '../AnimatedHeader';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function AdminMessage({ navigation }) {
  const [data, setData] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusFilter, setIsFocusFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [isMsgModal, setIsMsgModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState("");
  const [allChecked, setAllChecked] = useState(false);
  const [curPage, setCurPage] = useState(1);
  const [pageList, setPageList] = useState([
    {label: 'Page 1', value: 1}
  ]);
  const [filterItems, setFilterItems] = useState([
    {
      value: '',
      label: ''
    }
  ]);
  const tableHead = [
    'Name',
    'Phone',
    'Degree/Discipline',
    'Email',
  ];
  const widths = [60, 200, 200, 180, 300];

  const toggleCheckbox = (row) => {
    setSelectedUsers(prev => 
      prev.includes(row[4]) 
        ? prev.filter(userId => userId !== row[4]) 
        : [...prev, row[4]]
    );
  };

  const checkState = (row) => {
    return selectedUsers.includes(row[4]);
  };

  function formatData(data) {
    return data.map(item => {
        const fullName = `${item[1]} ${item[2]}`;
        return [fullName, item[3], item[4], item[5], item[13]];
    });
  };

  useEffect(() => {
    if (allChecked) {
      const allUserIds = data.map(row => row[4]);
      setSelectedUsers(allUserIds);
      setSelectedFilter("All")
    } else {
      setSelectedUsers([]);
    }
  }, [allChecked]);

  useEffect(() => {
    if (selectedFilter === "All") {
      const allUserIds = data.map(row => row[4]);
      setSelectedUsers(allUserIds);
      setAllChecked(true);
    } else if (selectedFilter === "") {
      setSelectedUsers([]);
      setAllChecked(false);
    } else {
      const filteredUserIds = data
        .filter(row => row[2] === selectedFilter)
        .map(row => row[4]);
      setSelectedUsers(filteredUserIds);
      setAllChecked(false);
    }
  }, [selectedFilter]);

  const getDegress = async () => {
    const response = await getDegreeList('degree');
    if (!response?.error) {
      let tempArr = [];
      response.data.map(item => {
        tempArr.push({ label: item.degreeName, value: item.degreeName });
      });
      tempArr.unshift({ label: 'Unselect All', value: '' });
      tempArr.unshift({ label: 'Select All', value: 'All' });
      tempArr.unshift({ label: '', value: '' });
      setFilterItems(tempArr);
    } else {
      setFilterItems([]);
    }
  };

  const getData = async (requestData = { search: search, page: curPage, filters: [] }, isFilter = false ) => {
    setLoading(true);
    let result = await allCaregivers(requestData, 'clinical');
    if(!result) {
      setData(['No Data'])
    } else {
      const modifiedData = formatData(result.dataArray);
      let pageContent = [];
      for (let i = 1; i <= result.totalPageCnt; i++) {
        pageContent.push({ label: 'Page ' + i, value: i });
      }
      setPageList(pageContent);
      setData(modifiedData);

      if (selectedFilter === "All") {
        const allUserIds = modifiedData.map(row => row[4]);
        setSelectedUsers(allUserIds);
      } else if (selectedFilter === "") {
        setSelectedUsers([]);
      } else {
        const filteredUserIds = modifiedData
          .filter(row => row[2] === selectedFilter)
          .map(row => row[4]);
        setSelectedUsers(filteredUserIds);
      }
    }
    setLoading(false);
  };

  const handleShowMsgModal = async () => {
    if (selectedUsers.length == 0) {
      Alert.alert("Alert", "You must select at least one User.");
    } else {
      setIsMsgModal(true);
    }
  };

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

  useEffect(() => {
    getDegress();
    getData();
  }, []);

  const handleSendMsg = async () => {
    if (content) {
      const response = await sendMessage({ caregiverIds: selectedUsers, type: selectedFilter, message: content });
      if (!response?.error) {
        setIsMsgModal(false);
        setLoading(false);
        Alert.alert(
          'Success!',
          `Message sent successfully`,
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
      } else {
        setLoading(false);
        Alert.alert(
          'Failed!',
          `${response.error}`,
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
      }
    } else {
      Alert.alert(
        'Validation',
        'Please enter message',
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
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent backgroundColor="transparent"
      />
      <AHeader navigation={navigation}  currentPage={8} />
      <SubNavbar navigation={navigation} name={"AdminLogin"}/>
      <ScrollView style={{ width: '100%', marginTop: height * 0.22 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topView}>
          <AnimatedHeader title="ADMIN MESSAGE" />
          <View style={styles.bottomBar} />
        </View>
        <View>
          <View style={styles.body}>
            <View style={styles.modalBody}>
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
              <View style={styles.filterRow}>
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
              </View>
              <View style={styles.filterContainer}>
                <Dropdown
                  style={[styles.dropdown, isFocusFilter && { borderColor: 'blue' }, { width: 200 }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  itemTextStyle={styles.itemTextStyle}
                  iconStyle={styles.iconStyle}
                  data={filterItems}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={''}
                  value={curPage ? curPage : 1}
                  onFocus={() => setIsFocusFilter(true)}
                  onBlur={() => setIsFocusFilter(false)}
                  onChange={item => {
                    setSelectedFilter(item.value);
                    setIsFocusFilter(false);
                  }}
                  renderLeftIcon={() => (
                    <View
                      style={styles.icon}
                      color={isFocusFilter ? 'blue' : 'black'}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
                <TouchableOpacity
                  style={[styles.commonBtn, {  }]}
                  onPress={handleShowMsgModal}
                >
                  <Text style={styles.profileTitle}>Send Message</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal={true} style={{ width: '100%', borderWidth: 1, marginBottom: 30, borderColor: 'rgba(0, 0, 0, 0.08)' }}>
                <Table >
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ccffff' }}>
                    <View style={{ width: widths[0], borderColor: 'rgba(0, 0, 0, 0.08)', borderWidth: 1}} >
                      <CheckBox
                        checked={allChecked}
                        onPress={() => setAllChecked(!allChecked)}
                        checkedIcon={<Image source={images.checkedbtn} style={{ width: 20, height: 20 }} />}
                        uncheckedIcon={<Image source={images.uncheckedbtn} style={{ width: 20, height: 20 }} />}
                      />
                    </View>
                    {tableHead.map((item, index) => (
                      <Text
                        key={index}
                        style={[styles.tableText, { width: widths[index + 1], textAlign: 'center' }]}
                      >
                        {item}
                      </Text>
                    ))}
                  </View>
                  {data.map((rowData, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: 'row' }}>
                      <View style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', backgroundColor: '#E2E2E2', width: widths[0]}]}>
                        <CheckBox
                          checked={checkState(rowData)}
                          onPress={() => toggleCheckbox(rowData)}
                          checkedIcon={<Image source={images.checkedbtn} style={{ width: 20, height: 20 }} />}
                          uncheckedIcon={<Image source={images.uncheckedbtn} style={{ width: 20, height: 20 }} />}
                        />
                      </View>
                      {rowData.map((cellData, cellIndex) => {
                        if (cellIndex >= tableHead.length) {
                          return (<View key={cellIndex}></View>);
                        } else {
                          if (cellIndex == 1 || cellIndex == 3) {
                            return (
                              <View key={cellIndex} style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2', width: widths[cellIndex + 1]}]}>
                                <Text style={[styles.tableText, {borderWidth: 0, color: 'blue' }]}>{cellData}</Text>
                              </View>
                            );
                          } else {
                            return (
                              <View key={cellIndex} style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2', width: widths[cellIndex + 1]}]}>
                                <Text style={[styles.tableText, {borderWidth: 0}]}>{cellData}</Text>
                              </View>
                            );
                          }
                        }
                      })}
                    </View>
                  ))}
                </Table>
              </ScrollView>
            </View>
          </View>
          <Modal
            visible={isMsgModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setIsMsgModal(!isMsgModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Send Message</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={() => setIsMsgModal(false)}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={[styles.body, { marginBottom: 0 }]}>
                  <View style={styles.modalBody}>
                    <TextInput
                      style={[styles.inputs, { color: 'black' }]}
                      onChangeText={setContent}
                      value={content}
                      multiline={true}
                      textAlignVertical="top"
                      placeholder=""
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSendMsg} underlayColor="#0056b3">
                      <Text style={styles.buttonText}>Send</Text>
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  topView: {
    marginLeft: '10%',
    width: '80%',
    position: 'relative'
  },
  filterContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  bottomBar: {
    marginTop: 30,
    height: 5,
    backgroundColor: '#4f70ee1c',
    width: '100%'
  },
  profileTitle: {
    fontWeight: 'bold',
    color: 'white',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    height: 80,
    padding: 20,
    borderBottomColor: '#c4c4c4',
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
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
  commonBtn: {
    // alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: 'green',
    borderRadius: 20,
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
    width: '35%',
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
    textAlign: 'center',
    color: 'white',
    fontSize: RFValue(14),
  },
  inputs: {
    marginTop: 5,
    marginBottom: 0,
    minHeight: 100,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'white'
  },
});
