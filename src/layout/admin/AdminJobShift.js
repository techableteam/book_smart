import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, Image, Button, Text, Dimensions, ScrollView, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import DatePicker from 'react-native-date-picker';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import images from '../../assets/images';
import HButton from '../../components/Hbutton';
import MHeader from '../../components/Mheader';
import MFooter from '../../components/Mfooter';
import { PostJob, getDegreeList, addDegreeItem, Clinician, getLocationList } from '../../utils/useApi';
import SubNavbar from '../../components/SubNavbar';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function AdminJobShift({ navigation }) {
  const [facility, setFacility] = useState([]);
  const [facilityValue, setFacilityValue] = useState('');
  const [isFacilityFocus, setIsFacilityFocus] = useState(false);
  const [degreeValue, setDegreeValue] = useState(null);
  const [isDegreeFocus, setIsDegreeFocus] = useState(false);
  const [locationValue, setLocationValue] = useState(null);
  const [showAddDegreeModal, setShowAddDegreeModal] = useState(false);
  const [isLocationFocus, setIsLocationFocus] = useState(false);
  const [shiftFromDay, setShiftFromDay] = useState(new Date());
  const [showCalender, setShowCalendar] = useState(false);
  const [degreeItem, setDegreeItem] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [degree, setDegree] = useState([]);
  const [location, setLocation] = useState([]);
  const [ credentials, setCredentials ] = useState({
    facility: '',
    degree: '',
    shiftTime: "",
    shiftDate: '',
    jobNum: '',
    location: '',
    payRate: '',
    bonus: '',
    facilityId: '',
  });

  useEffect(() => {
    const areRequiredFieldsFilled = 
      credentials.facility.trim() !== '' &&
      credentials.degree.trim() !== '' &&
      credentials.shiftTime.trim() !== '' &&
      credentials.shiftDate.trim() !== '';

    setIsButtonEnabled(areRequiredFieldsFilled);
  }, [credentials]);

  useEffect(() => {
    setCredentials({...credentials, ['facility']: facilityValue});
  }, [credentials.facilityId]);

  const getData = async () => {
    let data = await Clinician('facilities/getFacilityList', 'Admin');
    if(!data?.error) {
      const uniqueValues = new Set();
      const transformed = [];
  
      data.forEach(subarray => {
        const value = subarray[2];
        if (!uniqueValues.has(value)) {
          uniqueValues.add(value);
          transformed.push({ label: value, value: value, id: subarray[0] });
        }
      });
  
      transformed.unshift({ label: 'Select...', value: 'Select...', id: '' });
      setFacility(transformed);
    } else {
      console.log('get list failure');
    }
  };

  const getLocation = async () => {
    const response = await getLocationList('location');
    if (!response?.error) {
      let tempArr = [];
      response.data.map(item => {
        tempArr.push({ label: item.locationName, value: item.locationName });
      });
      tempArr.unshift({ label: 'Select...', value: 'Select...' });
      setLocation(tempArr);
    } else {
      setLocation([]);
    }
  };

  const getDegree = async () => {
    const response = await getDegreeList('degree');
    if (!response?.error) {
      let tempArr = [];
      response.data.map(item => {
        tempArr.push({ label: item.degreeName, value: item.degreeName });
      });
      tempArr.unshift({ label: 'Select...', value: 'Select...' });
      setDegree(tempArr);
    } else {
      setDegree([]);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      getData();
      getDegree();
      getLocation();
    }, [])
  );

  const handleCredentials = (target, e) => {
    if (target === "streetAddress" || target === "streetAddress2" || target === "city" || target === "state" || target === "zip") {
      setCredentials({...credentials, address: {...credentials.address, [target]: e}})
    } else if (target === "timeFrom" || target === "dateFrom" || target === "dateTo" || target === "timeTo") {
      setCredentials({...credentials, shiftsDateAndTimes: {...credentials.shiftsDateAndTimes, [target]: e}})
    } else {
      setCredentials({...credentials, [target]: e});
    }
  };

  const toggleShowAddDegreeModal = () => {
    setShowAddDegreeModal(!showAddDegreeModal);
  };

  const handleDayChange = (target, day) => {
    handleCredentials(target, moment(day).format("MM/DD/YYYY"));
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

  const showAlerts1 = (name) => {
    Alert.alert(
      'Warning!',
      `You have to select ${name}!`,
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
    if (credentials.facility === '') {
      showAlerts1('Facility');
    } else if (credentials.degree === '') {
      showAlerts1('Degree');
    } else if (credentials.shift === '') {
      showAlerts('Shift')
    } else if (credentials.shiftDate === '') {
      showAlerts('Shift Date')
    } else {
      setIsButtonEnabled(true);
      try {
        const response = await PostJob(credentials, 'jobs');
        navigation.goBack();
      } catch (error) {
        setIsButtonEnabled(false);
        console.error('Job Shift failed: ', error);
      }
    }
  };

  const handleAddDegree = async (item) => {
    const response = await addDegreeItem({ item }, 'degree');
    if (!response?.error) {
      let tempArr = [];
      response.data.map(item => {
        tempArr.push({ label: item.degreeName, value: item.degreeName });
      });
      tempArr.unshift({ label: 'Select...', value: 'Select...' });
      setDegree(tempArr);
    } else {
      setDegree([]);
    }
    setShowAddDegreeModal(!showAddDegreeModal)
    setDegreeItem('')
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <MHeader navigation={navigation} />
      <SubNavbar navigation={navigation} name={"FacilityLogin"} />
      <ScrollView style = {styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.modal}>
          <View style= {{width: '80%', marginLeft: '10%', marginTop: 20}}>
            <Text style={styles.headBar}>Add A New Job / Shift</Text>
          </View>
          <View style={styles.authInfo}>
            <View>
              <Text style={styles.subtitle}> Select Facility <Text style={{color: 'red'}}>*</Text></Text>
              <Dropdown
                style={[styles.dropdown, isFacilityFocus && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                iconStyle={styles.iconStyle}
                data={facility}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={'Select...'}
                value={facilityValue}
                onFocus={() => setIsFacilityFocus(true)}
                onBlur={() => setIsFacilityFocus(false)}
                onChange={item => {
                  setFacilityValue(item.value);
                  setIsFacilityFocus(false);
                  setCredentials({...credentials, ['facilityId']: item.id});
                }}
                renderLeftIcon={() => (
                  <View
                    style={styles.icon}
                    color={isFacilityFocus ? 'blue' : 'black'}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </View>
            <View>
              <Text style={styles.subtitle}> Degree/Discipline <Text style={{color: 'red'}}>*</Text></Text>
              <Dropdown
                style={[styles.dropdown, isDegreeFocus && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                iconStyle={styles.iconStyle}
                data={degree}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={'Select ...'}
                value={degreeValue}
                onFocus={() => setIsDegreeFocus(true)}
                onBlur={() => setIsDegreeFocus(false)}
                onChange={item => {
                  setDegreeValue(item?.value);
                  setIsDegreeFocus(false);
                  handleCredentials('degree', item?.label)
                }}
                renderLeftIcon={() => (
                  <View
                    style={styles.icon}
                    color={isDegreeFocus ? 'blue' : 'black'}
                    name="Safety"
                    size={20}
                  />
                )}
              />
              <TouchableOpacity style={styles.addItems} onPress={toggleShowAddDegreeModal}>
                <Image source={images.plus} style={{width: 15, height: 15}} />
                <Text style={[styles.text, {color: '#2a53c1', marginTop: 0}]}>Add a new options</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.subtitle}>Time <Text style={{color: 'red'}}>*</Text> </Text>
                <TextInput
                  style={[styles.input, {width: '100%'}]}
                  placeholder=""
                  onChangeText={e => handleCredentials('shiftTime', e)}
                  value={credentials.shiftTime || ''}
                />
            </View>
            <View>
              <Text style={styles.subtitle}>Date<Text style={{color: 'red'}}>*</Text></Text>
              <View style={{flexDirection: 'column', width: '100%', gap: 5, position: 'relative'}}>
                <TouchableOpacity onPress={() => {setShowCalendar(true), console.log(showCalender)}} style={{width: '100%', height: 40, zIndex: 1}}></TouchableOpacity>
                <TextInput
                  style={[styles.input, {width: '100%', position: 'absolute', zIndex: 0}]}
                  placeholder=""
                  value={credentials.shiftDate}
                  editable={false}
                />
                {showCalender && 
                  <>
                    <DatePicker
                      date={shiftFromDay}
                      onDateChange={(day) => handleDayChange('shiftDate', day)}
                      mode="date"
                      theme='light'
                      androidVariant="native"
                    />
                    <Button title="confirm" onPress={(day) =>{setShowCalendar(!showCalender);}} />
                  </>
                }
              </View>
            </View>
            <View>
              <Text style={styles.subtitle}> Job # </Text>
              <TextInput
                style={[styles.input, {width: '100%'}]}
                placeholder=""
                onChangeText={e => handleCredentials('jobNum', e)}
                value={credentials.jobNum || ''}
              />
            </View>
            <View>
              <Text style={styles.subtitle}> Location </Text>
              <Dropdown
                style={[styles.dropdown, isLocationFocus && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                iconStyle={styles.iconStyle}
                data={location}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={''}
                value={locationValue}
                onFocus={() => setIsLocationFocus(true)}
                onBlur={() => setIsLocationFocus(false)}
                onChange={item => {
                  setLocationValue(item.value);
                  setIsLocationFocus(false);
                  handleCredentials('location', item.label);
                }}
                renderLeftIcon={() => (
                  <View
                    style={styles.icon}
                    color={isLocationFocus ? 'blue' : 'black'}
                    name="Safety"
                    size={20}
                  />
                )}
              />
            </View>
            <View>
              <Text style={styles.subtitle}> Pay Rate </Text>
              <TextInput
                style={[styles.input, {width: '100%'}]}
                placeholder=""
                onChangeText={e => handleCredentials('payRate', e)}
                value={credentials.payRate || ''}
              />
            </View>
            <View>
              <Text style={styles.subtitle}> Bonus </Text>
              <TextInput
                style={[styles.input, {width: '100%'}]}
                placeholder=""
                onChangeText={e => handleCredentials('bonus', e)}
                value={credentials.bonus || ''}
              />
            </View>
            <View style={[styles.btn, {marginTop: 20}]}>
              <HButton style={[
                styles.subBtn, 
                  { backgroundColor: isButtonEnabled ? '#6a1b9a' : '#c1c1c1' }
                ]} onPress={ handleSubmit} disabled={!isButtonEnabled} >
                Submit
              </HButton>
            </View>
          </View>
        </View>
      </ScrollView>
      {showAddDegreeModal && <Modal
        Visible={false}
        transparent= {true}
        animationType="slide"
        onRequestClose={() => {
          setShowAddDegreeModal(!showAddDegreeModal);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <View style={styles.header}>
              <Text style={[styles.headerText, { color: 'black' }]}>Add a new option</Text>
              <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleShowAddDegreeModal}>
                <Image source = {images.close} style={{width: 20, height: 20,}}/>
              </TouchableOpacity>
            </View>
            <View style={styles.body}>
              <View style={styles.modalBody}>
                <View style={styles.searchBar}>
                  <TextInput
                    style={[styles.input, {width: '100%'}]}
                    placeholder=""
                    onChangeText={e => setDegreeItem(e)}
                    value={degreeItem}
                  />
                  <HButton style={[styles.subBtn, { width: 'auto', paddingVertical: 5 }]} onPress={() => handleAddDegree(degreeItem)}>
                    Submit
                  </HButton>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>}
      <MFooter />
    </View>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: RFValue(16),
    borderRadius: 4,
    color: 'black',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 86%)',
    margin: 0,
  },
  inputAndroid: {
    fontSize: RFValue(8),
    margin: 0,
    borderRadius: 10,
    color: 'black',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 86%)',
  },
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    backgroundColor: '#fffff8'
  },
  scroll: {
    marginTop: height * 0.25
  },
  headBar: {
    textAlign: 'center',
    backgroundColor: '#BC222F',
    color: 'white',
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: RFValue(18),
    fontWeight: 'bold'
  },
  text: {
    fontSize: RFValue(14),
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
    fontSize: RFValue(20),
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
    height: 30, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'black'
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
  dropdown: {
    height: 30,
    width: '100%',
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
    color: 'black'
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
    height: 30,
    fontSize: RFValue(16),
  },
  addItems: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10
  },
  middleText: {
    fontSize: RFValue(14),
    margin: 0,
    lineHeight: 16,
    color: 'black'
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: '#000',
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
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems:'center',
    margin: 10,
    width: '90%'
  },
  searchText: {
    width: '70%',
    backgroundColor: 'white',
    height: 30,
  },
  searchBtn: {
    width: '30%',
    display: 'flex',
    justifyContent:'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: '#2a53c1',
    height: 30
  },
});
