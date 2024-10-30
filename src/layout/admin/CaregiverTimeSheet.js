import React, { useState, useEffect } from 'react';
import { TouchableOpacity, TextInput, View, StyleSheet, Image, ScrollView, Dimensions, StatusBar, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import { Table } from 'react-native-table-component';
import { Clinician, getCaregiverTimesheets } from '../../utils/useApi';
import { Dropdown } from 'react-native-element-dropdown';
import AHeader from '../../components/Aheader';
import AnimatedHeader from '../AnimatedHeader';
import Loader from '../Loader';
import images from '../../assets/images';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function CaregiverTimeSheet({ navigation }) {
  const [data, setData] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const [isFocus, setIsFocus] = useState(false);
  const [isLogicFocus, setIsLogicFocus] = useState(false);
  const [isFieldFocus, setIsFieldFocus] = useState(false);
  const [isConditionFocus, setIsConditionFocus] = useState(false);
  const [isValueOptionFocus, setIsValueOptionFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [addfilterModal, setAddFilterModal] = useState(false);
  const [valueOption, setValueOption] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [nurseList, setNurseList] = useState([]);
  const [pageList, setPageList] = useState([
    {label: 'Page 1', value: 1}
  ]);
  const tableHead = [
    'Job-ID',
    'Nurse',
    'Job Shift & Time',
    'Job Status',
    'Caregiver Hours Worked',
    'Pre Time',
    'Lunch',
    'Lunch Equation',
    'Final Hours Equatioin'
  ];
  const widths = [100, 150, 300, 250, 250, 100, 100, 150, 200];
  const logicItems = [
    {label: 'and', value: 'and'},
    {label: 'or', value: 'or'}
  ];
  const jobStatus = [
    {label: 'Avariable', value: 'Avariable'},
    {label: 'Awarded', value: 'Awarded'},
    {label: 'Pending Verification', value: 'Pending Verification'},
    {label: 'Cancelled', value: 'Cancelled'},
    {label: 'Verified', value: 'Verified'},
    {label: 'Paid', value: 'Paid'},
  ];
  const fieldsItems = [
    { label: 'Job-ID', value: 'Job-ID'},
    { label: 'Nurse', value: 'Nurse'},
    { label: 'Job Shift & Time', value: 'Job Shift & Time'},
    { label: 'Job Status', value: 'Job Status'},
    { label: 'Hours Timer (Time Entry)', value: 'Hours Timer (Time Entry)'},
    { label: 'Pre Time', value: 'Pre Time'},
    { label: 'Lunch', value: 'Lunch'},
    { label: 'Lunch Equation', value: 'Lunch Equation'},
    { label: 'Final Hours Equation', value: 'Final Hours Equation'},
  ];
  const fieldConditions = {
    'Job-ID': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'higher than', value: 'higher than' },
      { label: 'lower than', value: 'lower than' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Nurse': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Job Shift & Time': [
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
    'Job Status': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Hours Timer (Time Entry)': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Pre Time': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Lunch': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Lunch Equation': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Final Hours Equatioin': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
  };
  const [conditionItems, setConditionItems] = useState(fieldConditions['Job-ID']);

  const [filters, setFilters] = useState([
    { logic: '', field: 'Job-ID', condition: 'is', value: '', valueType: 'text' },
  ]);

  const addFilter = () => {
    setFilters([...filters, { logic: 'and', field: 'Job-ID', condition: 'is', value: '', valueType: 'text' }]);
  };

  const removeFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
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
      setConditionItems(fieldConditions[value]);  // Update the condition items based on field
  
      if (value === 'Nurse' || value === 'Job Status') {
        newFilters[index]['valueType'] = 'select';  // Set value type to 'select'
        if (value === 'Nurse') {
          setValueOption(nurseList);  // Set nurse options
        } else if (value === 'Job Status') {
          setValueOption(jobStatus);  // Set job status options
        }
      } else if (value === 'Job Shift & Time') {
        newFilters[index]['valueType'] = 'datetime';  // Set value type to 'datetime'
      } else {
        newFilters[index]['valueType'] = 'text';  // Default to text input
      }
      newFilters[index][key] = value;
    } else {
      newFilters[index][key] = value;  // Update other keys (e.g., 'condition', 'value')
    }

    setFilters(newFilters);  // Set the updated filters state
  };

  const getData = async (requestData = { search: search, page: curPage, filters: filters }, isFilter = isSubmitted ) => {
    if (!isFilter) {
      requestData.filters = [];
    }
    
    setLoading(true);
    let result = await getCaregiverTimesheets(requestData, 'jobs');
  
    if (!result.error) {
      setData(result.dataArray);
      let pageContent = [];
      for (let i = 1; i <= result.totalPageCnt; i++) {
        pageContent.push({ label: 'Page ' + i, value: i });
      }
      setPageList(pageContent);
    } else {
      setData([]);
    }
    setLoading(false);
  };

  const getNurseList = async () => {
    setLoading(true);
    let result = await Clinician('clinical/getAllList', 'Clinical');
    if (!result.error) {
      let nurses = [];
      for (let i = 0; i < result.length; i++) {
        nurses.push({ label: result[i], value: result[i] });
      }
      setNurseList(nurses);
    } else {
      setNurseList([]);
    }
    setLoading(false);
  };
  
  useFocusEffect(
    React.useCallback(() => {
      getData();
      getNurseList();
    }, [])
  );

  useEffect(() => {
    getData();
  }, [curPage]);

  const handleReset = (event) => {
    event.persist();
  
    setSearch(''); 
    getData({ search: '', page: curPage, filters: filters });
  };
  
  const handleSearch = (event) => {
    event.persist();
    setAddFilterModal(false);
    getData();
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

  const toggleAddFilterModal = () => {
    setAddFilterModal(!addfilterModal)
  };

  const renderInputField = (filter, index) => {
    const { valueType, value } = filter;

    if (valueType === 'text') {
      return (
        <TextInput
          style={styles.input}
          placeholder="Enter value"
          value={value}
          onChangeText={(text) => handleFilterChange(index, 'value', text)}
        />
      );
    }

    if (valueType === 'datetime') {
      return (
        <View style={{ flexDirection: 'column', width: '100%', gap: 5, position: 'relative' }}>
          <TouchableOpacity onPress={() => setShowDate((prev) => !prev)} style={{ width: 300, height: 40, zIndex: 2 }}>
            <View>
              <TextInput
                style={[styles.input, { width: '90%', position: 'absolute', zIndex: 1, color: 'black' }]}
                placeholder=""
                value={value}
                editable={false}
              />
            </View>
          </TouchableOpacity>
          {showDate && (
            <>
              {/* <DatePicker
                mode="datetime"
                theme="light"
                date={value ? new Date(value) : new Date()}
                onDateChange={(date) => handleFilterChange(index, 'value', date)}
              />
              <Button style={{ width: 300 }} buttonColor='rgb(26,115,232)' textColor='#fff' onPress={() => setShowDate((prev) => !prev)}>Confirm</Button> */}
            </>
          )}
        </View>
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

    return null;
  };
  
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent"/>
      <AHeader navigation={navigation}  currentPage={7} />
      <SubNavbar navigation={navigation} name={"AdminLogin"}/>
      <ScrollView style={{ width: '100%', marginTop: height * 0.25 }} showsVerticalScrollIndicator={false}>
        <View style={styles.topView}>
          <AnimatedHeader title="Jobs" />
          <View style={styles.bottomBar} />
        </View>
        <View style={{ marginTop: 30, flexDirection: 'row', width: '90%', marginLeft: '5%', gap: 10 }}></View>
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
                placeholder={'100 per page'}
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
                  {data && data.length > 0 ? (
                    data.map((rowData, rowIndex) => (
                      rowData && rowData.length > 0 ? (
                        <View key={rowIndex} style={{ flexDirection: 'row' }}>
                          {rowData.map((cellData, cellIndex) => (
                            <View key={cellIndex} style={{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2', width: widths[cellIndex] }}>
                              <Text style={[styles.tableText, { borderWidth: 0 }]}>{cellData}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null
                    ))
                  ) : (
                    <View style={{ padding: 20 }}>
                      <Text>No data available</Text>
                    </View>
                  )}
                </Table>
              </ScrollView>
            </View>
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
              <View style={styles.body}>
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
                  <TouchableOpacity style={styles.button} onPress={handleSubmit} underlayColor="#0056b3">
                    <Text style={styles.buttonText}>Submit</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
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
  topView: {
    marginLeft: '10%',
    width: '80%',
    position: 'relative'
  },
  filterRow: {
    width: '100%',
    marginBottom: 30
  },
  removeButton: {
    color: 'white',
    textAlign: 'center'
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
    backgroundColor: '#f2f2f2',
    borderRadius: 30,
    elevation: 5,
    width: '80%',
    marginLeft: '20',
    flexDirection: 'flex-start',
    borderWidth: 3,
    borderColor: '#7bf4f4',
  },
  modalBody: {
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
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
    backgroundColor: '#007BFF',
    padding: 10,
    marginTop: 30,
    borderRadius: 5,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',            // Text color
    fontSize: RFValue(16),              // Text size
  },
  input: {
    backgroundColor: 'white', 
    height: 30,
    color: 'black',
    paddingVertical: 5,
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
  },
});
