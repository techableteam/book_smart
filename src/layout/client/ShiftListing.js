import React, { useState, useEffect, useRef } from 'react';
import { Modal, TextInput, View, Image, Animated, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme, } from 'react-native-paper';
import images from '../../assets/images';
import HButton from '../../components/Hbutton'
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import ImageButton from '../../components/ImageButton';
import { useAtom } from 'jotai';
import { firstNameAtom, lastNameAtom } from '../../context/ClinicalAuthProvider';
import { PostBid, Jobs } from '../../utils/useApi';
import { Dropdown } from 'react-native-element-dropdown';
import { useFocusEffect } from '@react-navigation/native';

const itemsPerPage = 100;

export default function ShiftListing ({ navigation }) {
  //---------------------------------------Animation of Background---------------------------------------
  const [backgroundColor, setBackgroundColor] = useState('#0000ff'); // Initial color
  let colorIndex = 0;
  const [isModal, setModal] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate a random color
      if(colorIndex >= 0.9) {
        colorIndex = 0;
      } else {
        colorIndex += 0.1;
      }

      const randomColor = colorIndex == 0 ? `#00000${Math.floor(colorIndex * 256).toString(16)}` : `#0000${Math.floor(colorIndex * 256).toString(16)}`;
      setBackgroundColor(randomColor);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastName] = useAtom(lastNameAtom);
  const handleNavigate = (navigateUrl) => {
    navigation.navigate(navigateUrl);
  };
  const [data, setData] = useState([]);
  const [userInfos, setUserInfo] = useState([]);
  const [detailedInfos, setDetailedInfo] = useState([]);
  const [filteredData, setFilteredData] = useState(userInfos);
  const [filteredDetailData, setFilteredDetailData] = useState(detailedInfos);
  const [totalPages, setTotalPages] = useState(1);
  const [pageItems, setPageItems] = useState([]);

  async function getData() {
    let Data = await Jobs('jobs', 'Clinician');
    if(!Data) {
      setData(['No Data'])
    } else {
      setData(Data);
      const transformedData = Data.map(item => [{
        title: 'Job-ID',
        content: item.jobId
      },{
        title: 'Job #',
        content: item.jobNum
      },{
        title: 'Title',
        content: item.degree
      },{
        title: 'Date',
        content: item.shiftDate
      },{
        title: 'Shift',
        content: item.shift
      },{
        title: 'Location',
        content: item.location
      },{
        title: 'Status',
        content: item.status
      }]);

      const detailedData = Data.map(item => [{
        title: 'Job-ID',
        content: item.jobId
      },{
        title: 'Job #',
        content: item.jobNum
      },{
        title: 'Caregiver',
        content: item.degree
      },{
        title: 'Pay Rate',
        content: item.payRate
      },{
        title: 'Job',
        content: item.jobInfo
      },{
        title: 'Status',
        content: item.status
      },{
        title: 'Shift',
        content: item.shift
      },{
        title: 'Date',
        content: item.shiftDate
      },{
        title: 'Location',
        content: item.location
      },{
        title: 'Bonus',
        content: item.bonus
      }]);
      
      setUserInfo(transformedData);
      setFilteredData(transformedData);
      setTotalPages(page);
      setDetailedInfo(detailedData);
      setFilteredDetailData(detailedData);
      const len = transformedData.length;
      const page = Math.ceil(len / itemsPerPage);
      const generatedPageArray = Array.from({ length: page}, (_, index) => ({
        label: `Page ${index+1}`,
        value: index + 1
      }));
      setPageItems(generatedPageArray);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );
  
  const toggleModal = () => {
    setModal(!isModal);
  }

  const [modalData, setModalData] = useState([]);
  const handleEdit = (id) => {
    console.log('handleEdit--->', id);
    console.log(detailedInfos[id])
    setModalData(filteredDetailData[id]);
    toggleModal()  
  };

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (id) => {
    const bidData = {jobId: id[0].content, message: content, caregiver: `${firstName} ${lastName}`}
    let response = await PostBid(bidData, 'bids');

    if (!response?.error) {
      Alert.alert(
        'Success!',
        response?.message,
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
      setContent('');
      handleBack();
    } else {
      Alert.alert(
        'Failed!',
        "",
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

  const handleBack = () => {
    setModal(!isModal)
  };

  //------------------------------------------Search Function----------------
  const [searchTerm, setSearchTem] = useState(''); // Search term
  const handleSearch = () => {
    if (searchTerm !== '') {
      const filtered = userInfos.filter(subArray => 
        subArray.some(item => item.content && item.content.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredData(filtered);
  
      const detailed = detailedInfos.filter(subArray => 
        subArray.some(item => item.content && item.content.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDetailData(detailed);
  
      const len = filtered.length;
      const page = Math.ceil(len / itemsPerPage);
      setTotalPages(page);
  
      const generatedPageArray = Array.from({ length: page }, (_, index) => ({
        label: `Page ${index + 1}`,
        value: index + 1,
      }));
      setPageItems(generatedPageArray);
    } else {
      setFilteredData(userInfos);
      setFilteredDetailData(detailedInfos);
  
      const len = userInfos.length; // use the length of the original data
      const page = Math.ceil(len / itemsPerPage);
      setTotalPages(page);
  
      const generatedPageArray = Array.from({ length: page }, (_, index) => ({
        label: `Page ${index + 1}`,
        value: index + 1,
      }));
      setPageItems(generatedPageArray);
    }
  };  

  //--------------------------------subPage setting-------------------------------
  const [isDegreeFocus, setIsDegreeFocus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageItemValue, setPageItemValue] = useState(null);
  const [isPageItemFocus, setIsPageItemFocus] = useState(false);

  const getItemsForPage = (page) => {
    const startIndex = (page-1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
    return filteredData.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const itemsToShow = getItemsForPage(currentPage);

  return (
      <View style={styles.container}>
        <StatusBar 
            translucent backgroundColor="transparent"
        />
        <MHeader navigation={navigation} />
        <SubNavbar navigation={navigation} name={'ClientSignIn'} />
        <ScrollView style={{width: '100%', marginTop: 155}}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topView}>
            <Animated.View style={[styles.backTitle, {backgroundColor}]}>
              <Text style={styles.title}>JOB / SHIFT LISTINGS</Text>
            </Animated.View>
            <View style={styles.bottomBar}/>
          </View>
          <Text style={styles.text}>View and Apply for Shifts below, once applied the Facility will be notified, and if <Text style={{fontWeight: 'bold'}}>&nbsp;"AWARDED"&nbsp;</Text> the shift will appear on your <Text style={{fontWeight: 'bold'}}>&nbsp;"MY SHIFTS TAB"&nbsp;</Text>.</Text>
          <View style={styles.imageButton}>
            <ImageButton title={"My Home"} onPress={() => handleNavigate('MyHome')} />
            <ImageButton title={"My Profile"} onPress={() => handleNavigate('EditProfile')} />
            <ImageButton title={"My Shifts"} onPress={() => handleNavigate('Shift')} />
            <ImageButton title={"My Reporting"} onPress={() => handleNavigate('Reporting')} />
          </View>
          <View style={styles.profile}>
            <View style={styles.profileTitleBg}>
              <Text style={styles.profileTitle}>🖥️ ALL AVAILABLE SHIFTS</Text>
            </View>
            <View style={styles.searchBar}>
              <TextInput
                style={[styles.searchText]}
                placeholder=""
                onChangeText={e => setSearchTem(e)}
                value={searchTerm || ''}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                <Text>Search</Text>
              </TouchableOpacity>
            </View>
            {
              filteredData.length>itemsPerPage ?
              <View>
                <Text style={styles.name}>Showing 1-{itemsPerPage} of {filteredData.length}</Text>
                <Dropdown
                  style={[styles.dropdown, isDegreeFocus && { borderColor: 'blue' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  itemTextStyle={styles.itemTextStyle}
                  iconStyle={styles.iconStyle}
                  data={pageItems}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={'Page 1'}
                  value={pageItemValue}
                  onFocus={() => setIsPageItemFocus(true)}
                  onBlur={() => setIsPageItemFocus(false)}
                  onChange={(item) => {
                    setPageItemValue(item.value)
                    handlePageChange(item.value);
                    setIsPageItemFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <View
                      style={styles.icon}
                      color={isPageItemFocus ? 'blue' : 'black'}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
              </View>
              :
              <></>
            }
            {itemsToShow.map((it, idx) =>
              <View key={idx} style={styles.subBar}>
                {it.map((item, index) => 
                  <View key={index} style={{flexDirection: 'row', width: '100%'}}>
                    <Text style={[styles.titles, item.title=="JOB-ID" ? {backgroundColor: "#00ffff"} : {}]}>{item.title}</Text>
                    <Text style={[
                      styles.content, 
                      item.title == "JOB-ID" || item.title == "Status" ? {fontWeight: 'bold'} : {}
                    ]}>{item.content}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.edit} onPress = {() => handleEdit(idx + (currentPage-1) * itemsPerPage)}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}> VIEW & APPLY</Text>
                </TouchableOpacity>
              </View>)
            }
          </View>
        </ScrollView>
        {isModal && <Modal
          Visible={false}
          transparent= {true}
          animationType="slide"
          onRequestClose={() => {
            setShowModal(!showModal);
          }}
        >
          <StatusBar translucent backgroundColor='transparent' />
          <ScrollView style={styles.modalsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.viewContainer}>
              <View style={styles.header}>
                <Text style={styles.headerText}>View Job / Shift Details</Text>
                <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleModal}>
                  <Image source = {images.close} style={{width: 20, height: 20,}}/>
                </TouchableOpacity>
              </View>
              <View style={styles.body}>
                <TouchableOpacity style={styles.backBtn} onPress = {handleBack}>
                  <Text style={[styles.profileTitle, {textAlign: 'center'}]}>Back to Job / Shift Listings {'>'}</Text>
                </TouchableOpacity>
                <View style={styles.modalBody}>
                  {modalData.map((item, index) => 
                    <View key={index} style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>{item.title}</Text>
                      <Text style={styles.content}>{item.content}</Text>
                    </View>
                  )}
                </View>
                {/* <View style={[styles.profileTitleBg, {marginTop: 20}]}>
                  <Text style={styles.profileTitle}>🖥️ SUBMIT INTEREST IN THIS SHIFT</Text>
                </View> */}
                <Text style={[styles.text, {color: 'blue', fontWeight: 'bold', marginTop: 20, textAlign: 'left'}]}>You will be notified via email if this shift is awarded to you!</Text>
                <View style={styles.msgBar}>
                  <Text style={[styles.subtitle, {textAlign: 'left', marginTop: 10, fontWeight: 'bold'}]}>ADD A BRIEF MESSAGE (optional)</Text>
                  <TextInput
                    style={[styles.inputs, { color: 'black' }]}
                    onChangeText={setContent}
                    value={content}
                    multiline={true}
                    textAlignVertical="top"
                    placeholder=""
                  />
                </View>
                <View style={[styles.btn, {marginTop: 20}]}>
                  <HButton style={styles.subBtn} onPress={()=> handleSubmit(modalData) }>
                    Submit
                  </HButton>
                </View>
              </View>
            </View>
          </ScrollView>
        </Modal>}
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
    width: '90%',
    height: '55',
    marginLeft: '5%',
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
  homepage: {
    // paddingHorizontal: 30,
    // paddingVertical: 70,
    marginLeft: '15%',
    width: 250,
    height: 200,
    marginTop: 30,
    marginBottom: 100
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
    marginBottom: 100
  },
  titles: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 30,
    width: '40%'
  },
  content: {
    fontSize: 16,
    lineHeight: 30,
  },
  profileTitleBg: {
    backgroundColor: '#BC222F',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    // width: '80%',
    marginRight: '10%',
    marginBottom: 20
  },
  profileTitle: {
    fontWeight: 'bold',
    color: 'white',
  },
  nurse: {
    width: 200,
    height: 200
  },
  name: {
    fontSize: 14,
    marginVertical: 10,
  },
  backBtn: {
    padding: 10,
    width: '70%',
    justifyContent: 'flex-start',
    borderColor: '#ffaa22',
    borderWidth: 2,
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: '#194f69'
  },
  edit: {
    backgroundColor: '#A020F0',
    padding: 5,
    borderRadius: 10,
    fontWeight: 'bold',
    color: 'white',
    width: '55%',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10
  },
  subBar: {
    width: '100%',
    backgroundColor: "#dcd6fa",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#c6c5c5",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalsContainer: {
    // flex: 1,
    // justifyContent: 'flex-start',
    paddingTop: 30,
    // alignItems: 'center',
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
  textModalInput: { 
    backgroundColor: 'white', 
    width: '60%', 
    height: 40, 
    marginBottom: 10, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)', 
    paddingLeft: 10, 
    marginRight: 0,
    color: 'black'
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
    fontSize: 18,
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
    height: 100,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'white'
  },
  btn: {flexDirection: 'column',
    gap: 20,
    marginBottom: 30,
  },
  subBtn: {
    marginTop: 0,
    padding: 10,
    backgroundColor: '#A020F0',
    color: 'white',
    fontSize: 16,
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
  searchText: {
    width: '70%',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    paddingVertical: 0,
    color: 'black'
  },
  searchBtn: {
    width: '30%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: '#2a53c1',
    height: 30,
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
});
  