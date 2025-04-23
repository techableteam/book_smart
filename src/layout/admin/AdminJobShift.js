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
import { PostJob, getDegreeList, addDegreeItem, Clinician, getLocationList, addLocationItem } from '../../utils/useApi';
import SubNavbar from '../../components/SubNavbar';
import { RFValue } from 'react-native-responsive-fontsize';
import Loader from '../Loader';

const { width, height } = Dimensions.get('window');

export default function AdminJobShift({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [facility, setFacility] = useState([]);
  const [facilityValue, setFacilityValue] = useState('');
  const [isFacilityFocus, setIsFacilityFocus] = useState(false);
  const [degreeValue, setDegreeValue] = useState(null);
  const [isDegreeFocus, setIsDegreeFocus] = useState(false);
  const [locationValue, setLocationValue] = useState(null);
  const [showAddDegreeModal, setShowAddDegreeModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [isLocationFocus, setIsLocationFocus] = useState(false);
  const [shiftFromDay, setShiftFromDay] = useState(new Date());
  const [showCalender, setShowCalendar] = useState(false);
  const [degreeItem, setDegreeItem] = useState('');
  const [locationItem, setLocationItem] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [degree, setDegree] = useState([]);
  const [location, setLocation] = useState([]);
  const [startHour, setStartHour] = useState(1);
  const [endHour, setEndHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endMinute, setEndMinute] = useState(0);
  const [startHourType, setStartHourType] = useState('AM');
  const [endHourType, setEndHourType] = useState('AM');
  const [isStartHourFocus, setIsStartHourFocus] = useState(false);
  const [isEndHourFocus, setIsEndHourFocus] = useState(false);
  const [isStartMinuteFocus, setIsStartMinuteFocus] = useState(false);
  const [isEndMinuteFocus, setIsEndMinuteFocus] = useState(false);
  const [isStartHourTypeFocus, setIsStartHourTypeFocus] = useState(false);
  const [isEndHourTypeFocus, setIsEndHourTypeFocus] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [endDate, setEndDate] = useState(moment(new Date()).format("MM/DD/YYYY"));

  const [ credentials, setCredentials ] = useState({
    facility: '',
    degree: '',
    shiftTime: "",
    shiftDate: moment(new Date()).format("MM/DD/YYYY"),
    jobNum: '',
    location: '',
    payRate: '',
    bonus: '',
    facilityId: '',
  });
  const hours = [
    {label: '1', value: 1},
    {label: '2', value: 2},
    {label: '3', value: 3},
    {label: '4', value: 4},
    {label: '5', value: 5},
    {label: '6', value: 6},
    {label: '7', value: 7},
    {label: '8', value: 8},
    {label: '9', value: 9},
    {label: '10', value: 10},
    {label: '11', value: 11},
    {label: '12', value: 12},
  ];
  const minutes = [
    {label: '00', value: 0},
    {label: '15', value: 15},
    {label: '30', value: 30},
    {label: '45', value: 45},
  ];
  const hourtypes = [
    {label: 'AM', value: 'AM'},
    {label: 'PM', value: 'PM'}
  ];

  useEffect(() => {
    const areRequiredFieldsFilled = 
      credentials.facility.trim() !== '' &&
      credentials.degree.trim() !== '' &&
      credentials.shiftTime.trim() !== '' &&
      credentials.shiftDate.trim() !== '';

    setIsButtonEnabled(areRequiredFieldsFilled);
  }, [credentials]);

  const formatTime = (hour, minute, type) => {
    return `${hour}:${minute.toString().padStart(2, '0')} ${type}`;
  };

  const formatDateTime = (date, hour, minute, type) => {
    const adjustedHour =
      type === 'PM' && hour !== 12 ? hour + 12 :
      type === 'AM' && hour === 12 ? 0 :
      hour;
  
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), adjustedHour, minute);
  };

  useEffect(() => {
    if (credentials.shiftDate == "" || endDate == "") {
      return;
    }

    // Helper function to parse "MM/DD/YYYY" into a Date object
    const parseDate = (dateString) => {
      const [month, day, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day); // JavaScript months are zero-based
    };
  
    // Convert dates and combine with times
    const startDate = parseDate(credentials.shiftDate);
    const endDateObj = parseDate(endDate);
    
    const startTimeInMinutes = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      startHour + (startHourType === 'PM' && startHour !== 12 ? 12 : 0) - (startHourType === 'AM' && startHour === 12 ? 12 : 0),
      startMinute
    ).getTime();
  
    const endTimeInMinutes = new Date(
      endDateObj.getFullYear(),
      endDateObj.getMonth(),
      endDateObj.getDate(),
      endHour + (endHourType === 'PM' && endHour !== 12 ? 12 : 0) - (endHourType === 'AM' && endHour === 12 ? 12 : 0),
      endMinute
    ).getTime();
  
    console.log(startTimeInMinutes, endTimeInMinutes);
  
    const time = `${formatTime(startHour, startMinute, startHourType)} - ${formatTime(endHour, endMinute, endHourType)}`;
  
    if (startTimeInMinutes >= endTimeInMinutes) {
      Alert.alert(
        'Invalid Shift Time',
        'The start time is later than or equal to the end time. Do you want to reset the shift time?',
        [
          {
            text: 'Cancel',
            onPress: () => {
              handleCredentials('shiftTime', time);
            },
          },
          {
            text: 'OK',
            onPress: () => {
              handleDayChange('shiftDate', new Date());
              setEndDate(moment(new Date()).format("MM/DD/YYYY"));
              setStartHour(1);
              setStartMinute(0);
              setStartHourType('AM');
              setEndHour(9);
              setEndMinute(0);
              setEndHourType('AM');
            },
          },
        ]
      );
    } else {
      handleCredentials('shiftTime', time);
    }
  }, [
    startHour,
    endHour,
    startMinute,
    endMinute,
    startHourType,
    endHourType,
    credentials.shiftDate,
    endDate,
  ]);
  
  useEffect(() => {
    setCredentials({...credentials, ['facility']: facilityValue});
  }, [credentials.facilityId]);

  const getData = async () => {
    setLoading(true);
    let data = await Clinician('facilities/getFacilityList', 'Admin');
    setLoading(false);
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
    const response = await getLocationList('location', 'Facilities', -3);
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

  const toggleAddLocationModal = () => {
    setShowAddLocationModal(!showAddLocationModal);
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

  const handleAddLocation = async () => {
    let response = await addLocationItem({ item: locationItem, type: 'Facilities', user_id: -3 }, 'location');
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
    setLocationItem('');
    toggleAddLocationModal();
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <MHeader navigation={navigation} back={true} />
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
              <View>
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Dropdown
                  style={[styles.dropdown, { width: RFValue(80), marginBottom: 0 }, isStartHourFocus && { borderColor: 'blue' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  itemTextStyle={styles.itemTextStyle}
                  iconStyle={styles.iconStyle}
                  data={hours}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={''}
                  value={startHour}
                  onFocus={() => setIsStartHourFocus(true)}
                  onBlur={() => setIsStartHourFocus(false)}
                  onChange={item => {
                    setStartHour(item.value);
                    setIsStartHourFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <View
                      style={styles.icon}
                      color={isStartHourFocus ? 'blue' : 'black'}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
                <Text> : </Text>
                <Dropdown
                  style={[styles.dropdown, { width: RFValue(80), marginBottom: 0 }, isStartMinuteFocus && { borderColor: 'blue' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  itemTextStyle={styles.itemTextStyle}
                  iconStyle={styles.iconStyle}
                  data={minutes}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={''}
                  value={startMinute}
                  onFocus={() => setIsStartMinuteFocus(true)}
                  onBlur={() => setIsStartMinuteFocus(false)}
                  onChange={item => {
                    setStartMinute(item.value);
                    setIsStartMinuteFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <View
                      style={styles.icon}
                      color={isStartMinuteFocus ? 'blue' : 'black'}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
                <Dropdown
                  style={[styles.dropdown, { width: RFValue(80), marginBottom: 0 }, isStartHourTypeFocus && { borderColor: 'blue' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  itemTextStyle={styles.itemTextStyle}
                  iconStyle={styles.iconStyle}
                  data={hourtypes}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={''}
                  value={startHourType}
                  onFocus={() => setIsStartHourTypeFocus(true)}
                  onBlur={() => setIsStartHourTypeFocus(false)}
                  onChange={item => {
                    setStartHourType(item.value);
                    setIsStartHourTypeFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <View
                      style={styles.icon}
                      color={isStartHourTypeFocus ? 'blue' : 'black'}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginVertical: 5 }}>
                <Text>To</Text>
              </View>
              <View>
                <View style={{flexDirection: 'column', width: '100%', gap: 5, position: 'relative'}}>
                  <TouchableOpacity onPress={() => {setShowEndDate(true), console.log(showEndDate)}} style={{width: '100%', height: 40, zIndex: 1}}></TouchableOpacity>
                  <TextInput
                    style={[styles.input, {width: '100%', position: 'absolute', zIndex: 0}]}
                    placeholder=""
                    value={endDate}
                    editable={false}
                  />
                  {showEndDate && 
                    <>
                      <DatePicker
                        date={shiftFromDay}
                        onDateChange={(day) => setEndDate(moment(day).format("MM/DD/YYYY"))}
                        mode="date"
                        theme='light'
                        androidVariant="native"
                      />
                      <Button title="confirm" onPress={(day) =>{setShowEndDate(!showEndDate);}} />
                    </>
                  }
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Dropdown
                  style={[styles.dropdown, { width: RFValue(80), marginBottom: 0 }, isEndHourFocus && { borderColor: 'blue' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  itemTextStyle={styles.itemTextStyle}
                  iconStyle={styles.iconStyle}
                  data={hours}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={''}
                  value={endHour}
                  onFocus={() => setIsEndHourFocus(true)}
                  onBlur={() => setIsEndHourFocus(false)}
                  onChange={item => {
                    setEndHour(item.value);
                    setIsEndHourFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <View
                      style={styles.icon}
                      color={isEndHourFocus ? 'blue' : 'black'}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
                <Text> : </Text>
                <Dropdown
                  style={[styles.dropdown, { width: RFValue(80), marginBottom: 0 }, isEndMinuteFocus && { borderColor: 'blue' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  itemTextStyle={styles.itemTextStyle}
                  iconStyle={styles.iconStyle}
                  data={minutes}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={''}
                  value={endMinute}
                  onFocus={() => setIsEndMinuteFocus(true)}
                  onBlur={() => setIsEndMinuteFocus(false)}
                  onChange={item => {
                    setEndMinute(item.value);
                    setIsEndMinuteFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <View
                      style={styles.icon}
                      color={isEndMinuteFocus ? 'blue' : 'black'}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
                <Dropdown
                  style={[styles.dropdown, { width: RFValue(80), marginBottom: 0 }, isEndHourTypeFocus && { borderColor: 'blue' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  itemTextStyle={styles.itemTextStyle}
                  iconStyle={styles.iconStyle}
                  data={hourtypes}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={''}
                  value={endHourType}
                  onFocus={() => setIsEndHourTypeFocus(true)}
                  onBlur={() => setIsEndHourTypeFocus(false)}
                  onChange={item => {
                    setEndHourType(item.value);
                    setIsEndHourTypeFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <View
                      style={styles.icon}
                      color={isEndHourTypeFocus ? 'blue' : 'black'}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
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
              <TouchableOpacity style={styles.addItems} onPress={toggleAddLocationModal}>
                <Image source={images.plus} style={{width: 15, height: 15}} />
                <Text style={[styles.text, {color: '#2a53c1', marginTop: 0}]}>Add a new options</Text>
              </TouchableOpacity>
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
      {showAddLocationModal && <Modal
        Visible={false}
        transparent= {true}
        animationType="slide"
        onRequestClose={() => {
          setShowAddLocationModal(!showAddLocationModal);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Add a new location</Text>
              <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleAddLocationModal}>
                <Image source = {images.close} style={{width: 20, height: 20,}}/>
              </TouchableOpacity>
            </View>
            <View style={styles.body}>
              <View style={styles.modalBody}>
                <View style={styles.searchBar}>
                  <TextInput
                    style={[styles.input, {width: '100%'}]}
                    placeholder=""
                    onChangeText={e => setLocationItem(e)}
                    value={locationItem}
                  />
                  <HButton style={[styles.subBtn, { width: 'auto', paddingHorizontal: 10, paddingVertical: 5, fontWeight: '100', fontSize: RFValue(14) }]} onPress={handleAddLocation}>
                    Submit
                  </HButton>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>}
      <Loader visible={loading}/>
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
    marginTop: height * 0.22
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
    fontSize: RFValue(14),
  },
  selectedTextStyle: {
    color: 'black',
    fontSize: RFValue(14),
  },
  itemTextStyle: {
    color: 'black',
    fontSize: RFValue(14),
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 30,
    fontSize: RFValue(14),
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
