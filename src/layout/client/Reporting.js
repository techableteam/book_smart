import React, { useState } from 'react';
import { FlatList, Modal, TextInput, View, Image, Dimensions, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import ImageButton from '../../components/ImageButton';
import { MyShift, UpdateTime } from '../../utils/useApi';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import AnimatedHeader from '../AnimatedHeader';
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function Reporting ({ navigation }) {
  const [data, setData] = useState({reportData: [],dailyPay: 0, weeklyPay: 0});
  const [userInfos, setUserInfo] = useState([]);
  const [detailedInfos, setDetailedInfos] = useState([]);
  const [clocks, setClocks] = useState([]);
  const [dailyPay, setDailyPay] = useState({date: '', pay: 0});
  const [weeklyPay, setWeeklyPay] = useState({date: '', pay: 0});
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const getData = async () => {
    setLoading(true);
    let data = await MyShift('jobs', 'Clinician');
    if (!data) {
      setData(['No Data']);
    } else {
      setData(data);
      let transformedData = [];
      const monthGroups = {};
      const extractVerifiedJobs = data.reportData.filter(job => job.shiftStatus === "Verified");
      console.log(extractVerifiedJobs);
      setClocks(extractVerifiedJobs)
      
      transformedData = data.reportData.map(({ entryDate, jobId, shiftStatus, unit, shiftDateAndTimes }, index) => ({ key: index, entryDate, jobId, jobStatus: shiftStatus, unit, shiftDateAndTimes }));
      transformedData.forEach(item => {
        const month = item.entryDate.split('/')[0] + "/24";
        if (!monthGroups[month]) {
          monthGroups[month] = [];
        }
        monthGroups[month].push(item);
      });
      const sortedKeys = Object.keys(monthGroups).sort((a, b) => {
        const dateA = new Date(a.split('/')[1], a.split('/')[0] - 1);
        const dateB = new Date(b.split('/')[1], b.split('/')[0] - 1);
        return dateB - dateA;
      });
      const sortedMonthGroups = {};
      sortedKeys.forEach(key => {
        sortedMonthGroups[key] = monthGroups[key];
      });
      const mothData = Object.keys(sortedMonthGroups).map(month => ({
        month: month,
        number: String(sortedMonthGroups[month].length)
      }));
      mothData.unshift({ "month": "Month", "number": "Count" });
      mothData.push({ "month": "Sum", "number": String(data.reportData.length) });
      const totalPayString = data.dailyPay;
      const weeklyPayString = data.weeklyPay;
      setDailyPay(totalPayString);
      setWeeklyPay(weeklyPayString);
      setUserInfo(mothData);
      setDetailedInfos(sortedMonthGroups);
    }
    setLoading(false);
  }

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  const handleNavigate = (navigateUrl) => {
    navigation.navigate(navigateUrl);
  };

  const [myShiftDate, setMyShiftDate] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const myRenderItem = ({ item, index }) => {
    return (
      <View key={index} style={[styles.row, index === 0 ? styles.evenRow : null, ]}>
        <Text style={{width: '20%', textAlign: 'center', fontWeight: 'bold'}}>{item.text1}</Text>
        <View style={{width: 1, height: '200%', backgroundColor: 'hsl(0, 0%, 86%)', position: 'absolute', left: '25%'}} />
        <Text style={[{width: '40%', textAlign: 'center'}, index == 0 ? {fontWeight: 'bold'}: {fontWeight: '400'}]}>{item.text2}</Text>
        <View style={{width: 1, height: '200%', backgroundColor: 'hsl(0, 0%, 86%)', position: 'absolute', left: '65%' }} />
        <Text style={[{width: '20%', textAlign: 'center'}, index == 0 ? {fontWeight: 'bold'}: {fontWeight: '400'}]}>{item.text3}</Text>
        <View style={{width: 1, height: '200%', backgroundColor: 'hsl(0, 0%, 86%)', position: 'absolute', left: '85%'}} />
        <Text style={[{width: '20%', textAlign: 'center'}, index == 0 ? {fontWeight: 'bold'}: {fontWeight: '400'}]}>{item.text4}</Text>
      </View>
    );
  };

  const [searchTerm, setSearchTem] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const handleSearch = (e) => {
    setSearchTem(e);
    if (e !== '') {
      const filtered = myShiftDate.filter(item => 
        Object.values(item).some(value => 
          value.toString().toLowerCase().includes(e.toLowerCase())
        )
      );
      filtered.unshift({text1: 'Job-ID', text2: 'Job Status', text3: 'Unit', text4: 'Shift'});
      console.log("detailedData", filtered);
      setFilteredData(filtered);
    } else {
      let detailedData = myShiftDate;
      detailedData.unshift({text1: 'Job-ID', text2: 'Job Status', text3: 'Unit', text4: 'Shift'});
      console.log("detailedData", detailedData);
      setFilteredData(detailedData);
    }
  };

  const handleClick = (id) => {
    if (id !== 'Month' && id !== 'Sum'){
      const detailedData = detailedInfos[id].map(({jobId, jobStatus, unit, shiftDateAndTimes})=> ({"text1": jobId, "text2": jobStatus, "text3": unit, "text4": shiftDateAndTimes}))      
      setMyShiftDate(detailedData);
      detailedData.unshift({text1: 'Job-ID', text2: 'Job Status', text3: 'Unit', text4: 'Shift'});
      setFilteredData(detailedData);
      toggleModal();
    }
  };
  
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleButtonClick = async(jobId, laborSate) => {
    const timeNow = moment(new Date()).format("MM/DD/YYYY hh:mm");
    const existingJobIndex = times.findIndex(time => time.jobId === jobId)
    let deliverArray = {};
    let index = 0;
    if (laborSate == 0) {
      index = times.length-1;
      console.log(index, times);
      deliverArray = { jobId, laborState: 1, shiftStartTime: timeNow, shiftEndTime: '' };
      setTimes([...times, { jobId, laborState: 1, shiftStartTime: timeNow, shiftEndTime: '' }]);
    } else {
      const updatedTimes = [...times];
      updatedTimes[existingJobIndex].shiftEndTime = timeNow;
      updatedTimes[existingJobIndex].laborState = 2;
      setTimes(updatedTimes);
      index = existingJobIndex;
      deliverArray = updatedTimes[index]
    }
    const update = await UpdateTime(deliverArray, 'jobs')
    if(update) {
      getData();
    }
  };

  return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <MHeader navigation={navigation} />
        <SubNavbar navigation={navigation} name={'ClientSignIn'}/>
        <ScrollView style={{width: '100%', marginTop: height * 0.25}} showsVerticalScrollIndicator={false}>
          <View style={styles.topView}>
            <AnimatedHeader title="CAREGIVER REPORTING" />
            <View style={styles.bottomBar}/>
          </View>
          <View style={styles.imageButton}>
            <ImageButton title={"My Home"} onPress={() => handleNavigate('MyHome')} />
            <ImageButton title={"My Profile"} onPress={() => handleNavigate('EditProfile')} />
            <ImageButton title={"All Shift Listings"} onPress={() => handleNavigate('ShiftListing')} />
            <ImageButton title={"My Shifts"} onPress={() => handleNavigate('Shift')} />
          </View>
          <View style = {{ width:'100', flex : 1, justifyContent: 'center', alignItems:'center'}}>
            <View style={styles.profile}>
              <View style={styles.profileTitleBg}>
                <Text style={styles.profileTitle}>MY SHIFTS BY MONTH</Text>
              </View>
              <Text style={styles.name}>"Click On Any Value To View Details"</Text>
              {
                userInfos.map((item, index) => 
                  <View key={index} style={[styles.row, {paddingHorizontal: 0}, index === 0 || index === userInfos.length-1 ? styles.evenRow : null]}>
                    <Text style={{width: '50%', textAlign: 'center', fontWeight: 'bold'}}>{item.month}</Text>
                    <View style={{width: 1, height: RFValue(40), backgroundColor: 'hsl(0, 0%, 86%)', position: 'absolute', left: '50%'}} />
                    <Text style={[{width: '50%', textAlign: 'center'}, index == 0 || index === userInfos.length-1 ? {fontWeight: 'bold'}: {fontWeight: '400'}]} onPress={() => handleClick(item.month)}>{item.number}</Text>
                  </View>
                )
              }
              {
                clocks.map((item, index) => 
                  <View key={index} style={{flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10, height: 120}}>
                    {
                      item.laborState === 2 ? 
                      <Text style={{backgroundColor: '#394232', padding: RFValue(10), fontSize: RFValue(14), textAlign: 'center', fontWeight: 'bold', color: 'black', borderRadius: 5}}
                      >
                        Ended
                      </Text>
                      :
                      <TouchableOpacity onPress={() => handleButtonClick(item.jobId, item.laborState)}>
                        <Text style={{backgroundColor: '#BC222F', padding: RFValue(10), fontSize: RFValue(14), textAlign: 'center', fontWeight: 'bold', borderRadius: 5, color: 'white'}}>
                          {item.laborState === 0 ?'Clock In': 'Clock Out'}
                        </Text>
                      </TouchableOpacity>
                    }
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                      <Text style={[styles.name, {paddingHorizontal: 10, height: '100%',}]}>JobId: {item.jobId}</Text>
                      <View style={{height: '100%', width: '50%', marginLeft: 10}}>
                        <Text style={styles.name}>{item.shiftStartTime}</Text>
                        <Text style={styles.name}>{item.shiftEndTime}</Text>
                      </View>
                    </View>
                  </View>
                )
              }
              <View style={[styles.profileTitleBg, {marginTop: 30}]}>
                <Text style={styles.profileTitle}>Daily & Weekly Pay</Text>
              </View>
              <View style={{width: '90%', marginBottom: 30}}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                  <Text style={[styles.name, { width: '25%' }]}>Day:</Text>
                  <View>
                    <Text style={styles.name}>{dailyPay.date}</Text>
                    <Text style={styles.name}>${dailyPay.pay}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                  <Text style={[styles.name, { width: '25%' }]}>Week:</Text>
                  <View>
                    <Text style={styles.name}>{weeklyPay.date}</Text>
                    <Text style={styles.name}>${weeklyPay.pay}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          
        </ScrollView>
          {showModal && <Modal
            Visible={false}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setShowModal(!showModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Modal Header</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <View style={styles.modalBody}>
                    <View style={styles.searchBar}>
                      <TextInput
                        style={[styles.searchText]}
                        placeholder=""
                        onChangeText={e => handleSearch(e)}
                        value={searchTerm || ''}
                      />
                      <TouchableOpacity style={styles.searchBtn}>
                        <Text>Search</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{width: '90%', marginBottom: 30}}>
                      <FlatList
                        data={filteredData}
                        renderItem={myRenderItem}
                        keyExtractor={(item) => item.id}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Modal>}
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
    marginTop: RFValue(20),
    width: '85%',
    padding: RFValue(20),
    backgroundColor: '#c2c3c42e',
    borderRadius: RFValue(30),
    borderWidth: 2,
    borderColor: '#b0b0b0',
    marginBottom: RFValue(100)
  },
  profileTitleBg: {
    backgroundColor: '#BC222F',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20
  },
  profileTitle: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: RFValue(16)
  },
  name: {
    fontSize: RFValue(13),
    marginBottom: RFValue(10),
    fontStyle: 'italic',
    color: '#22138e',
    fontWeight: 'bold',
  },
  row: {
    padding: RFValue(10),
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
    paddingHorizontal:20,
    paddingBottom: 30
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
    backgroundColor: 'rgba(79, 44, 73, 0.19)',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '60%',
    borderRadius: 10,
    height: 30,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems:'center',
    margin: 10,
    borderRadius: 10,
    height: 30,
    marginBottom: 10,
  },
  searchText: {
    width: '70%',
    backgroundColor: 'white',
    height: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0
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
  filter: {
    width: '90%',
    display:'flex',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 5,
  },
  filterBtn: { 
    backgroundColor: 'rgba(0, 0, 0, 0.08)', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems:'center',
    padding: 5,
    gap: 5,
    marginBottom: 10
  },
  filterText: {
    color: '#2a53c1',
  }
});
  