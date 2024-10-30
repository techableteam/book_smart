import React, { useState, useEffect, useMemo } from 'react';
import { Alert, Modal, TextInput, View, Image, StyleSheet, Dimensions, ScrollView, StatusBar, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Text } from 'react-native-paper';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import { Table } from 'react-native-table-component';
import RadioGroup from 'react-native-radio-buttons-group';
import { Update, updatePassword, getUserProfile, getUserInfo, updateUserStatus, allCaregivers, getDegreeList } from '../../utils/useApi';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import { Dropdown } from 'react-native-element-dropdown';
import AHeader from '../../components/Aheader';
// Choose file
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs'
import Loader from '../Loader';
import AnimatedHeader from '../AnimatedHeader';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function AllCaregivers({ navigation }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [appliedList, setAppliedList] = useState([]);
  const [awardedList, setAwardedList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tmpPassword, setTmpPassword] = useState('');
  const [userProfileModal, setUserProfileModal] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [resetPWModal, setResetPWModal] = useState(false);
  const [updateStatusModal, setUpdateStatusModal] = useState(false);
  const [data, setData] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isStatusFocus, setStatusIsFocus] = useState(false);
  const [userStatus, setUserStatus] = useState('inactivate');
  const [sfileType, setFiletype] = useState('');
  const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);
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
  const [degrees, setDegress] = useState([]);
  const [pageList, setPageList] = useState([
    {label: 'Page 1', value: 1}
  ]);
  const widths = [150, 200, 200, 180, 300, 200, 150, 150, 100, 150, 100, 120];
  const [credentials, setCredentials] = useState({
    email: '',
    driverLicense: {
      type: '',
      content: '',
      name: ''
    },
    driverLicenseStatus: 0,
    socialCard: {
      type: '',
      content: '',
      name: ''
    },
    socialCardStatus: 0,
    physicalExam: {
      type: '',
      content: '',
      name: ''
    },
    physicalExamStatus: 0,
    ppd: {
      type: '',
      content: '',
      name: ''
    },
    ppdStatus: 0,
    mmr: {
      type: '',
      content: '',
      name: ''
    },
    mmrStatus: 0,
    healthcareLicense: {
      type: '',
      content: '',
      name: ''
    },
    healthcareLicenseStatus: 0,
    resume: {
      type: '',
      content: '',
      name: ''
    },
    resumeStatus: 0,
    covidCard: {
      type: '',
      content: '',
      name: ''
    },
    covidCardStatus: 0,
    bls: {
      type: '',
      content: '',
      name: ''
    },
    blsStatus: 0,
    hepB: {
      type: '',
      content: '',
      name: ''
    },
    hepBStatus: 0,
    flu: {
      type: '',
      content: '',
      name: ''
    },
    fluStatus: 0,
    cna: {
      type: '',
      content: '',
      name: ''
    },
    cnaStatus: 0,
    taxForm: {
      type: '',
      content: '',
      name: ''
    },
    taxFormStatus: 0,
    chrc102: {
      type: '',
      content: '',
      name: ''
    },
    chrc102Status: 0,
    chrc103: {
      type: '',
      content: '',
      name: ''
    },
    chrc103Status: 0,
    drug: {
      type: '',
      content: '',
      name: ''
    },
    drugStatus: 0,
    ssc: {
      type: '',
      content: '',
      name: ''
    },
    sscStatus: 0,
    copyOfTB: {
      type: '',
      content: '',
      name: ''
    },
    copyOfTBStatus: 0,
    userStatus: 'pending approval'
  })
  const radioButtons = useMemo(() => ([
    {
      id: 1,
      label: 'Yes',
      value: true
    },
    {
      id: 0,
      label: 'No',
      value: false
    }
  ]), []);
  const tableHead = [
    'Entry Date',
    'Name',
    'Phone',
    'Degree/Discipline',
    'Email',
    'View Shifts / Profile',
    'Verification',
    '✏️ User Status',
    'Awarded',
    'Applied for',
    'Ratio',
    'P.W.'
  ];
  const statusList = [
    {label: 'activate', value: 'activate'},
    {label: 'inactivate', value: 'inactivate'},
    {label: 'pending approval', value: 'pending approval'},
  ];
  const paymentList = [
    { label: 'Zelle', value: 'Zelle' },
    { label: 'ACH', value: 'ACH' },
  ];
  const logicItems = [
    {label: 'and', value: 'and'},
    {label: 'or', value: 'or'}
  ];
  const fieldsItems = [
    { label: 'Entry Date', value: 'Entry Date'},
    { label: 'Name', value: 'Name'},
    { label: 'Phone', value: 'Phone'},
    { label: 'Degree/Discipline', value: 'Degree/Discipline'},
    { label: 'Email', value: 'Email'},
    { label: 'User Status', value: 'User Status'},
    { label: 'Total Awarded', value: 'Total Awarded'},
    { label: 'Total Bids / Offers', value: 'Total Bids / Offers'},
    { label: 'Bid to Award Ratio', value: 'Bid to Award Ratio'},
    { label: 'Payment', value: 'Payment'},
  ];
  const fieldConditions = {
    'Entry Date': [
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
    'Phone': [
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'starts with', value: 'starts with' },
      { label: 'ends with', value: 'ends with' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Degree/Discipline': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
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
    'User Status': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Total Awarded': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'higher than', value: 'higher than' },
      { label: 'lower than', value: 'lower than' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Total Bids / Offers': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'higher than', value: 'higher than' },
      { label: 'lower than', value: 'lower than' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Bid to Award Ratio': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'higher than', value: 'higher than' },
      { label: 'lower than', value: 'lower than' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Payment': [
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
      setConditionItems(fieldConditions[value]);

      if (value === 'Degree/Discipline' || value === 'User Status' || value === 'Payment') {
        newFilters[index]['valueType'] = 'select';
        if (value === 'Degree/Discipline') {
          setValueOption(degrees);
        } else if (value === 'User Status') {
          setValueOption(statusList);
        } else if (value === 'Payment') {
          setValueOption(paymentList);
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
        if (newFilters[index]['field'] === 'Degree/Discipline' || newFilters[index]['field'] === 'User Status' || newFilters[index]['field'] === 'Payment') {
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

  const addFilter = () => {
    setFilters([...filters, { logic: 'and', field: 'Name', condition: 'contains', value: '', valueType: 'text' }]);
  };

  const handleCredentials = (target, e) => {
    setCredentials({...credentials, [target]: e});
  };

  function formatData(data) {
    return data.map(item => {
        const date = new Date(item[0]);
        const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
        const fullName = `${item[1]} ${item[2]}`;
        return [formattedDate, fullName, item[3], item[4], item[5], item[6], item[7], item[8], item[9], item[10], item[11], item[12], item[13]];
    });
  };

  const formatDate = (origin) => {
    const date = new Date(origin);
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    return formattedDate;
  };

  const getData = async (requestData = { search: search, page: curPage, filters: filters }, isFilter = isSubmitted ) => {
    // if (!isFilter) {
    //   requestData.filters = [];
    // }
    setLoading(true);
    let result = await allCaregivers(requestData, 'clinical');
    if(!result) {
      setData(['No Data'])
    } else {
      console.log(result);
      const modifiedData = formatData(result.dataArray);
      let pageContent = [];
      for (let i = 1; i <= result.totalPageCnt; i++) {
        pageContent.push({ label: 'Page ' + i, value: i });
      }
      setPageList(pageContent);
      setData(modifiedData)
    }
    setLoading(false);
  };

  const getDegree = async () => {
    const response = await getDegreeList('degree');
    if (!response?.error) {
      let tempArr = [];
      response.data.map(item => {
        tempArr.push({ label: item.degreeName, value: item.degreeName });
      });
      tempArr.unshift({ label: 'Select...', value: 'Select...' });
      setDegress(tempArr);
    } else {
      setDegress([]);
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

  const toggleAddFilterModal = () => {
    setAddFilterModal(!addfilterModal)
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     getData();
  //     // getDegree();
  //   }, [])
  // );

  useEffect(() => {
    getData();
  }, []);

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

    let response = await updatePassword({ userId: selectedUserId, userRole: 'Clinician', password, tmpPassword }, 'admin');
    getData();
    toggleRestPWModal();
  };

  const handleSubmitVerification = async () => {
    toggleVerificationModal();
    setLoading(true);
    let data = await Update(credentials, 'clinical');
    if (!data?.error) {
      setLoading(false);
      getData();
    } else {
      setLoading(false);
      Alert.alert(
        'Warning!',
        "Please try again later.",
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

  const handleUpdateStatus = async () => {
    let response = await updateUserStatus({ userId: selectedUserId, status: userStatus }, 'clinical');

    if (!response?.error) {
      getData();
      toggleUpdateStatusModal();
      Alert.alert(
        'Success!',
        "Successfully Updated",
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
    } else {
      Alert.alert(
        'Warning!',
        "Please try again later.",
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

  const toggleRestPWModal = () => {
    setResetPWModal(!resetPWModal);
  };

  const toggleUserProfileModal = () => {
    setUserProfileModal(!userProfileModal);
  };

  const toggleVerificationModal = () => {
    setVerificationModal(!verificationModal);
  };

  const toggleUpdateStatusModal = () => {
    setUpdateStatusModal(!updateStatusModal);
  };

  const handleShowUserInfoModal = async (userId) => {
    setLoading(true);
    let response = await getUserInfo({ userId: userId }, 'clinical');

    if (!response?.error) {
      setSelectedUser(response.userData);
      const updatedCredentials = { ...credentials };
      Object.keys(updatedCredentials).forEach((key) => {
        if (response.userData[key]) {
          if (typeof updatedCredentials[key] === 'object') {
            updatedCredentials[key] = { ...updatedCredentials[key], ...response.userData[key] };
          } else {
            updatedCredentials[key] = response.userData[key] == true ? 1 : 0;
          }
        }
      });
      updatedCredentials.userStatus = response.userData.userStatus;
      updatedCredentials.email = response.userData.email;
      setCredentials(updatedCredentials);
      console.log(updatedCredentials);
      toggleVerificationModal();
      setLoading(false);
    } else {
      setLoading(false);
      setSelectedUser(null);
    }
  };

  const handleShowProfileModal = async ( userId ) => {
    setLoading(true);
    let response = await getUserProfile({ userId: userId }, 'clinical');
    console.log(response);
    if (!response?.error) {
      let appliedData = response.appliedList;
      let awardedData = response.awardedList;

      if (appliedData.length > 0) {
        appliedData.unshift(appliedTableHeader);
        setAppliedList(appliedData);
      } else {
        setAppliedList([]);
      }

      if (awardedData.length > 0) {
        awardedData.unshift(awardedTableHeader);
        setAwardedList(awardedData);
      } else {
        setAwardedList([]);
      }
      setSelectedUser(response.userData);

      setLoading(false);
      toggleUserProfileModal();
    } else {
      setSelectedUser(null);
      setAppliedList([]);
      setAwardedList([]);
    }
    setLoading(false);
  };

  const appliedTableHeaderWidth = [150, 150, 140, 400];
  const appliedTableHeader = ['Bid-ID', 'Entry Date', 'Job', 'Message From Applicant'];
  const RenderItem = ({ item, index }) => (
    <View
      key={index}
      style={{
        backgroundColor: index == 0 ? '#ccffff' : '#fff',
        flexDirection: 'row',
      }}
    >
      {appliedTableHeaderWidth.map((width, idx) => {
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

  const awardedTableHeaderWidth = [150, 150, 250, 150];
  const awardedTableHeader = ['Job-ID', 'Entry Date', 'Facility', 'Job Status'];
  const RenderItem1 = ({ item, index }) => (
    <View
      key={index}
      style={{
        backgroundColor: index == 0 ? '#ccffff' : '#fff',
        flexDirection: 'row',
      }}
    >
      {awardedTableHeaderWidth.map((width, idx) => {
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
  
  const AppliedListTable = () => (
    <View style={{ borderColor: '#AAAAAA', borderWidth: 1, marginBottom: 3 }}>
      {appliedList.map((item, index) => {
        if (appliedList.length > 0) {
          return (<RenderItem key={index} item={item} index={index} />);
        } else {
          return (<></>);
        }
      })}
    </View>
  );

  const AwardedListTable = () => (
    <View style={{ borderColor: '#AAAAAA', borderWidth: 1, marginBottom: 3 }}>
      {awardedList.map((item, index) => {
        if (awardedList.length > 0) {
          return (<RenderItem1 key={index} item={item} index={index} />);
        } else {
          return (<></>);
        }
      })}
    </View>
  );

  const handleCellClick = (userData) => {
    setUserStatus(userData[7]);
    setUpdateStatusModal(true);
  };

  const handleRemove = (name) => {
    handleCredentials(name, {
      content: '',
      name: '',
      type: ''
    });
  };

  // File Manager
  const toggleFileTypeSelectModal = () => {
    setFiletypeSelectModal(!fileTypeSelectModal);
  };

  const handleChangeFileType = (name) => {
    setFiletype(name);
    toggleFileTypeSelectModal();
    toggleVerificationModal();
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
          
          handleCredentials(sfileType, {
            content: fileContent,
            type: 'image',
            name: response.assets[0].fileName,
          });
          toggleFileTypeSelectModal();
          toggleVerificationModal();
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
          
          handleCredentials(sfileType, {
            content: fileContent,
            type: 'image',
            name: response.assets[0].fileName,
          });
          toggleFileTypeSelectModal();
          toggleVerificationModal();
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
      handleCredentials(sfileType, { content: `${fileContent}`, type: fileType, name: res[0].name });
      toggleFileTypeSelectModal();
      toggleVerificationModal();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Handle other errors
      }
    }
  };

  const handleShowFile = (data) => {
    toggleVerificationModal();
    navigation.navigate("UserFileViewer", { userId: selectedUserId, filename: data });
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
      <StatusBar
        translucent backgroundColor="transparent"
      />
      <AHeader navigation={navigation}  currentPage={4} />
      <SubNavbar navigation={navigation} name={"AdminLogin"}/>
      <ScrollView style={{ width: '100%', marginTop: height * 0.25 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topView}>
          <AnimatedHeader title="ALL PLATFORM CAREGIVERS" />
          <View style={styles.bottomBar} />
        </View>
        <View style={{ marginTop: 30, flexDirection: 'row', width: '90%', marginLeft: '5%', gap: 10 }}>
        </View>
        <View style={styles.profile}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ backgroundColor: '#000080', color: 'white', paddingHorizontal: 5 }}>TOOL TIPS</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>When A New <Text style={{fontWeight: 'bold'}}>"CAREGIVER"</Text> signs-up, they will have a status of <Text style={{ color: '#0000ff', fontWeight: 'bold' }}>"PENDING APPROVAL"</Text></Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>Once you have verified the <Text style={{fontWeight: 'bold'}}>CAREGIVER</Text> information, update the status to <Text style={{ color: '#008000', fontWeight: 'bold' }}>"ACTIVE"</Text>.</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>The CAREGIVER will receive an Approval email, and can then login to view Jobs / Shifts</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
            <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>To Deactivate a <Text style={{fontWeight: 'bold'}}>"CAREGIVER"</Text> change the status to <Text style={{ color: '#ff0000', fontWeight: 'bold' }}>"INACTIVE"</Text></Text>
          </View>
        </View>
        <View>
          <View style={styles.body}>
            <View style={styles.modalBody}>
              <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                  <Text style={styles.profileTitle}>ALL CAREGIVERS</Text>
                </View>
              </View>
              {/* <View style={styles.searchBar}>
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
              </View> */}
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
                        if (cellData === 'view_shift') {
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
                                  console.log('user => ', rowData[12]);
                                  setSelectedUserId(rowData[12]);
                                  handleShowProfileModal(rowData[12]);
                                }}
                              >
                                <Text style={styles.profileTitle}>View Here</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else if (cellData === 'verification') {
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
                                  console.log('user =>', rowData[12]);
                                  setSelectedUserId(rowData[12]);
                                  handleShowUserInfoModal(rowData[12]);
                                }}
                              >
                                <Text style={styles.profileTitle}>View Here</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else if (cellData === 'pw') {
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
                                  console.log('user > ', rowData[12]);
                                  setSelectedUserId(rowData[12]);
                                  toggleRestPWModal();
                                }}
                              >
                                <Text style={styles.profileTitle}>Reset</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } else if (cellIndex >= tableHead.length) {
                          return (<View key={cellIndex}></View>);
                        } else {
                          if (cellIndex == 2 || cellIndex == 4) {
                            return (
                              <View key={cellIndex} style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2', width: widths[cellIndex]}]}>
                                <Text style={[styles.tableText, {borderWidth: 0, color: 'blue' }]}>{cellData}</Text>
                              </View>
                            );
                          } else if (cellIndex == 7) {
                            return (
                              <TouchableWithoutFeedback key={cellIndex} onPress={() => { setSelectedUserId(rowData[12]); handleCellClick(rowData); }}>
                                <View style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2', width: widths[cellIndex]}]}>
                                  <Text style={[styles.tableText, {borderWidth: 0}]}>{cellData}</Text>
                                </View>
                              </TouchableWithoutFeedback>
                            );
                          } else {
                            return (
                              <View key={cellIndex} style={[{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', padding: 10, backgroundColor: '#E2E2E2', width: widths[cellIndex]}]}>
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
            visible={updateStatusModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setUpdateStatusModal(!updateStatusModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Update Status</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleUpdateStatusModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={[styles.body, { marginBottom: 0 }]}>
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
                      value={userStatus}
                      onFocus={() => setStatusIsFocus(true)}
                      onBlur={() => setStatusIsFocus(false)}
                      onChange={item => {
                        setUserStatus(item.value);
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
                    <TouchableOpacity style={styles.button} onPress={handleUpdateStatus} underlayColor="#0056b3">
                      <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
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
                <View style={[styles.body, { marginBottom: 0 }]}>
                  <View style={styles.modalBody}>
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
                  <Text style={styles.headerText}>Facility View Job Details</Text>
                  <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleUserProfileModal}>
                    <Image source = {images.close} style={{width: 20, height: 20}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <ScrollView>
                    <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                      <View style={{flexDirection: 'row',  width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <View style={styles.profileTitleBg}>
                          <Text style={[styles.profileTitle, { fontSize: RFValue(12) }]}>🖥️ CAREGIVER PROFILE</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        {/* {selectedUser?.photoImage?.name != "" ? (<Image
                          resizeMode="cover"
                          style={styles.nurse}
                          source={{uri: 'data:image/jpeg;base64,' + selectedUser?.photoImage?.content}}
                        />) : (
                          <Image
                            resizeMode="cover"
                            style={styles.nurse}
                            source={images.profile}
                          />
                        )} */}
                        <Image
                            resizeMode="cover"
                            style={styles.nurse}
                            source={images.profile}
                          />
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Entry Date</Text>
                        <Text style={styles.content}>{formatDate(selectedUser?.entryDate)}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#F7F70059', marginBottom: 5, paddingLeft: 2}]}>Name</Text>
                        <Text style={styles.content}>{selectedUser?.firstName} {selectedUser?.lastName}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Email</Text>
                        <Text style={[styles.content, { color: 'blue' }]}>{selectedUser?.email}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Phone</Text>
                        <Text style={styles.content}>{selectedUser?.phoneNumber}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Degree/Discipline</Text>
                        <Text style={styles.content}>{selectedUser?.title}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Total Bids / Offers</Text>
                        <Text style={styles.content}>{selectedUser?.appliedCnt}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Total Awarded</Text>
                        <Text style={styles.content}>{selectedUser?.awardedCnt}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Bid to Award Ratio</Text>
                        <Text style={styles.content}>{selectedUser?.ratio}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Nurse Aver. Job Rating</Text>
                        <Text style={styles.content}>
                          <StarRatingDisplay
                            rating={selectedUser?.avgJobRating}
                            maxStars={5}
                            starSize={25}
                          />
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Bnak Name</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Routing Number</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Account Number</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Bank Account Type</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row',  width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: RFValue(12) }]}>🖥️ SHIFTS APPLIED FOR</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', paddingRight: '5%'}}>
                        <ScrollView horizontal={true} style={{width: '100%'}}>
                          {appliedList.length > 0 ? <AppliedListTable /> : <Text>No applied items available</Text>}
                        </ScrollView>
                      </View>
                      <View style={{flexDirection: 'row',  width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: RFValue(12) }]}>🖥️ SHIFTS AWARDED</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', paddingRight: '5%'}}>
                        <ScrollView horizontal={true} style={{width: '100%'}}>
                        {awardedList.length > 0 ? <AwardedListTable /> : <Text>No awarded items available</Text>}
                        </ScrollView>
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={verificationModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setVerificationModal(!verificationModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.calendarContainer, { height: '80%' }]}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Caregiver Verification</Text>
                  <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleVerificationModal}>
                    <Image source = {images.close} style={{width: 20, height: 20}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <ScrollView>
                    <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                      <View style={{flexDirection: 'row',  width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <View style={styles.profileTitleBg}>
                          <Text style={[styles.profileTitle, { fontSize: RFValue(12) }]}>🖥️ CAREGIVER PROFILE</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Name</Text>
                        <Text style={styles.content}>{selectedUser?.firstName} {selectedUser?.lastName}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>SS #</Text>
                        <Text style={styles.content}>{selectedUser?.socialSecurityNumber}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Degree/Disicipline</Text>
                        <Text style={styles.content}>{selectedUser?.title}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Phone</Text>
                        <Text style={[styles.content, { color: 'blue' }]}>{selectedUser?.phoneNumber}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Email</Text>
                        <Text style={[styles.content, { color: 'blue' }]}>{selectedUser?.email}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Caregiver Address</Text>
                        <Text style={styles.content}>{selectedUser?.address.streetAddress + " " + selectedUser?.address.streetAddress2 + " " + selectedUser?.address.city + " " + selectedUser?.address.state + " " + selectedUser?.address.zip}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>User Status</Text>
                        <Text style={styles.content}>{selectedUser?.userStatus}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Signature</Text>
                        {selectedUser?.signature && selectedUser?.signature.length > 0 && <Image
                          resizeMode="cover"
                          style={{ width: '90%', height: 'auto' }}
                          source={{ url: 'data:image/jpeg;base64,' + selectedUser?.signature }}
                        />}
                      </View>

                      <View style={[styles.line, { backgroundColor: '#8d8dff' }]}></View>

                      <View style={{flexDirection: 'row',  width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: RFValue(12) }]}>🖥️ CAREGIVER DOCUMENTS</Text>
                        </View>
                      </View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={1}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Driver's License</Text>
                        {credentials?.driverLicense.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('driverLicense'); }}>{credentials?.driverLicense.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('driverLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('driverLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.driverLicense.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('driverLicenseStatus', val)}
                          selectedId={credentials.driverLicenseStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Physical Exam</Text>
                        {credentials?.physicalExam.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('physicalExam'); }}>{credentials?.physicalExam.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('physicalExam')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('physicalExam')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.physicalExam.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Physical Exam - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('physicalExamStatus', val)}
                          selectedId={credentials.physicalExamStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Social Security Card</Text>
                        {credentials?.socialCard.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('socialCard'); }}>{credentials?.socialCard.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('socialCard')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('socialCard')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.socialCard.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Social Security Card - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('socialCardStatus', val)}
                          selectedId={credentials.socialCardStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>PPD (TB Test)</Text>
                        {credentials.ppd.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('ppd'); }}>{credentials.ppd.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('ppd')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('ppd')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials.ppd.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>PPD (TB Test) - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('ppdStatus', val)}
                          selectedId={credentials.ppdStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>MMR (Immunizations)</Text>
                        {credentials?.mmr.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('mmr') }}>{credentials?.mmr.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('mmr')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('mmr')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.mmr.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>MMR (Immunizations) - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('mmrStatus', val)}
                          selectedId={credentials.mmrStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Hep B (shot or declination)</Text>
                        {credentials?.hepB.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('hepB') }}>{credentials?.hepB.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('hepB')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('hepB')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.hepB.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Hep B (shot or declination) - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('hepBStatus', val)}
                          selectedId={credentials.hepBStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Flu (shot or declination)</Text>
                        {credentials.flu.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('flu'); }}>{credentials.flu.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('flu')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('flu')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials.flu.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Flu (shot or declination) - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('fluStatus', val)}
                          selectedId={credentials.fluStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>CNA Certificate or LPN/RN License</Text>
                        {credentials?.cna.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('cna'); }}>{credentials?.cna.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('cna')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('cna')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.cna.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>CNA Certificate or LPN/RN License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('cnaStatus', val)}
                          selectedId={credentials.cnaStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>BLS (CPR card)</Text>
                        {credentials?.bls.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('bls'); }}>{credentials?.bls.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('bls')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('bls')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.bls.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>BLS (CPR card) - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('blsStatus', val)}
                          selectedId={credentials.blsStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>COVID Card</Text>
                        {credentials?.covidCard.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('covidCard'); }}>{credentials?.covidCard.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('covidCard')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('covidCard')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.covidCard.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>COVID Card - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('covidCardStatus', val)}
                          selectedId={credentials.covidCardStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Resume</Text>
                        {credentials?.resume.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('resume'); }}>{credentials?.resume.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('resume')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('resume')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.resume.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Resume - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('resumeStatus', val)}
                          selectedId={credentials.resumeStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Tax Form</Text>
                        {credentials.taxForm.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('taxForm'); }}>{credentials.taxForm.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('taxForm')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('taxForm')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials.taxForm.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Tax Form - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('taxFormStatus', val)}
                          selectedId={credentials.taxFormStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Healthcare License</Text>
                        {credentials?.healthcareLicense.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('healthcareLicense'); }}>{credentials?.healthcareLicense.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('healthcareLicense')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('healthcareLicense')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.healthcareLicense.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Healthcare License - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('healthcareLicenseStatus', val)}
                          selectedId={credentials.healthcareLicenseStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>CHRC 102 Form</Text>
                        {credentials?.chrc102.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('chrc102'); }}>{credentials?.chrc102.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('chrc102')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('chrc102')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.chrc102.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>CHRC 102 Form - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('chrc102Status', val)}
                          selectedId={credentials.chrc102Status}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>CHRC 103 Form</Text>
                        {credentials?.chrc103.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('chrc103'); }}>{credentials?.chrc103.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('chrc103')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('chrc103')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.chrc103.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>CHRC 103 Form - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('chrc103Status', val)}
                          selectedId={credentials.chrc103Status}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Drug Test</Text>
                        {credentials?.drug.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('drug'); }}>{credentials?.drug.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('drug')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('drug')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.drug.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Drug Test - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('drugStatus', val)}
                          selectedId={credentials.drugStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>


                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Standard State Criminal</Text>
                        {credentials?.ssc.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('ssc'); }}>{credentials?.ssc.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('ssc')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('ssc')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.ssc.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Standard State Criminal - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('sscStatus', val)}
                          selectedId={credentials.sscStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>

                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Copy Of TB Test</Text>
                        {credentials?.copyOfTB.name != "" && 
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { handleShowFile('copyOfTB'); }}>{credentials?.copyOfTB.name}</Text>
                            <Text style={{color: 'blue'}} onPress= {() => handleRemove('copyOfTB')}>&nbsp;&nbsp;remove</Text>
                          </View>
                        }
                        <View style={{flexDirection: 'row', width: '100%'}}>
                          <TouchableOpacity title="Select File" onPress={() => handleChangeFileType('copyOfTB')} style={styles.chooseFile}>
                            <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, {height: 30, width: '70%', color: 'black', paddingVertical: 5}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={credentials?.copyOfTB.name || ''}
                          />
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Copy Of TB Test - Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => handleCredentials('copyOfTBStatus', val)}
                          selectedId={credentials.copyOfTBStatus}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>
                      
                      <View style={[styles.line, { backgroundColor: '#ccc' }]}></View>

                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#F7F70059', marginBottom: 5, paddingLeft: 2}]}>Bank Name</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccc', marginBottom: 5, paddingLeft: 2}]}>Bank Account Type</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#F7F70059', marginBottom: 5, paddingLeft: 2}]}>Routing Number</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#F7F70059', marginBottom: 5, paddingLeft: 2}]}>Account Number</Text>
                        <Text style={styles.content}></Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Bank Info Verified?</Text>
                        <RadioGroup 
                          radioButtons={radioButtons} 
                          onPress={(val) => console.log(val)}
                          selectedId={1}
                          containerStyle={{
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                          }}
                          labelStyle={{
                            color: 'black'
                          }}
                        />
                      </View>
                      
                      <View style={[styles.line, { backgroundColor: '#8d8dff' }]}></View>

                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ccffcc', marginBottom: 5, paddingLeft: 2, width: '50%'}]}>Approve Caregiver?</Text>
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
                          value={credentials.userStatus}
                          onFocus={() => setStatusIsFocus(true)}
                          onBlur={() => setStatusIsFocus(false)}
                          onChange={item => {
                            handleCredentials('userStatus', item.value);
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
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, { marginBottom: 5, paddingLeft: 2, width: '100%'}]}>If "Yes" is selected, the Caregiver will receiver a welcome email, and can login to view shifts</Text>
                      </View>

                      <TouchableOpacity style={styles.button} onPress={handleSubmitVerification} underlayColor="#0056b3">
                        <Text style={styles.buttonText}>Submit</Text>
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
                <View style={[styles.body, { marginBottom: 0 }]}>
                  <View style={[styles.modalBody, { paddingHorizontal: 20, borderRadius: 15, borderWidth: 2, borderColor: '#c6c5c5', backgroundColor: '#e3f2f1', paddingVertical: 20 }]}>
                    <View style={styles.cameraContain}>
                    <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={openCamera}>
                        <Image source={images.camera} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={pickGallery}>
                        <Image source={images.gallery} style={{ width: 50, height: 50 }} />
                        <Text style={styles.textStyle}>Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={pickFile}>
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
        </View>
      </ScrollView>
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
    width: '100%',
    marginBottom: 30
  },
  topView: {
    marginLeft: '10%',
    width: '80%',
    position: 'relative'
  },
  line: {
    width: '100%',
    height: 5,
    marginVertical: 15
},
  nurse: {
    width: 200,
    height: 200,
    margin: 10
  },
  backTitle: {
    backgroundColor: 'black',
    width: '100%',
    height: 55,
    marginTop: 10,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
    color: 'black',
    top: 10
  },
  content: {
    fontSize: RFValue(16),
    lineHeight: 30,
    width: '60%'
  },
  titles: {
    fontWeight: 'bold',
    fontSize: RFValue(16),
    lineHeight: 30,
    width: '35%'
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
  },
  profileTitleBg: {
    backgroundColor: '#BC222F',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
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
  chooseFile: {
    width: '30%', 
    height: 30, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'black',
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
  row: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 86%)',
    position: 'relative',
    backgroundColor: 'white',
    width: '100%',
  },
  evenRow: {
    backgroundColor: '#7be6ff4f',
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
  subtitle: {
    backgroundColor: '#F7F70059',
    marginBottom: 5
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
  cameraContain: {
		flex: 1,
    width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
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
  head: {
    backgroundColor: '#7be6ff4f',
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
    backgroundColor: '#A020F0',
    padding: 10,
    marginTop: 30,
    borderRadius: 5,
  },
  buttonText: {
    textAlign: 'center',
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
});
