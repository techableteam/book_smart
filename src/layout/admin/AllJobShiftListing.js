import React, { useState, useEffect, useMemo } from 'react';
import { Modal, TextInput, View, Image, TouchableWithoutFeedback, StyleSheet, Dimensions, ScrollView, StatusBar, Alert, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import RadioGroup from 'react-native-radio-buttons-group';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import { Table } from 'react-native-table-component';
import { Jobs, Update, Clinician, removeJob, Job, setAwarded, updateHoursStatus, getAllUsersName, getBidIDs, PostJob, updateDocuments, getLocationList, getDegreeList } from '../../utils/useApi';
import { Dropdown } from 'react-native-element-dropdown';
import AHeader from '../../components/Aheader';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import AnimatedHeader from '../AnimatedHeader';
// Choose file
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs'
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function AllJobShiftListing({ navigation }) {
  const [data, setData] = useState([]);
  const [isJobDetailModal, setIsJobDetailModal] = useState(false);
  const [isAwardJobModal, setIsAwardJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(0);
  const [selectedBidders, setSelectedBidders] = useState([]);
  const [selectedBidder, setSelectedBidder] = useState([]);
  const [awardedStatus, setAwardedStatus] = useState(2);
  const [isHoursDetailModal, setIsHoursDetailModal] = useState(false);
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [preTime, setPreTime] = useState('');
  const [lunch, setLunch] = useState('');
  const [content, setContent] = useState('');
  const [approved, setApproved] = useState(false);
  const [clinicians, setClinicians] = useState([]);
  const [isJobEditModal, setIsJobEditModal] = useState(false);
  const [accouts, setAccounts] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bidList, setBidList] = useState([]);
  const [entryDate, setEntryDate] = useState(new Date());
  const [showEntryDate, setShowEntryDate] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [degrees, setDegress] = useState([]);
  const [isFocusBidList, setIsFocusBidList] = useState(false);
  const [isFocusAccountList, setIsFocusAccountList] = useState(false);
  const [isJobStatusModal, setIsJobStatusModal] = useState(false);
  const [isFocusJobStatus, setIsFocusJobStatus] = useState(false);
  const [selectedJobStatus, setSelectedJobStatus] = useState('');
  const [uploadFileType, setUploadFileType] = useState('');
  const [isFileUploadModa, setIsFileUploadModal] = useState(false);
  const [search, setSearch] = useState('');
  const [curPage, setCurPage] = useState(1);
  const [addfilterModal, setAddFilterModal] = useState(false);
  const [isexport, setIsexport] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [valueOption, setValueOption] = useState([]);
  const [nurseList, setNurseList] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isLogicFocus, setIsLogicFocus] = useState(false);
  const [isFieldFocus, setIsFieldFocus] = useState(false);
  const [isConditionFocus, setIsConditionFocus] = useState(false);
  const [isValueOptionFocus, setIsValueOptionFocus] = useState(false);
  const [updateExplanationModal, setUpdateExplanationModal] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [location, setLocation] = useState([]);
  const [tmpFile, setTmpFile] = useState({
    content: '',
    type: '',
    name: ''
  });
  const [tmpFileName, setTmpFileName] = useState('');
  const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const logicItems = [
    {label: 'and', value: 'and'},
    {label: 'or', value: 'or'}
  ];
  const countList = [
    {label: 'BDA', value: 'BDA'}
  ];
  const paymentList = [
    {label: 'Zelle', value: 'Zelle'},
    {label: 'ACH', value: 'ACH'}
  ];
  const approvedStatus = [
    {label: 'yes', value: 'yes'},
    {label: 'no', value: 'no'},
    {label: 'pending', value: 'pending'}
  ];
  const submittedStatus = [
    {label: 'yes', value: 'yes'},
    {label: 'no', value: 'no'},
    {label: 'Third Choice', value: 'Third Choice'}
  ];

  const fieldsItems = [
    { label: 'Job Status', value: 'Job Status'},
    { label: 'Entry Date', value: 'Entry Date'},
    { label: 'Facility', value: 'Facility'},
    { label: 'Job-ID', value: 'Job-ID'},
    { label: 'Job Num #', value: 'Job Num #'},
    { label: 'Location', value: 'Location'},
    { label: 'Shift Date', value: 'Shift Date'},
    { label: 'Shift Time', value: 'Shift Time'},
    { label: 'Count - BDA', value: 'Count - BDA'},
    { label: 'Degree/Discipline', value: 'Degree/Discipline'},
    { label: 'Nurse', value: 'Nurse'},
    { label: 'Bids / Offers', value: 'Bids / Offers'},
    { label: 'Hours Submitted?', value: 'Hours Submitted?'},
    { label: 'Hours Approved?', value: 'Hours Approved?'},
    { label: 'Timesheet Template', value: 'Timesheet Template'},
    { label: 'Timesheet Upload', value: 'Timesheet Upload'},
    { label: 'Payment', value: 'Payment'},
    { label: 'No Status Explanation', value: 'No Status Explanation'},
  ];
  const fieldConditions = {
    'Job Status': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
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
    'Facility': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Job-ID': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'higher than', value: 'higher than' },
      { label: 'lower than', value: 'lower than' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Job Num #': [
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'starts with', value: 'starts with' },
      { label: 'ends with', value: 'ends with' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Location': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Shift Date': [
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
    'Shift Time': [
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'starts with', value: 'starts with' },
      { label: 'ends with', value: 'ends with' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Count - BDA': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
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
    'Nurse': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Bids / Offers': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'higher than', value: 'higher than' },
      { label: 'lower than', value: 'lower than' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Hours Submitted?': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Hours Approved?': [
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is any', value: 'is any' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Timesheet Template': [
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
    'Timesheet Upload': [
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
    'No Status Explanation': [
      { label: 'contains', value: 'contains' },
      { label: 'does not contain', value: 'does not contain' },
      { label: 'is', value: 'is' },
      { label: 'is not', value: 'is not' },
      { label: 'starts with', value: 'starts with' },
      { label: 'ends with', value: 'ends with' },
      { label: 'is blank', value: 'is blank' },
      { label: 'is not blank', value: 'is not blank' },
    ],
  };

  const [conditionItems, setConditionItems] = useState(fieldConditions['Job Status']);

  const [filters, setFilters] = useState([
    { logic: '', field: 'Job Status', condition: 'is', value: '', valueType: 'select' },
  ]);

  const addFilter = () => {
    setFilters([...filters, { logic: 'and', field: 'Job Status', condition: 'is', value: '', valueType: 'select' }]);
  };

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
  
      if (value === 'Nurse' || value === 'Hours Submitted?' || value === 'Hours Approved?' || value === 'Job Status' || value === 'Facility' || value === 'Location' || value === 'Count - BDA' || value === 'Degree/Discipline') {
        newFilters[index]['valueType'] = 'select';  // Set value type to 'select'
        if (value === 'Nurse') {
          setValueOption(nurseList);  // Set nurse options
        } else if (value === 'Job Status') {
          setValueOption(jobStatus);  // Set job status options
        } else if (value === 'Facility') {
          setValueOption(accouts);
        } else if (value === 'Location') {
          setValueOption(location);
        } else if (value === 'Count - BDA') {
          setValueOption(countList);
        } else if (value === 'Degree/Discipline') {
          setValueOption(degrees);
        } else if (value === 'Payment') {
          setValueOption(paymentList);
        } else if (value === 'Hours Approved?') {
          setValueOption(approvedStatus);
        } else if (value === 'Hours Submitted?') {
          setValueOption(submittedStatus);
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

  const tableHead = [
    'Entry Date',
    'Customer',
    'JobId',
    'JobNum -#.',
    'Location',
    'Date',
    'Shift',
    'View Shift & Bids',
    'Nurse Type',
    '✏️ Job Status',
    'Hired',
    'Bids',
    'View Hours',
    'Hours Submitted?',
    'Hours Approved?',
    'Timesheet',
    'Verfication',
    '✏️ No Status Explanation',
    'Delete'
  ];

  const getData = async (requestData = { search: search, page: curPage, filters: filters }, isFilter = isSubmitted ) => {
    // if (!isFilter) {
    //   requestData.filters = [];
    // }
    setLoading(true);
    let result = await Jobs(requestData, 'jobs', 'Admin');
    if(!result) {
      setLoading(false);
      setData(['No Data'])
    } else {
      let pageContent = [];
      for (let i = 1; i <= result.totalPageCnt; i++) {
        pageContent.push({ label: 'Page ' + i, value: i });
      }
      setPageList(pageContent);
      setData(result.dataArray);
      setLoading(false);
    }
    const uniqueValues = new Set();
    const transformed = [];
    
    let clinicianData = await Clinician('clinical/clinician', 'Admin');
    const extractData = clinicianData.map(item => {
      const firstName = item[1];
      const lastName = item[2];
      return firstName ? `${firstName} ${lastName}` : null;
    });

    const uniqueNames = Array.from(new Set(extractData.filter(name => name)));

    uniqueNames.forEach(subarray => {
      const value = subarray;
      if (!uniqueValues.has(value)) {
          uniqueValues.add(value);
          transformed.push({ label: value, value: value });
      }
    });

    setClinicians(transformed);
  }

  const getAccounts = async () => {
    setLoading(true);
    const data = await getAllUsersName();
    if (data) {
      let tempArr = [];
      data.map(item => {
        tempArr.push({ label: item, value: item });
      });
      setAccounts(tempArr);
    } else {
      setAccounts([]);
    }
  };

  const getBidderList = async () => {
    setLoading(true);
    const data = await getBidIDs();
    if (data) {
      let tempArr = [];
      data.map(item => {
        tempArr.push({ label: item.toString(), value: item });
      });
      setBidList(tempArr);
    } else {
      setBidList([]);
    }
  };

  const getLocation = async () => {
    setLoading(true);
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
  };

  const getDegree = async () => {
    setLoading(true);
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

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      getAccounts();
      getBidderList();
      // getLocation();
      // getDegree();
      // getNurseList();
      getData();
      setLoading(false);
    }, [])
  );

  const handleShowFile = (jobId) => {
    console.log('clicked => ', jobId);
    navigation.navigate("FileViewer", { jobId: jobId, fileData: '' });
  };

  //---------------DropDown--------------
  const [pageList, setPageList] = useState([
    {label: 'Page 1', value: 1}
  ]);

  const approve_status = [
    {label: 'Yes', value: true},
    {label: 'No', value: false}
  ];

  const [value, setValue] = useState(null);
  const [isFocus1, setIsFocus1] = useState(false); 
  const widths = [150, 130, 100, 150, 200, 120, 150, 200, 150, 150, 150, 80, 150, 200, 200, 150, 250, 250, 100];
  const [modal, setModal] = useState(false)
  const toggleModal = () => {
    setModal(!modal);
  }
  const [rowData, setRowData] = useState(null);
  const [modalItem, setModalItem] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [label, setLabel] = useState(null);
  const [date,setDate] = useState(new Date());

  const handleDay = (day) => {
    setDate(day);
    setLabel(moment(day).format("MM/DD/YYYY"));
  }

  const toggleHoursDetailModal = () => {
    setIsHoursDetailModal(!isHoursDetailModal);
  };

  const toggleFileTypeSelectModal = () => {
    setFiletypeSelectModal(!fileTypeSelectModal);
  };

  const toggleJobEditModal = () => {
    setIsJobEditModal(!isJobEditModal);
  };

  const toggleJobStatusModal = () => {
    setIsJobStatusModal(!isJobStatusModal);
  };

  const toggleTiemSheetUploadModal = () => {
    setIsFileUploadModal(!isFileUploadModa);
  };

  const toggleUpdateExplanationModal = () => {
    setUpdateExplanationModal(!updateExplanationModal)
  };

  const toggleJobDetailModal = () => {
    setIsJobDetailModal(!isJobDetailModal);
  };

  const toggleJobAwardModal = () => {
    setIsAwardJobModal(!isAwardJobModal);
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
          
          setTmpFile({
            content: fileContent,
            type: 'image',
            name: response.assets[0].fileName,
          });
          handleShowSelectModal();
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
          
          setTmpFile({
            content: fileContent,
            type: 'image',
            name: response.assets[0].fileName,
          });
          handleShowSelectModal();
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
      setTmpFile({ content: `${fileContent}`, type: fileType, name: res[0].name });
      handleShowSelectModal();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        // Handle other errors
      }
    }
  };

  const handleChangeAwardStatus = async (bidderId, jobId) => {
    const response = await setAwarded({ jobId: jobId, bidderId: bidderId, status: awardedStatus }, 'jobs');
    if (!response?.error) {
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
        { cancelable: false },
      ]);
    }
  };

  const handlechangeJobInfo = async () => {
    let response = await PostJob({ jobId: selectedJob?.jobId, bid: selectedBidId, account: selectedAccount, entryDate: moment(entryDate).format("MM/DD/YYYY") }, 'jobs');
    toggleJobEditModal();
    getData();
  };

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

  const jobStatus = [
    {label: 'Available', value: 'Available'},
    {label: 'Awarded', value: 'Awarded'},
    {label: 'Pending Verification', value: 'Pending Verification'},
    {label: 'Cancelled', value: 'Cancelled'},
    {label: 'Verified', value: 'Verified'},
    {label: 'Paid', value: 'Paid'},
  ];

  const [isJobFocus, setJobIsFocus] = useState(false);

  const [suc, setSuc] = useState(0);
  const getLocalTimeOffset = () => {
    const date = new Date();
    const offsetInMinutes = date.getTimezoneOffset(); // Offset in minutes
    const offsetInHours = offsetInMinutes / 60; // Convert to hours
    return offsetInHours;
  };

  const handleRemove = async (id) => {
    let results = await removeJob({ jobId: id }, 'jobs');
    if (!results?.error) {
      console.log('success');
      Alert.alert('Success!', 'Successfully Removed', [
        {
          text: 'OK',
          onPress: () => {
            console.log('removed');
          },
        },
        { cancelable: false },
      ]);
      getData();
    } else {
      console.log('failure', results.error);
    }
  };

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

  const handleShowHoursModal = async (id) => {
    console.log(id);
    setLoading(true);
    let data = await Job({ jobId: id }, 'jobs');
    if(!data) {
      setLoading(false);
      setSelectedJob(null);
    } else {
      setSelectedJob(data.jobData);
      setApproved(data.jobData.isHoursApproved);
      setContent('');
      setLunch(data.jobData.lunch);
      setPreTime();
      setToDate(new Date());
      setFromDate(new Date());
      console.log('--------------------------------', data.jobData);
      setIsHoursDetailModal(true);
      setLoading(false);
    }
  };

  const handleShowJobDetailModal = async (id) => {
    console.log(id);
    setLoading(true);
    let data = await Job({ jobId: id }, 'jobs');
    if(data?.error) {
      setSelectedJob(null);
      setSelectedBidders([]);
      setLoading(false);
    } else {
      let biddersList = data.bidders;
      biddersList.unshift(bidderTableHeader);
      setSelectedJob(data.jobData);
      setSelectedBidders(biddersList);
      console.log('--------------------------------', data.jobData);
      console.log('--------------------------------', biddersList);
      setIsJobDetailModal(true);
      setLoading(false);
    }
  };

  const handleShowJobEditModal = async () => {
    toggleJobDetailModal();
    toggleJobEditModal();
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

  const handlechangeHoursStatus = async () => {
    let results = await updateHoursStatus({ jobId: selectedJob.jobId, fromDate: fromDate, endDate: toDate, preTime: preTime, approved: approved, lunch: lunch, explanation: content }, 'jobs');
    if (!results?.error) {
      console.log('success');
      getData();
      setIsHoursDetailModal(false);
    } else {
      console.log('failure', results.error);
    }
  };

  const bidderTableWidth = [150, 150, 140, 200, 150, 100];
  const RenderItem1 = ({ item, index }) => (
    <View
      key={index}
      style={{
        backgroundColor: index == 0 ? '#ccffff' : '#fff',
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
                { flex: 1, justifyContent: 'center', alignItems: 'center', width, backgroundColor: 'white' },
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
                  toggleJobDetailModal();
                  navigation.navigate("CaregiverProfile", {id: item[6]});
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
                { flex: 1, justifyContent: 'center', alignItems: 'center', width, backgroundColor: 'white' },
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
              style={[styles.tableItemStyle, index > 0 ? { backgroundColor: 'white', width } : { width }]}
            >
              {item[idx]}
            </Text>
          );
        }
      })}
    </View>
  );

  const BidderTableComponent = () => (
    <View style={{ borderColor: '#AAAAAA', borderWidth: 1, marginBottom: 3 }}>
      {selectedBidders.map((item, index) => {
        return (<RenderItem1 key={index} item={item} index={index} />);
      })}
    </View>
  );

  const handlePress = async() => {
    const offestTime = getLocalTimeOffset();
    let sendData = label;
    if (modalItem === 3 || modalItem === 10) {
      sendData = Number(sendData)
    }
    let sendingData = {}
    if (modalItem === 1) {
      sendingData = {
        jobId: rowData, // Ensure rowData is defined and contains the appropriate value
        nurse: sendData, // Use sendData for jobNum
        offestTime: offestTime
      };
    } else if (modalItem === 3) {
      sendingData = {
        jobId: rowData,
        jobNum: sendData // Use sendData for location
      };
    } else if (modalItem === 4)  {
      // Handle other modalItems as needed
      sendingData = {
        jobId: rowData,
        location: sendData // Use sendData for location
      };
    } else if (modalItem === 5)  {
      // Handle other modalItems as needed
      sendingData = {
        jobId: rowData,
        shiftDate: sendData // Use sendData for location
      };
    } else if (modalItem === 6)  {
      // Handle other modalItems as needed
      sendingData = {
        jobId: rowData,
        shiftTime: sendData, // Use sendData for location
        offestTime: offestTime
      };
    } else if (modalItem === 9)  {
      // Handle other modalItems as needed
      sendingData = {
        jobId: rowData,
        jobStatus: sendData, // Use sendData for location
        offestTime: offestTime
      };
    } else if (modalItem === 10)  {
      // Handle other modalItems as needed
      sendingData = {
        jobId: rowData,
        jobRating: sendData, // Use sendData for location
      };
    }

    let data = await Update(sendingData, 'jobs');
    if(data) setSuc(suc+1);
    else setSuc(suc);
    toggleModal();
    getData();
  };

  const handleUpdateExplanation = async () => {
    setLoading(true);
    let results = await PostJob({ jobId: selectedJobId, noStatusExplanation: explanation }, 'jobs');
    toggleUpdateExplanationModal();
    if (!results?.error) {
      getData();
      setLoading(false);
    } else {
      setLoading(false);
      console.log('failure', JSON.stringify(results.error));
      Alert.alert(
        'Warning!',
        'Please retry again later',
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
    setLoading(false);
  };

  const handleUpdate = async () => {
    console.log(selectedJobId);
    console.log(selectedJobStatus);
    let results = await PostJob({ jobId: selectedJobId, jobStatus: selectedJobStatus }, 'jobs');
    if (!results?.error) {
      toggleJobStatusModal();
      getData();
      console.log('success');
      Alert.alert(
        'Success!',
        'Job status has been updated.',
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
      console.log('failure', JSON.stringify(results.error));
      Alert.alert(
        'Warning!',
        'Please retry again later',
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

  const handleReset = (event) => {
    event.persist();
    setSearch(''); 
    getData({ search: '', page: curPage, filters: filters });
  };
  
  const handleSearch = (event) => {
    event.persist();
    getData();
  };

  useEffect(() => {
    getData();
  }, [curPage]);

  const toggleAddFilterModal = () => {
    setAddFilterModal(!addfilterModal)
  };

  const toggleExportModal = () => {
    setIsexport(!isexport)
  };

  const handleCellClick = async (data) => {
    setSelectedJobId(data[2]);
    setSelectedJobStatus(data[9]);
    toggleJobStatusModal();
  };

  const handleUploadModal = (data, type, filename) => {
    setUploadFileType(type);
    setSelectedJobId(data[2]);
    setTmpFileName(filename);
    setTmpFile({
      content: '',
      name: '',
      type: ''
    });
    toggleTiemSheetUploadModal();
  };

  const handleUpdateExplanationModal = (data) => {
    setSelectedJobId(data[2]);
    setExplanation(data[17]);
    toggleUpdateExplanationModal();
  };

  const handleShowSelectModal = () => {
    setFiletypeSelectModal(!fileTypeSelectModal);
    toggleTiemSheetUploadModal();
  };

  const handleFileUpload = async () => {
    setLoading(true);
    toggleTiemSheetUploadModal();
    let response = await updateDocuments({ jobId: selectedJobId, file: tmpFile, prevFile: tmpFileName, type: uploadFileType }, 'jobs');
    if (!response?.error) {
      getData();
    } else {
      Alert.alert('Failure!', 'Pleae try later', [
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
      <StatusBar
        translucent backgroundColor="transparent"
      />
      <AHeader navigation={navigation}  currentPage={1} />
      <SubNavbar navigation={navigation} name={"AdminLogin"}/>
      <ScrollView style={{ width: '100%', marginTop: height * 0.25 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topView}>
          <AnimatedHeader title="COMPANY JOBS / SHIFTS" />
          <View style={styles.bottomBar} />
        </View>
        <View style={{ marginTop: 30, flexDirection: 'row', width: '90%', marginLeft: '5%', gap: 10, paddingLeft: 10 }}>
          <TouchableOpacity style={[styles.subBtn, { width: 'auto' }]} onPress={() => navigation.navigate('AdminJobShift')}>
            <View style={{ backgroundColor: 'white', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              <Text style={{ fontWeight: 'bold', color: '#194f69', textAlign: 'center', lineHeight: 15 }}>+</Text>
            </View>
            <Text style={styles.profileTitle}>Add A New Job / Shift
            </Text>
          </TouchableOpacity>
        </View>
        <View style = {{ flex:1, justifyContent:'center', alignItems: 'center', width: '100%'}}>
          <View style={styles.profile}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ backgroundColor: '#000080', color: 'white', paddingHorizontal: 5, fontSize: RFValue(15)}}>TOOL TIPS</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
              <Text style={[styles.text, { textAlign: 'left', marginTop: 10, fontSize: RFValue(14) }]}>When A New "Job / Shift" is added the status will appear as <Text style={{ backgroundColor: '#ffff99' }}>"AVAILABLE"</Text> & will appear on Nurses Dashboard</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
              <Text style={[styles.text, { textAlign: 'left', marginTop: 10, fontSize: RFValue(14) }]}>Nurses can "Bid" or show interest on all "Job / Shifts" - Available</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
              <Text style={[styles.text, { textAlign: 'left', marginTop: 10, fontSize: RFValue(14) }]}>Admins can view all bids and award a shift to the nurse of choice, once awarded the Job / Shift will update to a stus of <Text style={{ backgroundColor: '#ccffff' }}>"AWARDED"</Text></Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
              <Text style={[styles.text, { textAlign: 'left', marginTop: 10, fontSize: RFValue(14) }]}>Once the Nurse has completed the "Job / Shift" and uploads there timesheet, the status will update to <Text style={{ backgroundColor: '#ccffcc' }}>"COMPLETED"</Text></Text>
            </View>
          </View>
        </View>
        
        <View>
          <View style={styles.body}>
            <View style={styles.bottomBar} />
            <View style={styles.modalBody}>
              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <View style={[styles.profileTitleBg, { marginLeft: '-5%' }]}>
                  <Text style={styles.profileTitle}>🖥️ ALL JOB / SHIFT LISTINGS</Text>
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
              {/* <View style={{ marginBottom: 10 }}>
                <View style = {styles.filterbar}>
                  <TouchableOpacity style={[styles.filterBtn, { marginLeft: 0 }]} onPress={toggleAddFilterModal}>
                    <Text style={{color: "#2a53c1"}}>Add Filter</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.filterBtn, { marginLeft: 10 }]} onPress={toggleExportModal}>
                    <Text style={{color: "#2a53c1"}}>Export</Text>
                  </TouchableOpacity>
                </View>
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
                value={curPage}
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
                          {rowData.map((cellData, cellIndex) => {
                            if (cellData === 'view_shift') {
                              return (
                                <View
                                  key={cellIndex}
                                  style={[
                                    styles.tableItemStyle,
                                    { flex: 1, justifyContent: 'center', alignItems: 'center', width: 200, backgroundColor: 'white' },
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
                                      console.log('job id => ', rowData[2]);
                                      handleShowJobDetailModal(rowData[2]);
                                    }}
                                  >
                                    <Text style={styles.profileTitle}>View</Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            } else if (cellData === 'view_hours') {
                              return (
                                <View
                                  key={cellIndex}
                                  style={[
                                    styles.tableItemStyle,
                                    { flex: 1, justifyContent: 'center', alignItems: 'center', width: 150, backgroundColor: 'white' },
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
                                      console.log('job id =>', rowData[2]);
                                      handleShowHoursModal(rowData[2]);
                                    }}
                                  >
                                    <Text style={styles.profileTitle}>View</Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            } else if (cellData === 'delete') {
                              return (
                                <View
                                  key={cellIndex}
                                  style={[
                                    styles.tableItemStyle,
                                    { flex: 1, justifyContent: 'center', alignItems: 'center', width: widths[cellIndex], backgroundColor: 'white' },
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
                                            console.log('job id > ', rowData[2]);
                                            handleRemove(rowData[2]);
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
                              if (cellIndex == 15) {
                                return (
                                  <TouchableWithoutFeedback key={cellIndex} onPress={() => handleUploadModal(rowData, 'timesheet', cellData)}>
                                    <Text
                                      key={cellIndex}
                                      style={[styles.tableItemStyle, { width: widths[cellIndex], color: 'blue', backgroundColor: 'white' }]}
                                    >
                                      {cellData}
                                    </Text>
                                  </TouchableWithoutFeedback>
                                );
                              } else if (cellIndex == 16) {
                                return (
                                  <TouchableWithoutFeedback key={cellIndex} onPress={() => handleUploadModal(rowData, 'verification', cellData)}>
                                    <Text
                                      key={cellIndex}
                                      style={[styles.tableItemStyle, { width: widths[cellIndex], color: 'blue', backgroundColor: 'white'  }]}
                                    >
                                      {cellData}
                                    </Text>
                                  </TouchableWithoutFeedback>
                                );
                              } else if (cellIndex == 17) {
                                return (
                                  <TouchableWithoutFeedback key={cellIndex} onPress={() => handleUpdateExplanationModal(rowData)}>
                                    <Text
                                      key={cellIndex}
                                      style={[styles.tableItemStyle, { width: widths[cellIndex], color: 'blue', backgroundColor: 'white'  }]}
                                    >
                                      {cellData}
                                    </Text>
                                  </TouchableWithoutFeedback>
                                );
                              } else if (cellIndex == 9) {
                                return (
                                  <TouchableWithoutFeedback key={cellIndex} onPress={() => handleCellClick(rowData)}>
                                    <Text
                                      key={cellIndex}
                                      style={[styles.tableItemStyle, { width: widths[cellIndex], backgroundColor: 'white'  }]}
                                    >
                                      {cellData}
                                    </Text>
                                  </TouchableWithoutFeedback>
                                );
                              } else {
                                return (
                                  <Text
                                    key={cellIndex}
                                    style={[styles.tableItemStyle, { width: widths[cellIndex], backgroundColor: 'white'  }]}
                                  >
                                    {cellData}
                                  </Text>
                                );
                              }
                            }
                          })}
                        </View>
                      ) : null
                    ))
                  ) : (
                    <Text>No data available</Text>
                  )}
                </Table>
              </ScrollView>
            </View>
          </View>
          
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
                  <Text style={styles.headerText}>{tableHead[modalItem]}</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <View style={styles.modalBody}>
                    {
                      (modalItem === 1) || (modalItem === 4) || (modalItem === 9) ?
                        <Dropdown
                          style={[styles.dropdown, {width: '100%'}, isFocus && { borderColor: 'blue' }]}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          inputSearchStyle={styles.inputSearchStyle}
                          itemTextStyle={styles.itemTextStyle}
                          iconStyle={styles.iconStyle}
                          data={
                            modalItem === 1 ? clinicians :
                            modalItem === 4 ?  location :
                            (modalItem === 9) && jobStatus
                          }
                          // search
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder={label}
                          // searchPlaceholder="Search..."
                          value={label}
                          onFocus={() => setJobIsFocus(true)}
                          onBlur={() => setJobIsFocus(false)}
                          onChange={item => {
                            setLabel(item.label);
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
                      :
                      (modalItem === 3) || (modalItem === 6) || (modalItem === 10) ?
                        (<TextInput
                          style={[styles.searchText, {width: '100%', paddingTop: 0, paddingBottom: 0, textAlignVertical: 'center'}]}
                          placeholder=""
                          onChangeText={e => setLabel(e)}
                          value={label || ''}
                        />)
                      :
                      modalItem === 5 ?
                        <View style={{flexDirection: 'column', width: '100%', gap: 5, position: 'relative'}}>
                          <TouchableOpacity onPress={() => {setShowCalendar(true), console.log(showCalendar)}} style={{width: '100%', height: 40}}>
                            <View pointerEvents="none">
                              <TextInput
                                style={[styles.searchText, {width: '100%', paddingTop: 0, textAlignVertical: 'center', color: 'black', paddingBottom: 0, fontSize: RFValue(18)}]}
                                placeholder=""
                                value={label}
                                editable={false}
                              />
                            </View>
                          </TouchableOpacity>
                          {showCalendar 
                            && 
                            <>
                              <DatePicker
                                date={date}
                                onDateChange={(day) => handleDay(day)}
                                mode="date"
                                theme='light'
                                androidVariant="native"
                              />
                              <Button title="confirm" onPress={(day) =>{setShowCalendar(!showCalendar);}} />
                            </>
                          }
                        </View>
                      :
                      <></>
                    }
                    <TouchableOpacity style={styles.button} onPress={handlePress} underlayColor="#0056b3">
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
                <View style={[styles.header, { height: 80 }]}>
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
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Time</Text>
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
                        <Text style={[styles.content, { color: 'blue' }]} onPress={() => { handleShowFile(selectedJob?.jobId); }}>{selectedJob?.timeSheet?.name}</Text>
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
                          <Text style={[styles.buttonText, { fontSize: RFValue(12) }]}>Edit Job / Shift</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{flexDirection: 'row', width: '95%', justifyContent: 'center', alignItems: 'center'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: RFValue(12) }]}>ALL BIDS / OFFERS FOR SHIFT</Text>
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
                <View style={[styles.header, { height: 80 }]}>
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
                          <Text style={[styles.profileTitle, { fontSize: RFValue(12) }]}>🖥️"CLICK "AWARDED"</Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginTop: 20 }} />
                        <Text style={[styles.text, { textAlign: 'left', marginTop: 10 }]}>This will award the job to the applicant, and change the status of the JOB to "AWARDED" on your "Job Listings Tab"</Text>
                      </View>
                      <View style={{flexDirection: 'column', width: '100%', alignItems: 'flex-start', justifyContent: 'center'}}>
                        <View>
                          <Text style={{ fontWeight: 'bold', marginTop: 20, fontSize: RFValue(14) }}>Bid Status</Text>
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
                        <Text style={[styles.buttonText, { fontSize: RFValue(12) }]}>Submit</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={isHoursDetailModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setIsHoursDetailModal(!isHoursDetailModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.calendarContainer, { height: '80%' }]}>
                <View style={[styles.header, { height: 80 }]}>
                  <Text style={styles.headerText}>View Hours</Text>
                  <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleHoursDetailModal}>
                    <Image source = {images.close} style={{width: 20, height: 20}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <ScrollView>
                    <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Caregiver</Text>
                        <Text style={styles.content}>{selectedJob?.nurse}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job-ID</Text>
                        <Text style={styles.content}>{selectedJob?.jobId}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Facility</Text>
                        <Text style={styles.content}>{selectedJob?.facility}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job Status</Text>
                        <Text style={styles.content}>{selectedJob?.jobStatus}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Job #</Text>
                        <Text style={styles.content}>{selectedJob?.jobNum}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Sift Date & Time</Text>
                        <Text style={styles.content}>{selectedJob?.shiftDate}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Hours Submitted</Text>
                        <Text style={styles.content}>{selectedJob?.isHoursSubmit ? "yes" : "no"}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ffff99', marginBottom: 5, paddingLeft: 2}]}>Hours Worked</Text>
                        <Text style={styles.content}>{selectedJob?.workedHours}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Hours Approved?</Text>
                        <Text style={styles.content}>{selectedJob?.isHoursApproved ? "yes" : "no"}</Text>
                      </View>
                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2}]}>Hours Comments</Text>
                        <Text style={styles.content}>{selectedJob?.hoursComments}</Text>
                      </View>
                      
                      <View style={styles.line}></View>

                      <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                        <Text style={[styles.titles, {backgroundColor: '#ffff99', marginBottom: 5, paddingLeft: 2, fontSize: RFValue(20)}]}>Hours Worked</Text>
                        <Text style={[styles.content, { fontSize: RFValue(20) }]}>{selectedJob?.workedHours}</Text>
                      </View>

                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                          <Text style={[styles.profileTitle, { fontSize: RFValue(12) }]}>ADD HOURS</Text>
                        </View>
                      </View>

                      <View>
                        <Text style={styles.subtitle}>Time Submitted By Caregiver</Text>
                        <View style={{ flexDirection: 'column', width: '100%', gap: 5, position: 'relative' }}>
                          <TouchableOpacity onPress={() => setShowFromDate((prev) => !prev)} style={{ width: 300, height: 40, zIndex: 2 }}>
                            <View>
                              <TextInput
                                style={[styles.input, { width: '90%', position: 'absolute', zIndex: 1, color: 'black' }]}
                                placeholder=""
                                value={fromDate.toDateString()}
                                editable={false}
                              />
                            </View>
                          </TouchableOpacity>
                          {showFromDate && (
                            <>
                              <DatePicker
                                date={fromDate}
                                onDateChange={(day) => setFromDate(day)}
                                mode="datetime"
                                theme='light'
                                androidVariant="native"
                              />
                              <Button style={{ width: 300 }} buttonColor='rgb(26,115,232)' textColor='#fff' onPress={() =>setShowFromDate((prev) => !prev)}>Confirm</Button>
                            </>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '90%', paddingVertical: 10 }}>
                          <Text style={{ width: '90%', textAlign: 'center' }}>to</Text>
                        </View>
                        <View style={{ flexDirection: 'column', width: '100%', gap: 5, position: 'relative' }}>
                          <TouchableOpacity onPress={() => setShowToDate((prev) => !prev)} style={{ width: 300, height: 40, zIndex: 2 }}>
                            <View pointerEvents="none">
                              <TextInput
                                style={[styles.input, { width: '90%', position: 'absolute', zIndex: 1, color: 'black' }]}
                                placeholder=""
                                value={toDate.toDateString()}
                                editable={false}
                              />
                            </View>
                          </TouchableOpacity>
                          {showToDate && (
                            <>
                              <DatePicker
                                date={toDate}
                                theme="light"
                                onDateChange={(day) => setToDate(day)}
                                mode="datetime"
                                androidVariant="native"
                              />
                              <Button style={{ width: 300 }} buttonColor='rgb(26,115,232)' textColor='#fff' onPress={() =>setShowToDate((prev) => !prev)}>Confirm</Button>
                            </>
                          )}
                        </View>
                      </View>
                      <View>
                        <Text style={styles.subtitle}>Pre Time " Add In Total Hours Worked - from above</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <TextInput
                            style={[styles.input, {width: '90%', color: 'black'}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            keyboardType="numeric"
                            onChangeText={e => setPreTime(e)}
                            value={preTime}
                          />
                        </View>
                      </View>

                      <View>
                        <Text style={styles.subtitle}>Hours Approved</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <Dropdown
                            style={[styles.dropdown, isFocus1 && { borderColor: 'blue' }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            itemTextStyle={styles.itemTextStyle}
                            iconStyle={styles.iconStyle}
                            data={approve_status}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={''}
                            value={approved ? approved : approve_status[1].value}
                            onFocus={() => setIsFocus1(true)}
                            onBlur={() => setIsFocus1(false)}
                            onChange={item => {
                              setApproved(item.value);
                              setIsFocus1(false);
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
                      </View>

                      <View>
                        <Text style={styles.subtitle}>No Status Explanation</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <TextInput
                            style={[styles.inputs, { width: '90%', color: 'black'}]}
                            onChangeText={setContent}
                            value={content}
                            multiline={true}
                            textAlignVertical="top"
                            placeholder=""
                          />
                        </View>
                      </View>

                      <View>
                        <Text style={styles.subtitle}>Lunch</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <TextInput
                            style={[styles.input, {width: '90%', color: 'black'}]}
                            placeholder=""
                            autoCorrect={false}
                            autoCapitalize="none"
                            onChangeText={e => setLunch(e)}
                            value={lunch}
                          />
                        </View>
                      </View>

                      <View>
                        <Text style={styles.subtitle}>Final Hours Equation</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <Text style={{width: '90%'}}>{preTime}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={{flexDirection: 'row', width: '100%'}}>
                      <TouchableOpacity
                        style={[styles.button, { marginTop: 10, paddingHorizontal: 20 }]}
                        onPress={handlechangeHoursStatus} underlayColor="#0056b3"
                      >
                        <Text style={[styles.buttonText, { fontSize: RFValue(12) }]}>Submit</Text>
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
                <View style={[styles.header, { height: 80 }]}>
                  <Text style={styles.headerText}>Edit Job</Text>
                  <TouchableOpacity style={{width: 20, height: 20}} onPress={toggleJobEditModal}>
                    <Image source = {images.close} style={{width: 20, height: 20}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <ScrollView>
                    <View style={[styles.modalBody, { padding: 0, paddingVertical: 10 }]}>
                      <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                        <Text style={styles.subtitle}>Job-ID</Text>
                        <Text style={styles.content}>{selectedJob?.jobId}</Text>
                      </View>
                      <View>
                        <Text style={styles.subtitle}>Entry Date</Text>
                        <View style={{ flexDirection: 'column', width: '100%', gap: 5, position: 'relative' }}>
                          <TouchableOpacity onPress={() => setShowEntryDate((prev) => !prev)} style={{ width: 300, height: 40, zIndex: 2 }}>
                            <View>
                              <TextInput
                                style={[styles.input, { width: '90%', position: 'absolute', zIndex: 1, color: 'black' }]}
                                placeholder=""
                                value={entryDate.toDateString()}
                                editable={false}
                              />
                            </View>
                          </TouchableOpacity>
                          {showEntryDate && (
                            <>
                              <DatePicker
                                date={entryDate}
                                onDateChange={(day) => setEntryDate(day)}
                                mode="date"
                                theme='light'
                                androidVariant="native"
                              />
                              <Button style={{ width: 300 }} buttonColor='rgb(26,115,232)' textColor='#fff' onPress={() =>setShowEntryDate((prev) => !prev)}>Confirm</Button>
                            </>
                          )}
                        </View>
                      </View>
                      <View>
                        <Text style={styles.subtitle}>Bid</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                        <Dropdown
                            style={[styles.dropdown, isFocusBidList && { borderColor: 'blue' }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            itemTextStyle={styles.itemTextStyle}
                            iconStyle={styles.iconStyle}
                            data={bidList}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={''}
                            value={selectedBidId ? selectedBidId : bidList[0]?.value}
                            onFocus={() => setIsFocusBidList(true)}
                            onBlur={() => setIsFocusBidList(false)}
                            onChange={item => {
                              setSelectedBidId(item.value);
                              setIsFocusBidList(false);
                            }}
                            renderLeftIcon={() => (
                              <View
                                style={styles.icon}
                                color={isFocusBidList ? 'blue' : 'black'}
                                name="Safety"
                                size={20}
                              />
                            )}
                          />
                        </View>
                      </View>

                      <View>
                        <Text style={styles.subtitle}>Account</Text>
                        <View style={{flexDirection: 'row', width: '100%', gap: 5}}>
                          <Dropdown
                            style={[styles.dropdown, isFocusAccountList && { borderColor: 'blue' }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            itemTextStyle={styles.itemTextStyle}
                            iconStyle={styles.iconStyle}
                            data={accouts}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={''}
                            value={selectedAccount ? selectedAccount : accouts[0]?.value}
                            onFocus={() => setIsFocusAccountList(true)}
                            onBlur={() => setIsFocusAccountList(false)}
                            onChange={item => {
                              setSelectedAccount(item.value);
                              setIsFocusAccountList(false);
                            }}
                            renderLeftIcon={() => (
                              <View
                                style={styles.icon}
                                color={isFocusAccountList ? 'blue' : 'black'}
                                name="Safety"
                                size={20}
                              />
                            )}
                          />
                        </View>
                      </View>
                    </View>
                    <View style={{flexDirection: 'row', width: '100%'}}>
                      <TouchableOpacity
                        style={[styles.button, { marginTop: 10, paddingHorizontal: 20 }]}
                        onPress={handlechangeJobInfo} underlayColor="#0056b3"
                      >
                        <Text style={[styles.buttonText, { fontSize: RFValue(12) }]}>Submit</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={isJobStatusModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setIsJobStatusModal(!isJobStatusModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <View style={[styles.header, { height: 80 }]}>
                  <Text style={styles.headerText}>Job Status</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleJobStatusModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={[styles.body, { marginBottom: 0 }]}>
                  <View style={[styles.modalBody, { paddingBottom: 10 }]}>
                    <Text style={{ fontSize: RFValue(15), marginBottom: 5, marginTop: 20 }}>Job Status</Text>
                    <Dropdown
                      style={[styles.dropdown, { width: '90%' }, isFocusJobStatus && { borderColor: 'blue' }]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      itemTextStyle={styles.itemTextStyle}
                      iconStyle={styles.iconStyle}
                      data={jobStatus}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={''}
                      value={selectedJobStatus}
                      onFocus={() => setIsFocusJobStatus(true)}
                      onBlur={() => setIsFocusJobStatus(false)}
                      onChange={item => {
                        setSelectedJobStatus(item.value);
                        setIsFocusJobStatus(false);
                      }}
                      renderLeftIcon={() => (
                        <View
                          style={styles.icon}
                          color={isFocusJobStatus ? 'blue' : 'black'}
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
          <Modal
            visible={isFileUploadModa}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setIsFileUploadModal(!isFileUploadModa);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <View style={[styles.header, { height: 80 }]}>
                  <Text style={styles.headerText}>File Upload</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleTiemSheetUploadModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={[styles.body, { marginBottom: 0 }]}>
                  <View style={[styles.modalBody, { paddingVertical: 10 }]}>
                    <View style={{flexDirection: 'column', width: '70%', gap: 10}}>
                      {tmpFileName && 
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} onPress={() => { console.log('openfile'); }}>{tmpFileName}</Text>
                          <Text style={{color: 'blue'}} onPress= {() => setTmpFileName('')}>&nbsp;&nbsp;remove</Text>
                        </View>
                      }
                    </View>
                    <View style={{flexDirection: 'row', width: '95%'}}>
                      <TouchableOpacity title="Select File" onPress={handleShowSelectModal} style={styles.chooseFile}>
                        <Text style={{fontWeight: '400', padding: 0, fontSize: RFValue(14)}}>Choose File</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.chooseFileinput, { width: '70%', color: 'black' }]}
                        placeholder=""
                        autoCorrect={false}
                        autoCapitalize="none"
                        value={tmpFile.name || ''}
                      />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleFileUpload} underlayColor="#0056b3">
                      <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
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
              <View style={[styles.viewContainer, { marginTop: '30%' }]}>
                <View style={[styles.header, { height: 100 }]}>
                  <Text style={styles.headerText}>Choose File</Text>
                  <TouchableOpacity style={{ width: 20, height: 20 }} onPress={toggleFileTypeSelectModal}>
                    <Image source={images.close} style={{ width: 20, height: 20 }} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.body, { marginBottom: 0 }]}>
                  <View style={[styles.modalBody, { marginBottom: 0, width: '100%' }]}>
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
          <Modal
            visible={updateExplanationModal}
            transparent= {true}
            animationType="slide"
            onRequestClose={() => {
              setUpdateExplanationModal(!updateExplanationModal);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.calendarContainer}>
                <View style={[styles.header, { height: 80 }]}>
                  <Text style={styles.headerText}>Update Explanation</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleUpdateExplanationModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={[styles.body, { marginBottom: 0 }]}>
                  <View style={[styles.modalBody, { paddingVertical: 10 }]}>
                    <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
                      <TextInput
                        style={[styles.inputs, { width: '95%', color: 'black'}]}
                        onChangeText={setExplanation}
                        value={explanation}
                        multiline={true}
                        textAlignVertical="top"
                        placeholder=""
                      />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleUpdateExplanation} underlayColor="#0056b3">
                      <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </View>
        <Modal visible={isexport}
          transparent= {true}
          animationType="slide"
          onRequestClose={() => {
            setIsexport(!isex);
          }}>
            <View style={styles.modalContainer}>
              <View style={[styles.calendarContainer, { height: '80%' }]}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Export</Text>
                  <TouchableOpacity style={{width: 20, height: 20, }} onPress={toggleExportModal}>
                    <Image source = {images.close} style={{width: 20, height: 20,}}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.body}>
                  <ScrollView>
                    <Text>Export</Text>
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
          }}>
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
    width: '100%'
  },
  cameraContain: {
		flex: 1,
    width: '100%',
		alignItems: 'flex-start',
		justifyContent: 'space-around',
		flexDirection: 'row',
    paddingVertical: 20
	},
  removeButton: {
    textAlign: 'center',
    color: 'white'
  },
  topView: {
    marginLeft: '10%',
    width: '80%',
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
  tableItemStyle: { 
    borderColor: '#AAAAAA',
    borderWidth: 1, 
    textAlign: 'center',
    textAlignVertical: 'center',
    minHeight: 50
  },
  line: {
    width: '100%',
    height: 5,
    backgroundColor: '#fff',
    marginVertical: 15
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
  },
  title: {
    fontSize: RFValue(18),
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
  bottomBar: {
    marginTop: RFValue(30),
    height: 5,
    backgroundColor: '#4f70ee1c',
    width: '100%',
    marginBottom : RFValue(20)
  },
  text: {
    fontSize: RFValue(14),
    color: 'black',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 30,
    width: '90%',
    marginLeft: '5%',
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
    width: '85%',
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
    marginVertical: 20
  },
  profileTitle: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: RFValue(14)
  },
  name: {
    fontSize: RFValue(14),
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#22138e',
    fontWeight: 'bold',
  },
  titles: {
    fontWeight: 'bold',
    fontSize: RFValue(16),
    lineHeight: 30,
    width: '35%'
  },
  row: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DBDBDB',
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
    height: '20%',
    padding: 20,
    borderBottomColor: '#c4c4c4',
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
  },
  content: {
    fontSize: RFValue(16),
    lineHeight: 30,
    width: '60%'
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
    paddingLeft: '5%'
  },
  filterbar:{
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '60%',
    borderRadius: 10,
    marginBottom: 10,
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
  searchText: {
    width: '70%',
    backgroundColor: 'white',
  },
  searchBtn: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: '#2a53c1',
    height: 30
  },
  filter: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  filterBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    gap: 5,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
  },
  head: {
    backgroundColor: '#7be6ff4f',
    height: 40,
  },
  tableText: {
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    textAlignVertical: 'center',
    borderWidth: 1, 
    borderColor: 'rgba(0, 0, 0, 0.08)',
    height: 40,
    paddingTop: 10
  },
  dropdown: {
    height: 40,
    width: '50%',
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  icon: {
    marginRight: 5,
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
  subtitle: {
    fontSize: RFValue(14),
    color: 'black',
    textAlign: 'left',
    paddingTop: 10,
    paddingBottom: 10
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
  inputs: {
    marginTop: 5,
    marginBottom: 20,
    height: 100,
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    backgroundColor: 'white'
  },
  input: {
    backgroundColor: 'white',
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  chooseFileinput: {
    backgroundColor: 'white', 
    height: 30, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: 'hsl(0, 0%, 86%)',
    paddingVertical: 5
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
});
