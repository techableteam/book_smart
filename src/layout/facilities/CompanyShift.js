import React, { useState, useEffect, useMemo } from 'react';
import { Modal, TextInput, View, Animated, Image, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StarRating, { StarRatingDisplay } from 'react-native-star-rating-widget';
import RadioGroup from 'react-native-radio-buttons-group';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import { Dropdown } from 'react-native-element-dropdown';
import { Job, Jobs, RemoveJos, setAwarded, updateJobRatings, updateJobTSVerify } from '../../utils/useApi';
import { useFocusEffect } from '@react-navigation/native';
// Choose file
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs'
import AnimatedHeader from '../AnimatedHeader';

export default function CompanyShift({ navigation }) {
  const [totalPages, setTotalPages] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [value, setValue] = useState(100);
  const [isFocus, setIsFocus] = useState(false);
  const [isJobDetailModal, setIsJobDetailModal] = useState(false);
  const [isRatingModal, setIsRatingModal] = useState(false);
  const [isAwardJobModal, setIsAwardJobModal] = useState(false);
  const [isJobEditModal, setIsJobEditModal] = useState(false);
  const [isJobTSVerifyModal, setIsJobTSVerifyModal] = useState(false);
  const [curRatings, setCurRatings] = useState(0);
  const [curJobId, setCurJobId] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedBidder, setSelectedBidder] = useState([]);
  const [selectedBidders, setSelectedBidders] = useState([]);
  const [awardedStatus, setAwardedStatus] = useState(2);
  const [tsVerifyStatus, setTSVerifyStatus] = useState(2);
  const [fileType, setFiletype] = useState('');
  const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);
  const [timeSheetFile, setTimesheetFile] = useState({
    content: '',
    name: '',
    type: ''
  });

  const radioButtons = useMemo(() => ([
    {
      id: 1,
      label: 'Awarded',
      value: 1
    },
    {
      id: 2,
      label: 'Not Awarded',
      value: 2
    }
  ]), []);

  const TSradioButtons = useMemo(() => ([
    {
      id: 1,
      label: 'Yes',
      value: 1
    },
    {
      id: 2,
      label: 'No',
      value: 2
    }
  ]), []);

  const pageItems = [
    {label: '10 per page', value: '10'},
    {label: '25 per page', value: '25'},
    {label: '50 per page', value: '50'},
    {label: '100 per page', value: '100'},
    {label: '500 per page', value: '500'},
    {label: '1000 per page', value: '1000'},
  ]

  const tableHead = [
    'Degree/Discipline',
    'Entry Date',
    'Job ID',
    'Job #',
    'Location',
    'Date',
    'Shift',
    'View Shift/Bids',
    'Bids',
    'Job Status',
    'Hired',
    'Verify TS',
    'Rating',
    'Delete',
  ];

  const bidderTableHeader = [
    "Entry Date",
    "Caregiver",
    "Details",
    "Message From Applicant",
    "Bid Status",
    "Award Job",
    "",
    "",
    ""
  ];

  //---------------------------------------Animation of Background---------------------------------------
  const [backgroundColor, setBackgroundColor] = useState('#0000ff'); // Initial color
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
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const [data, setData] = useState([]);
  async function getData() {
    let result = await Jobs('jobs', 'Facilities');
    if(!result) {
      setData(['No Data'])
    } else {
      setData(result)
      setFilteredData(result);
    }
    result.unshift(tableHead);
    setTableData(result);
  }

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  const handleRemove = async (id) => {
    let results = await RemoveJos({ jobId: id }, 'jobs');
    if (!results?.error) {
      console.log('success');
      getData();
    } else {
      console.log('failure', results.error);
    }
  };

  const toggleRatingsModal = () => {
    setIsRatingModal(!isRatingModal);
  };

  const toggleJobDetailModal = () => {
    setIsJobDetailModal(!isJobDetailModal);
  };

  const toggleJobAwardModal = () => {
    setIsAwardJobModal(!isAwardJobModal);
  };

  const toggleJobEditModal = () => {
    setIsJobEditModal(!isJobEditModal);
  };

  const toggleJobTSVerifyModal = () => {
    setIsJobTSVerifyModal(!isJobTSVerifyModal);
  };

  const handleChangeRatings = async () => {
    let results = await updateJobRatings({ jobId: curJobId, rating: curRatings }, 'jobs');
    if (!results?.error) {
      console.log('success');
      setIsRatingModal(false);
      getData();
    } else {
      console.log('failure', results.error);
    }
  };

  const handleShowRatingModal = async (id, rating) => {
    setIsRatingModal(true);
    setCurRatings(rating);
    setCurJobId(id);
  };

  const handleShowJobDetailModal = async (id) => {
    let data = await Job({ jobId: id }, 'jobs');
    if(!data) {
      setSelectedJob(null);
      setSelectedBidders([]);
    } else {
      let biddersList = data.bidders;
      biddersList.unshift(bidderTableHeader);
      setSelectedJob(data.jobData);
      setSelectedBidders(biddersList);
      setIsJobDetailModal(true);
    }
  };

  const handleShowJobTSVerifyModal = async (id) => {
    console.log(id);
    let data = await Job({ jobId: id }, 'jobs');
    console.log(data);
    if(!data) {
      setCurJobId(id);
    } else {
      setCurJobId(id);
      setSelectedJob(data.jobData);
      setTSVerifyStatus(data.jobData.timeSheetVerified ? 1 : 2);
      setIsJobTSVerifyModal(true);
    }
  };

  const handleShowJobAwardModal = async (id) => {
    let bidder = [];
    selectedBidders.map((item, idx) => {
      if (item[6] === id) {
        bidder = item;
      }
    });

    if (bidder) {
      setIsJobDetailModal(false);
      setSelectedBidder(bidder);
      setAwardedStatus(bidder[4] === 'Awarded' ? 1 : 2);
      setIsAwardJobModal(true);
    } else {
      setSelectedBidder([]);
    }
  };

  const handleChangeAwardStatus = async (bidderId, jobId) => {
    const response = await setAwarded({ jobId: jobId, bidderId: bidderId, status: awardedStatus }, 'jobs');
    console.log(JSON.stringify(response));
    if (!response?.error) {
      console.log('success');
      getData();
      setIsAwardJobModal(false);
    } else {
      console.log('failure', response.error);
      Alert.alert('Failure!', 'Please retry again later', [
        {
          text: 'OK',
          onPress: () => {
            console.log('');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleChangeJobTSVerify = async () => {
    const response = await updateJobTSVerify({ jobId: curJobId, status: tsVerifyStatus, file: timeSheetFile }, 'jobs');
    
    if (!response?.error) {
      getData();
      Alert.alert('Success!', 'Verified!', [
        {
          text: 'OK',
          onPress: () => {
            console.log('');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      setIsJobTSVerifyModal(false);
    } else {
      console.log('failure', response.error);
      Alert.alert('Failure!', 'Please retry again later', [
        {
          text: 'OK',
          onPress: () => {
            console.log('');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleShowJobEditModal = async () => {
    console.log(selectedJob);
  };

  const toggleFileTypeSelectModal = () => {
    setFiletypeSelectModal(!fileTypeSelectModal);
  };
  
  const handleChangeFileType = (mode) => {
    setFiletype(mode);
    toggleFileTypeSelectModal();
  };

  const openCamera = async () => {
    const options = {
      mediaType: 'photo', // Use 'video' for video capture
      quality: 1, // 1 for high quality, 0 for low quality
    };
    try {
      launchCamera(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.error) {
          Alert.alert(
            'Alert!',
            'Camera error: ', response.error,
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('');
                },
              },
            ],
            { cancelable: false }
          );
          console.error('Camera error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else if (response.errorCode) {
          Alert.alert(
            'Alert!',
            'Camera errorCode: ', response.errorCode,
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('');
                },
              },
            ],
            { cancelable: false }
          );
          console.log('Camera error code: ', response.errorCode);
        } else {
          const fileUri = response.assets[0].uri;
          const fileContent = await RNFS.readFile(fileUri, 'base64');
          
          setTimesheetFile({
            content: fileContent,
            type: 'image',
            name: response.assets[0].fileName,
          });
          toggleFileTypeSelectModal();
        }
      });
    } catch (err) {
      Alert.alert(
        'Alert!',
        'Camera Issue: ' + JSON.stringify(err),
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('');
            },
          },
        ],
        { cancelable: false }
      );
    }
  };
  
  const pickGallery = async () => {
    const options = {
      mediaType: 'photo', // you can also use 'mixed' or 'video'
      quality: 1, // 0 (low) to 1 (high)
    };
  
    try {
      launchImageLibrary(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          Alert.alert(
            'Alert!',
            'ImagePicker Issue: ' + JSON.stringify(response.error),
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('');
                },
              },
            ],
            { cancelable: false }
          );
          console.log('ImagePicker Error: ', response.error);
        } else if (response.assets && response.assets.length > 0) {
          const pickedImage = response.assets[0].uri;
          const fileContent = await RNFS.readFile(pickedImage, 'base64');
          
          setTimesheetFile({
            content: fileContent,
            type: 'image',
            name: response.assets[0].fileName,
          });
          toggleFileTypeSelectModal();
        } else {
          Alert.alert(
            'Alert!',
            'ImagePicker Issue: ' + JSON.stringify(response),
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('');
                },
              },
            ],
            { cancelable: false }
          );
        }
      });
    } catch (err) {
      Alert.alert(
        'Alert!',
        'Camera Issue: ' + JSON.stringify(err),
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('');
            },
          },
        ],
        { cancelable: false }
      );
    }
  };
  
  const pickFile = async () => {
    try {
      let type = [DocumentPicker.types.images, DocumentPicker.types.pdf];
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
      
      setTimesheetFile({
        content: `data:${res[0].type};base64,${fileContent}`,
        type: res[0].type,
        name: res[0].name,
      });
      toggleFileTypeSelectModal();
    } catch (err) {
      Alert.alert(
        'Alert!',
        'DocumentPicker Issue: ' + JSON.stringify(err),
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('');
            },
          },
        ],
        { cancelable: false }
      );
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Handle other errors
      }
    }
  };

  //------------------------------------------Search Function----------------
  const [searchTerm, setSearchTem] = useState(''); // Search term
  const handleSearch = (e) => {
    setSearchTem(e);
    const Data = []
    if (data.length >1) {
      Data = data.shift(data[0]);
    } else {
      Data = data
    }
    
    const filtered = Data.filter(row => 
      row.some(cell => 
        cell && cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
    filtered.unshift(tableHead);
    setTableData(tableData);
  };

  //----------------------------change Current page--------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const getItemsForPage = (page) => {
    const startIndex = (page-1) * value;
    const endIndex = Math.min(startIndex + value, filteredData.length);
    return filteredData.slice(startIndex, endIndex);
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleShowFile = () => {
    navigation.navigate("FileViewer", { jobId: curJobId, fileData: '' });
  };

  const itemsToShow = getItemsForPage(currentPage);

  //------------------------------table Component---------------------------
  const widths = [150, 100, 80, 100, 150, 150, 150, 150, 80, 150, 150, 100, 150, 100];
  const RenderItem = ({ item, index }) => (
    <View
      key={index}
      style={{
        backgroundColor: index !== 0 ? 'white' : '#ccffff',
        flexDirection: 'row',
      }}
    >
      {widths.map((width, idx) => {
        if (idx === 7 && index > 0) {
          return (
            <View
              key={idx}
              style={[
                styles.tableItemStyle,
                { flex: 1, justifyContent: 'center', alignItems: 'center', width },
              ]}
            >
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
                  handleShowJobDetailModal(item[2]);
                }}
              >
                <Text style={styles.profileTitle}>View</Text>
              </TouchableOpacity>
            </View>
          );
        } else if (idx === 11 && index > 0) {
          return (
            <View
              key={idx}
              style={[
                styles.tableItemStyle,
                { flex: 1, justifyContent: 'center', alignItems: 'center', width },
              ]}
            >
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
                  handleShowJobTSVerifyModal(item[2]);
                }}
              >
                <Text style={styles.profileTitle}>View</Text>
              </TouchableOpacity>
            </View>
          );
        } else if (
          idx === 12 &&
          index > 0 &&
          item[9] !== 'Available' &&
          item[9] !== 'Awarded'
        ) {
          return (
            <View
              key={idx}
              style={[
                styles.tableItemStyle,
                { flex: 1, justifyContent: 'center', alignItems: 'center', width },
              ]}
            >
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
                  handleShowRatingModal(item[2], item[12]);
                }}
              >
                <Text style={styles.profileTitle}>Add / View</Text>
              </TouchableOpacity>
            </View>
          );
        } else if (idx === 13 && index > 0) {
          return (
            <View
              key={idx}
              style={[
                styles.tableItemStyle,
                { flex: 1, justifyContent: 'center', alignItems: 'center', width },
              ]}
            >
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
                        handleRemove(item[2]);
                      },
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
              >
                <Text style={styles.profileTitle}>Remove</Text>
              </TouchableOpacity>
            </View>
          );
        } else {
          return (
            <Text
              key={idx}
              style={[styles.tableItemStyle, { width }]}
              onPress={() => itemChange(item, idx)}
            >
              {item[idx]}
            </Text>
          );
        }
      })}
    </View>
  );  

  const bidderTableWidth = [150, 150, 140, 200, 150, 100];
  const RenderItem1 = ({ item, index }) => (
    <View
      key={index}
      style={{
        backgroundColor: index !== 0 ? 'white' : '#ccffff',
        flexDirection: 'row',
      }}
    >
      {bidderTableWidth.map((width, idx) => {
        if (idx === 2 && index > 0) {
          return (
            <View
              key={idx}
              style={[
                styles.tableItemStyle,
                { flex: 1, justifyContent: 'center', alignItems: 'center', width },
              ]}
            >
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
                  console.log(item[6]);
                  navigation.navigate("ClientProfile", {id: item[6]});
                }}
              >
                <Text style={styles.profileTitle}>View</Text>
              </TouchableOpacity>
            </View>
          );
        } else if (idx === 5 && index > 0) {
          return (
            <View
              key={idx}
              style={[
                styles.tableItemStyle,
                { flex: 1, justifyContent: 'center', alignItems: 'center', width },
              ]}
            >
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
                  handleShowJobAwardModal(item[6]);
                }}
              >
                <Text style={styles.profileTitle}>Click</Text>
              </TouchableOpacity>
            </View>
          );
        } else {
          return (
            <Text
              key={idx}
              style={[styles.tableItemStyle, { width }]}
            >
              {item[idx]}
            </Text>
          );
        }
      })}
    </View>
  );
  
  const TableComponent = () => (
    <View style={{ borderColor: '#AAAAAA', borderWidth: 1, marginBottom: 3 }}>
      {itemsToShow.map((item, index) => (
        <RenderItem key={index} item={item} index={index} />
      ))}
    </View>
  );

  const BidderTableComponent = () => (
    <View style={{ borderColor: '#AAAAAA', borderWidth: 1, marginBottom: 3 }}>
      {selectedBidders.map((item, index) => (
        <RenderItem1 key={index} item={item} index={index} />
      ))}
    </View>
  );

  const itemChange = (item, idx) => {

  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent backgroundColor="transparent"
      />
      <MHeader navigation={navigation} />
      <SubNavbar navigation={navigation} name={"FacilityLogin"} />
      <ScrollView style={{ width: '100%', marginTop: 157 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topView}>
          <AnimatedHeader title="COMPANY JOBS / SHIFTS" />
          <View style={styles.bottomBar} />
        </View>
        <View style={{ marginTop: 30, flexDirection: 'row', width: '90%', marginLeft: '5%', gap: 10 }}>
          <TouchableOpacity style={[styles.subBtn, {}]} onPress={() => navigation.navigate('AddJobShift')}>
            <View style={{ backgroundColor: 'white', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              <Text style={{ fontWeight: 'bold', color: '#194f69', textAlign: 'center', marginTop: 0 }}>+</Text>
            </View>
            <Text style={styles.profileTitle}>Add A New Job / Shift
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.subBtn, {}]} onPress={() => {
            navigation.navigate('FacilityProfile')
          }}>
            <Text style={styles.profileTitle}>🏚️ Facilities Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profile}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ backgroundColor: '#000080', color: 'white', paddingHorizontal: 5 }}>TOOL TIPS</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>When A New "Job / Shift" is added the status will appear as <Text style={{ backgroundColor: '#ffff99' }}>"AVAILABLE"</Text> & will appear on Caregivers Dashboard</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Caregivers can "Bid" or show interest on all "Job / Shifts" - Available</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Facilities can view all bids and award a shift to the nurse of choice, once awarded the Job / Shift will update to a stus of <Text style={{ backgroundColor: '#ccffff' }}>"AWARDED"</Text></Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Once the Caregiver has completed the "Job / Shift" and uploads there timesheet, the status will update to <Text style={{ backgroundColor: '#ccffcc' }}>"COMPLETED"</Text></Text>
          </View>
        </View>
        <View>
          <View style={styles.body}>
            <View style={styles.bottomBar} />
            <View style={styles.modalBody}>
              <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                <Text style={styles.profileTitle}>🖥️ FACILITY / SHIFT LISTINGS</Text>
              </View>
              <View style={[styles.searchBar, {width: '60%'}]}>
                <TextInput
                  style={[styles.searchText, {height: 30}]}
                  placeholder=""
                  onChangeText={e => handleSearch(e)}
                  value={searchTerm || ''}
                />
                <TouchableOpacity style={styles.searchBtn}>
                  <Text>Search</Text>
                </TouchableOpacity>
              </View>
              <View style= {{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
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
                    const len = tableData.length;
                    const page = Math.ceil(len / item.value);
                    setTotalPages(page);
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
              { totalPages> 1 &&
                <View style={{display: 'flex', flexDirection: 'row', height: 30, marginBottom: 10, alignItems: 'center'}}>
                  <Text onPress={handlePrevPage} style={{width: 20}}>{currentPage>1 ? "<": " "}</Text>
                  <Text style={{width: 20}}>{" "+currentPage+" "}</Text>
                  <Text onPress={handleNextPage} style={{width: 20}}>{currentPage<totalPages ? ">" : " "}</Text>
                </View>
              }
              <ScrollView horizontal={true} style={{marginBottom: 30, width: '95%'}}>
                <TableComponent style={{width: '95%'}} data={itemsToShow} />
              </ScrollView>
            </View>
          </View>
        </View>
        <Modal
          visible={isRatingModal}
          transparent= {true}
          animationType="slide"
          onRequestClose={() => {
            setIsRatingModal(!isRatingModal);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.calendarContainer}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Add / View Rating</Text>
                <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleRatingsModal}>
                  <Image source = {images.close} style={{width: 20, height: 20}}/>
                </TouchableOpacity>
              </View>
              <View style={styles.body}>
                <View style={[styles.modalBody, { alignItems: 'center', padding: 0, paddingVertical: 10 }]}>
                  <StarRating
                    rating={curRatings}
                    onChange={setCurRatings}
                    maxStars={5}
                    enableHalfStar={false}
                  />
                  <TouchableOpacity style={styles.button} onPress={handleChangeRatings} underlayColor="#0056b3">
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={isJobDetailModal}
          transparent= {true}
          animationType="slide"
          onRequestClose={() => {
            setIsJobDetailModal(!isJobDetailModal);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.calendarContainer, { height: '80%' }]}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Facility View Job Details</Text>
                <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleJobDetailModal}>
                  <Image source = {images.close} style={{width: 20, height: 20}}/>
                </TouchableOpacity>
              </View>
              <View style={styles.body}>
                <ScrollView>
                  <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Entry Date</Text>
                      <Text style={styles.content}>{selectedJob?.entryDate}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job-ID</Text>
                      <Text style={styles.content}>{selectedJob?.jobId}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job #</Text>
                      <Text style={styles.content}>{selectedJob?.jobNum}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Nurse</Text>
                      <Text style={styles.content}>{selectedJob?.nurse}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Bids / Offers</Text>
                      <Text style={styles.content}>{selectedJob?.bid_offer}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Nurse Req.</Text>
                      <Text style={styles.content}>{selectedJob?.degree}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Shift Time</Text>
                      <Text style={styles.content}>{selectedJob?.shiftTime}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Date</Text>
                      <Text style={styles.content}>{selectedJob?.shiftDate}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Pay Rate</Text>
                      <Text style={styles.content}>{selectedJob?.payRate}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job Status</Text>
                      <Text style={styles.content}>{selectedJob?.jobStatus}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Timesheet Upload</Text>
                      <Text style={[styles.content, { color: 'blue' }]} onPress={() => { handleShowFile(); }}>{selectedJob?.timeSheet?.name}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job Rating</Text>
                      <Text style={styles.content}>
                        <StarRatingDisplay
                          rating={selectedJob?.jobRating}
                          maxStars={5}
                          starSize={25}
                        />
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Location</Text>
                      <Text style={styles.content}>{selectedJob?.location}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%'}}>
                      <TouchableOpacity style={[styles.button, { marginTop: 10, paddingHorizontal: 20 }]} onPress={handleShowJobEditModal} underlayColor="#0056b3">
                        <Text style={[styles.buttonText, { fontSize: 12 }]}>Edit Job / Shift</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%'}}>
                      <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                        <Text style={[styles.profileTitle, { fontSize: 12 }]}>ALL BIDS / OFFERS FOR SHIFT</Text>
                      </View>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', paddingRight: '5%'}}>
                      <ScrollView horizontal={true} style={{width: '100%'}}>
                        <BidderTableComponent />
                      </ScrollView>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={isAwardJobModal}
          transparent= {true}
          animationType="slide"
          onRequestClose={() => {
            setIsAwardJobModal(!isAwardJobModal);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.calendarContainer, { height: '80%' }]}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Award Job To Applicant</Text>
                <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleJobAwardModal}>
                  <Image source = {images.close} style={{width: 20, height: 20}}/>
                </TouchableOpacity>
              </View>
              <View style={styles.body}>
                <ScrollView>
                  <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job #</Text>
                      <Text style={styles.content}>{selectedJob?.jobNum || ''}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Message From Applicant</Text>
                      <Text style={styles.content}>{selectedBidder[3] || ''}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job</Text>
                      <Text style={styles.content}>{selectedJob?.jobId || ''}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Applicant</Text>
                      <Text style={styles.content}>{selectedBidder[1] || ''}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Phone</Text>
                      <Text style={styles.content}>{selectedBidder[8] || ''}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Email</Text>
                      <Text style={styles.content}>{selectedBidder[7] || ''}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Date</Text>
                      <Text style={styles.content}>{selectedJob?.shiftTime || ''}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Time</Text>
                      <Text style={styles.content}>{selectedJob?.shiftDate || ''}</Text>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%'}}>
                      <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30, backgroundColor: 'green' }]}>
                        <Text style={[styles.profileTitle, { fontSize: 12 }]}>🖥️"CLICK "AWARDED"</Text>
                      </View>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%'}}>
                      <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
                      <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>This will award the job to the applicant, and change the status of the JOB to "AWARDED" on your "Job Listings Tab"</Text>
                    </View>
                    <View style={{flexDirection: 'column', width: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
                      <View>
                        <Text style={{ fontWeight: 'bold', marginTop: 20, fontSize: 14 }}>Bid Status</Text>
                      </View>
                      <View style={{ color: 'black' }}>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={setAwardedStatus}
                          selectedId={awardedStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', width: '100%'}}>
                    <TouchableOpacity
                      style={[styles.button, { marginTop: 10, paddingHorizontal: 20 }]}
                      onPress={() => handleChangeAwardStatus(selectedBidder[6], selectedJob?.jobId)} underlayColor="#0056b3"
                    >
                      <Text style={[styles.buttonText, { fontSize: 12 }]}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={isJobTSVerifyModal}
          transparent= {true}
          animationType="slide"
          onRequestClose={() => {
            setIsJobTSVerifyModal(!isJobTSVerifyModal);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.calendarContainer, { height: '80%' }]}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Verify Timesheet</Text>
                <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleJobTSVerifyModal}>
                  <Image source = {images.close} style={{width: 20, height: 20}}/>
                </TouchableOpacity>
              </View>
              <View style={styles.body}>
                <ScrollView>
                  <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                    <View style={{flexDirection: 'column', width: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
                      <View>
                        <Text style={{ fontWeight: 'bold', marginTop: 20, fontSize: 14 }}>Timesheet Verified?</Text>
                      </View>
                      <View style={{ color: 'black' }}>
                        <RadioGroup 
                          radioButtons={TSradioButtons} 
                          onPress={setTSVerifyStatus}
                          selectedId={tsVerifyStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>
                    </View>
                    <View>
                      <Text style={{ fontWeight: 'bold', marginTop: 20, fontSize: 14, marginBottom: 5 }}>Timesheet Upload</Text>
                    </View>
                    {selectedJob?.timeSheet?.name && 
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile(); }}>{selectedJob?.timeSheet?.name}</Text>
                        <Text style={{color: 'blue'}}>&nbsp;&nbsp;remove</Text>
                      </View>
                    }
                    <View style={{flexDirection: 'row', width: '100%'}}>
                      <TouchableOpacity title="Select File" onPress={toggleFileTypeSelectModal} style={styles.chooseFile}>
                        <Text style={{fontWeight: '400', padding: 0, fontSize: 14, color: 'black'}}>Choose File</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.input, { width: '60%', color: 'black' }]}
                        placeholder={timeSheetFile?.name}
                        autoCorrect={false}
                        autoCapitalize="none"
                        value={timeSheetFile?.name}
                      />
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', width: '100%'}}>
                    <TouchableOpacity
                      style={[styles.button, { marginTop: 10, paddingHorizontal: 20 }]}
                      onPress={() => handleChangeJobTSVerify()}
                      underlayColor="#0056b3"
                    >
                      <Text style={[styles.buttonText, { fontSize: 12 }]}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={isJobEditModal}
          transparent= {true}
          animationType="slide"
          onRequestClose={() => {
            setIsJobEditModal(!isJobEditModal);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.calendarContainer, { height: '80%' }]}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Facility Edit Job</Text>
                <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleJobEditModal}>
                  <Image source = {images.close} style={{width: 20, height: 20}}/>
                </TouchableOpacity>
              </View>
              <View style={styles.body}>
                <ScrollView>
                  <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                    
                  </View>
                  <View style={{flexDirection: 'row', width: '100%'}}>
                    <TouchableOpacity
                      style={[styles.button, { marginTop: 10, paddingHorizontal: 20 }]}
                      onPress={() => handleChangeAwardStatus(selectedBidder[6], selectedJob?.jobId)} underlayColor="#0056b3"
                    >
                      <Text style={[styles.buttonText, { fontSize: 12 }]}>Submit</Text>
                    </TouchableOpacity>
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
                <View style={[styles.header, { height: 100 }]}>
                  <Text style={styles.headerText}>Choose File</Text>
                  <TouchableOpacity style={{ width: 20, height: 20 }} onPress={toggleFileTypeSelectModal}>
                    <Image source={images.close} style={{ width: 20, height: 20 }} />
                  </TouchableOpacity>
                </View>
                <View style={{  marginTop: 10, paddingHorizontal: 20, marginBottom: 20 }}>
                  <View style={{ backgroundColor: '#e3f2f1', borderRadius: 10, borderColor: '#c6c5c5', borderWidth: 2, paddingHorizontal: 20, paddingVertical: 20 }}>
                    <View style={styles.cameraContain}>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={() => {handleChangeFileType('photo'); openCamera();}}>
                        <Image source={images.camera} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={() => {handleChangeFileType('gallery'); pickGallery();}}>
                        <Image source={images.gallery} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={() => {handleChangeFileType('library'); pickFile();}}>
                        <Image source={images.folder} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Folder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </Modal>
        )}
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
  input: {
    backgroundColor: 'white', 
    height: 30, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
    paddingVertical: 5
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
  titles: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 30,
    width: '35%'
  },
  content: {
    fontSize: 16,
    lineHeight: 30,
    width: '60%'
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
    backgroundColor: 'rgba(79, 44, 73, 0.19)',
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
    marginBottom: 10,
  },
  searchText: {
    width: '70%',
    backgroundColor: 'white',
    height: 30,
  },
  searchBtn: {
    width: '30%',
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
    textAlign: 'center'
  },
  tableItemStyle: { 
    borderColor: '#AAAAAA', 
    borderWidth: 1, 
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 40
  },
  dropdown: {
    height: 40,
    width: '60%',
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
  button: {
    backgroundColor: '#A020F0',
    padding: 10,
    marginTop: 30,  
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  cameraContain: {
		flex: 1,
		alignItems: 'flex-start',
		justifyContent: 'center',
		flexDirection: 'row'
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
  textStyle: {
    color: 'black'
  }
});
