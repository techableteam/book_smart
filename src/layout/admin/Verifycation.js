import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, StatusBar, Modal, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import RNBlobUtil from "react-native-blob-util";
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import { getUserInfo, Update } from '../../utils/useApi';
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RadioGroup from 'react-native-radio-buttons-group';
import RNFS from 'react-native-fs'
import images from '../../assets/images';

const { width, height } = Dimensions.get('window');

export default function VerifyCation ({ navigation, route }) {
    const [loading, setLoading] = useState(false);
    const [sfileType, setFiletype] = useState('');
    const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);
    const { id } = route.params;
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

    const [driverLicense, setDriverLicense] = useState({ name: '', content: '', type: '' });
    const [driverLicenseStatus, setDriverLicenseStatus] = useState(0);
    const [driverLicenseUpload, setDriverLicenseUpload] = useState(false);
    const [driverLicenseUrl, setDriverLicenseUrl] = useState('');
    const [socialCard, setSocialCard] = useState({ name: '', content: '', type: '' });
    const [socialCardStatus, setSocialCardStatus] = useState(0);
    const [socialCardUpload, setSocialCardUpload] = useState(false);
    const [socialCardUrl, setSocialCardUrl] = useState('');
    const [physicalExam, setPhysicalExam] = useState({ name: '', content: '', type: '' });
    const [physicalExamStatus, setPhysicalExamStatus] = useState(0);
    const [physicalExamUpload, setPhysicalExamUpload] = useState(false);
    const [physicalExamUrl, setPhysicalExamUrl] = useState('');
    const [ppd, setPpd] = useState({ name: '', content: '', type: '' });
    const [ppdStatus, setPpdStatus] = useState(0);
    const [ppdUpload, setPpdUpload] = useState(false);
    const [ppdUrl, setPpdUrl] = useState('');
    const [mmr, setMmr] = useState({ name: '', content: '', type: '' });
    const [mmrStatus, setMmrStatus] = useState(0);
    const [mmrUpload, setMmrUpload] = useState(false);
    const [mmrUrl, setMmrUrl] = useState('');
    const [healthcareLicense, setHealthcareLicense] = useState({ name: '', content: '', type: '' });
    const [healthcareLicenseStatus, setHealthcareLicenseStatus] = useState(0);
    const [healthcareLicenseUpload, setHealthcareLicenseUpload] = useState(false);
    const [healthcareLicenseUrl, setHealthcareLicenseUrl] = useState('');
    const [resume, setResume] = useState({ name: '', content: '', type: '' });
    const [resumeStatus, setResumeStatus] = useState(0);
    const [resumeUpload, setResumeUpload] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('');
    const [covidCard, setCovidCard] = useState({ name: '', content: '', type: '' });
    const [covidCardStatus, setCovidCardStatus] = useState(0);
    const [covidCardUpload, setCovidCardUpload] = useState(false);
    const [covidCardUrl, setCovidCardUrl] = useState('');
    const [bls, setBls] = useState({ name: '', content: '', type: '' });
    const [blsStatus, setBlsStatus] = useState(0);
    const [blsUpload, setBlsUpload] = useState(false);
    const [blsUrl, setBlsUrl] = useState('');
    const [hepB, setHepB] = useState({ name: '', content: '', type: '' });
    const [hepBStatus, setHepBStatus] = useState(0);
    const [hepBUpload, setHepBUpload] = useState(false);
    const [hepBUrl, setHepBUrl] = useState('');
    const [flu, setFlu] = useState({ name: '', content: '', type: '' });
    const [fluStatus, setFluStatus] = useState(0);
    const [fluUpload, setFluUpload] = useState(false);
    const [fluUrl, setFluUrl] = useState('');
    const [cna, setCna] = useState({ name: '', content: '', type: '' });
    const [cnaStatus, setCnaStatus] = useState(0);
    const [cnaUpload, setCnaUpload] = useState(false);
    const [cnaUrl, setCnaUrl] = useState('');
    const [taxForm, setTaxForm] = useState({ name: '', content: '', type: '' });
    const [taxFormStatus, setTaxFormStatus] = useState(0);
    const [taxFormUpload, setTaxFormUpload] = useState(false);
    const [taxFormUrl, setTaxFormUrl] = useState('');
    const [chrc102, setChrc102] = useState({ name: '', content: '', type: '' });
    const [chrc102Status, setChrc102Status] = useState(0);
    const [chrc102Upload, setChrc102Upload] = useState(false);
    const [chrc102Url, setChrc102Url] = useState('');
    const [chrc103, setChrc103] = useState({ name: '', content: '', type: '' });
    const [chrc103Status, setChrc103Status] = useState(0);
    const [chrc103Upload, setChrc103Upload] = useState(false);
    const [chrc103Url, setChrc103Url] = useState('');
    const [drug, setDrug] = useState({ name: '', content: '', type: '' });
    const [drugStatus, setDrugStatus] = useState(0);
    const [drugUpload, setDrugUpload] = useState(false);
    const [drugUrl, setDrugUrl] = useState('');
    const [ssc, setSsc] = useState({ name: '', content: '', type: '' });
    const [sscStatus, setSscStatus] = useState(0);
    const [sscUpload, setSscUpload] = useState(false);
    const [sscUrl, setSscUrl] = useState('');
    const [copyOfTB, setCopyOfTB] = useState({ name: '', content: '', type: '' });
    const [copyOfTBStatus, setCopyOfTBStatus] = useState(0);
    const [copyOfTBUpload, setCopyOfTBUpload] = useState(false);
    const [copyOfTBUrl, setCopyOfTBUrl] = useState('');

    async function getData() {
        setLoading(true);
        let response = await getUserInfo({ userId: id }, 'clinical');

        if (!response?.error) {
            if (response.userData['driverLicense']) {
                setDriverLicense(response.userData['driverLicense']);
                setDriverLicenseStatus(response.userData['driverLicenseStatus'] === true ? 1 : 0);
            }
        
            if (response.userData['socialCard']) {
                setSocialCard(response.userData['socialCard']);
                setSocialCardStatus(response.userData['socialCardStatus'] == true ? 1 : 0);
            }
        
            if (response.userData['physicalExam']) {
                setPhysicalExam(response.userData['physicalExam']);
                setPhysicalExamStatus(response.userData['physicalExamStatus'] == true ? 1 : 0);
            }
        
            if (response.userData['ppd']) {
                setPpd(response.userData['ppd']);
                setPpdStatus(response.userData['ppdStatus'] == true ? 1 : 0);
            }
        
            if (response.userData['mmr']) {
                setMmr(response.userData['mmr']);
                setMmrStatus(response.userData['mmrStatus'] == true ? 1 : 0);
            }
        
            if (response.userData['healthcareLicense']) {
                setHealthcareLicense(response.userData['healthcareLicense']);
                setHealthcareLicenseStatus(response.userData['healthcareLicenseStatus'] == true ? 1 : 0);
            }
        
            if (response.userData['resume']) {
                setResume(response.userData['resume']);
                setResumeStatus(response.userData['resumeStatus'] == true ? 1 : 0);
            }
        
            if (response.userData['covidCard']) {
                setCovidCard(response.userData['covidCard']);
                setCovidCardStatus(response.userData['covidCardStatus'] == true ? 1 : 0);
            }
        
            if (response.userData['bls']) {
                setBls(response.userData['bls']);
                setBlsStatus(response.userData['blsStatus'] == true ? 1 : 0);
            }

            if (response.userData['hepB']) {
                setHepB(response.userData['hepB']);
                setHepBStatus(response.userData['hepBStatus'] == true ? 1 : 0);
            }

            if (response.userData['flu']) {
                setFlu(response.userData['flu']);
                setFluStatus(response.userData['fluStatus'] == true ? 1 : 0);
            }

            if (response.userData['cna']) {
                setCna(response.userData['cna']);
                setCnaStatus(response.userData['cnaStatus'] == true ? 1 : 0);
            }

            if (response.userData['taxForm']) {
                setTaxForm(response.userData['taxForm']);
                setTaxFormStatus(response.userData['taxFormStatus'] == true ? 1 : 0);
            }

            if (response.userData['chrc102']) {
                setChrc102(response.userData['chrc102']);
                setChrc102Status(response.userData['chrc102Status'] == true ? 1 : 0);
            }

            if (response.userData['chrc103']) {
                setChrc103(response.userData['chrc103']);
                setChrc103Status(response.userData['chrc103Status'] == true ? 1 : 0);
            }

            if (response.userData['drug']) {
                setDrug(response.userData['drug']);
                setDrugStatus(response.userData['drugStatus'] == true ? 1 : 0);
            }

            if (response.userData['ssc']) {
                setSsc(response.userData['ssc']);
                setSscStatus(response.userData['sscStatus'] == true ? 1 : 0);
            }

            if (response.userData['copyOfTB']) {
                setCopyOfTB(response.userData['copyOfTB']);
                setCopyOfTBStatus(response.userData['copyOfTBStatus'] == true ? 1 : 0);
            }
            setLoading(false);
        } else {
            setLoading(false);
        }
    };

    // useFocusEffect(
    //     React.useCallback(() => {
    //         getData();
    //     }, [])
    // );

    useEffect(() => {
        getData();
    }, []);

    const handleSendFile = async (target) => {
        let data = {};
        if (target == "driverLicense") {
            data = {
                driverLicense: driverLicense
            };
            setDriverLicenseUpload(false);
        } else if (target == "socialCard") {
            data = {
                socialCard: socialCard
            };
            setSocialCardUpload(false);
        } else if (target == "physicalExam") {
            data = {
                physicalExam: physicalExam
            };
            setPhysicalExamUpload(false);
        } else if (target == "ppd") {
            data = {
                ppd: ppd
            };
            setPpdUpload(false);
        } else if (target == "mmr") {
            data = {
                mmr: mmr
            };
            setMmrUpload(false);
        } else if (target == "healthcareLicense") {
            data = {
                healthcareLicense: healthcareLicense
            };
            setHealthcareLicenseUpload(false);
        } else if (target == "resume") {
            data = {
                resume: resume
            };
            setResumeUpload(false);
        } else if (target == "covidCard") {
            data = {
                covidCard: covidCard
            };
            setCovidCardUpload(false);
        } else if (target == "bls") {
            data = {
                bls: bls
            };
            setBlsUpload(false);
        } else if (target == "hepB") {
            data = {
                hepB: hepB
            };
            setHepBUpload(false);
        } else if (target == "flu") {
            data = {
                flu: flu
            };
            setFluUpload(false);
        } else if (target == "cna") {
            data = {
                cna: cna
            };
            setCnaUpload(false);
        } else if (target == "taxForm") {
            data = {
                taxForm: taxForm
            };
            setTaxFormUpload(false);
        } else if (target == "chrc102") {
            data = {
                chrc102: chrc102
            };
            setChrc102Upload(false);
        } else if (target == "chrc103") {
            data = {
                chrc103: chrc103
            };
            setChrc103Upload(false);
        } else if (target == "drug") {
            data = {
                drug: drug
            };
            setDrugUpload(false);
        } else if (target == "ssc") {
            data = {
                ssc: ssc
            };
            setSscUpload(false);
        } else if (target == "copyOfTB") {
            data = {
                copyOfTB: copyOfTB
            };
            setCopyOfTBUpload(false);
        }
    
        setLoading(true);
        try {
          const response = await Update(data, 'clinical');
          if (!response?.error) {
            console.log('successfully Updated');
            data = {};
            setLoading(false);
            Alert.alert(
                'Success!',
                'Updated',
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
            console.log('=====================');
            console.log(JSON.stringify(response.error));
          }
        } catch (error) {
          setLoading(false);
          console.error('Update failed: ', error)
        }
    };

    const handleCredentials = (target, e) => {
        if (target == "driverLicense") {
            setDriverLicense((prev) => ({ ...prev, ...e }));
            setDriverLicenseUpload(true);
        } else if (target == "socialCard") {
            setSocialCard((prev) => ({ ...prev, ...e }));
            setSocialCardUpload(true);
        } else if (target == "physicalExam") {
            setPhysicalExam((prev) => ({ ...prev, ...e }));
            setPhysicalExamUpload(true);
        } else if (target == "ppd") {
            setPpd((prev) => ({ ...prev, ...e }));
            setPpdUpload(true);
        } else if (target == "mmr") {
            setMmr((prev) => ({ ...prev, ...e }));
            setMmrUpload(true);
        } else if (target == "healthcareLicense") {
            setHealthcareLicense((prev) => ({ ...prev, ...e }));
            setHealthcareLicenseUpload(true);
        } else if (target == "resume") {
            setResume((prev) => ({ ...prev, ...e }));
            setResumeUpload(true);
        } else if (target == "covidCard") {
            setCovidCard((prev) => ({ ...prev, ...e }));
            setCovidCardUpload(true);
        } else if (target == "bls") {
            setBls((prev) => ({ ...prev, ...e }));
            setBlsUpload(true);
        } else if (target == "hepB") {
            setHepB((prev) => ({ ...prev, ...e }));
            setHepBUpload(true);
        } else if (target == "flu") {
            setFlu((prev) => ({ ...prev, ...e }));
            setFluUpload(true);
        } else if (target == "cna") {
            setCna((prev) => ({ ...prev, ...e }));
            setCnaUpload(true);
        } else if (target == "taxForm") {
            setTaxForm((prev) => ({ ...prev, ...e }));
            setTaxFormUpload(true);
        } else if (target == "chrc102") {
            setChrc102((prev) => ({ ...prev, ...e }));
            setChrc102Upload(true);
        } else if (target == "chrc103") {
            setChrc103((prev) => ({ ...prev, ...e }));
            setChrc103Upload(true);
        } else if (target == "drug") {
            setDrug((prev) => ({ ...prev, ...e }));
            setDrugUpload(true);
        } else if (target == "ssc") {
            setSsc((prev) => ({ ...prev, ...e }));
            setSscUpload(true);
        } else if (target == "copyOfTB") {
            setCopyOfTB((prev) => ({ ...prev, ...e }));
            setCopyOfTBUpload(true);
        }
    };

    const handleSetUrl = (target, e) => {
        if (target == "driverLicense") {
            setDriverLicenseUrl(e);
        } else if (target == "socialCard") {
            setSocialCardUrl(e);
        } else if (target == "physicalExam") {
            setPhysicalExamUrl(e);
        } else if (target == "ppd") {
            setPpdUrl(e);
        } else if (target == "mmr") {
            setMmrUrl(e);
        } else if (target == "healthcareLicense") {
            setHealthcareLicenseUrl(e);
        } else if (target == "resume") {
            setResumeUrl(e);
        } else if (target == "covidCard") {
            setCovidCardUrl(e);
        } else if (target == "bls") {
            setBlsUrl(e);
        } else if (target == "hepB") {
            setHepBUrl(e);
        } else if (target == "flu") {
            setFluUrl(e);
        } else if (target == "cna") {
            setCnaUrl(e);
        } else if (target == "taxForm") {
            setTaxFormUrl(e);
        } else if (target == "chrc102") {
            setChrc102Url(e);
        } else if (target == "chrc103") {
            setChrc103Url(e);
        } else if (target == "drug") {
            setDrugUrl(e);
        } else if (target == "ssc") {
            setSscUrl(e);
        } else if (target == "copyOfTB") {
            setCopyOfTBUrl(e);
        }
    };

    const toggleFileTypeSelectModal = () => {
        setFiletypeSelectModal(!fileTypeSelectModal);
    };

    const handleChangeFileType = (name) => {
        setFiletype(name);
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
                        [{
                            text: 'OK',
                            onPress: () => {
                                console.log('');
                            },
                        }],
                        { cancelable: false }
                    );
                    console.error('Camera error: ', response.error);
                } else if (response.customButton) {
                    console.log('User tapped custom button: ', response.customButton);
                } else if (response.errorCode) {
                    Alert.alert(
                        'Alert!',
                        'Camera errorCode: ', response.errorCode,
                        [{
                            text: 'OK',
                            onPress: () => {
                            console.log('');
                            },
                        }],
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
                    handleSetUrl(sfileType, fileUri);
                    toggleFileTypeSelectModal();
                }
            });
        } catch (err) {
            Alert.alert(
                'Alert!',
                'Camera Issue: ' + JSON.stringify(err),
                [{
                    text: 'OK',
                    onPress: () => {
                        console.log('');
                    },
                }],
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
                        [{
                            text: 'OK',
                            onPress: () => {
                            console.log('');
                            },
                        }],
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
                    handleSetUrl(sfileType, pickedImage);
                    toggleFileTypeSelectModal();
                } else {
                    Alert.alert(
                        'Alert!',
                        'ImagePicker Issue: ' + JSON.stringify(response),
                        [{
                            text: 'OK',
                            onPress: () => {
                            console.log('');
                            },
                        }],
                        { cancelable: false }
                    );
                }
            });
        } catch (err) {
            Alert.alert(
                'Alert!',
                'Camera Issue: ' + JSON.stringify(err),
                [{
                    text: 'OK',
                    onPress: () => {
                        console.log('');
                    },
                }],
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

            if (res[0].uri.startsWith("content://")) {
                const targetPath = `${RNBlobUtil.fs.dirs.DocumentDir}/${res[0].name}`;

                RNBlobUtil.fs
                    .cp(uri, targetPath)
                    .then(() => {
                        handleSetUrl(sfileType, targetPath)
                    })
                    .catch((err) => {
                        console.error("Error copying file:", err);
                    });
            } else {
                handleSetUrl(sfileType, res[0].uri)
            }
            handleCredentials(sfileType, { content: `${fileContent}`, type: fileType, name: res[0].name });
            
            toggleFileTypeSelectModal();
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                // Handle other errors
            }
        }
    };

    const handleBack = () => {
        navigation.navigate('AllCaregivers');
    };

    const handleShowFile = (data) => {
        navigation.navigate("UserFileViewer", { userId: id, filename: data });
    };
    
    const handleFileViewer = (target, data) => {
        let content = '';
        if (target == "driverLicense") {
            content = driverLicenseUrl;
        } else if (target == "socialCard") {
            content = socialCardUrl
        } else if (target == "physicalExam") {
            content = physicalExamUrl;
        } else if (target == "ppd") {
            content = ppdUrl;
        } else if (target == "mmr") {
            content = mmrUrl;
        } else if (target == "healthcareLicense") {
            content = healthcareLicenseUrl;
        } else if (target == "resume") {
            content = resumeUrl;
        } else if (target == "covidCard") {
            content = covidCardUrl;
        } else if (target == "bls") {
            content = blsUrl;
        } else if (target == "hepB") {
            content = hepBUrl;
        } else if (target == "flu") {
            content = fluUrl;
        } else if (target == "cna") {
            content = cnaUrl;
        } else if (target == "taxForm") {
            content = taxFormUrl;
        } else if (target == "chrc102") {
            content = chrc102Url;
        } else if (target == "chrc103") {
            content = chrc103Url;
        } else if (target == "drug") {
            content = drugUrl;
        } else if (target == "ssc") {
            content = sscUrl;
        } else if (target == "copyOfTB") {
            content = copyOfTBUrl;
        }

        if (content == "") {
            content = data.content;
        }
        navigation.navigate("FileViewer", { jobId: '', fileData: { name: data.name, type: data.type, content: content } });
    };

    const handleRemove = (target) => {
        if (target == "driverLicense") {
            setDriverLicense({ content: '', name: '', type: '' });
            setDriverLicenseUpload(false);
        } else if (target == "socialCard") {
            setSocialCard({ content: '', name: '', type: '' });
            setSocialCardUpload(false);
        } else if (target == "physicalExam") {
            setPhysicalExam({ content: '', name: '', type: '' });
            setPhysicalExamUpload(false);
        } else if (target == "ppd") {
            setPpd({ content: '', name: '', type: '' });
            setPpdUpload(false);
        } else if (target == "mmr") {
            setMmr({ content: '', name: '', type: '' });
            setMmrUpload(false);
        } else if (target == "healthcareLicense") {
            setHealthcareLicense({ content: '', name: '', type: '' });
            setHealthcareLicenseUpload(false);
        } else if (target == "resume") {
            setResume({ content: '', name: '', type: '' });
            setResumeUpload(false);
        } else if (target == "covidCard") {
            setCovidCard({ content: '', name: '', type: '' });
            setCovidCardUpload(false);
        } else if (target == "bls") {
            setBls({ content: '', name: '', type: '' });
            setBlsUpload(false);
        } else if (target == "hepB") {
            setHepB({ content: '', name: '', type: '' });
            setHepBUpload(false);
        } else if (target == "flu") {
            setFlu({ content: '', name: '', type: '' });
            setFluUpload(false);
        } else if (target == "cna") {
            setCna({ content: '', name: '', type: '' });
            setCnaUpload(false);
        } else if (target == "taxForm") {
            setTaxForm({ content: '', name: '', type: '' });
            setTaxFormUpload(false);
        } else if (target == "chrc102") {
            setChrc102({ content: '', name: '', type: '' });
            setChrc102Upload(false);
        } else if (target == "chrc103") {
            setChrc103({ content: '', name: '', type: '' });
            setChrc103Upload(false);
        } else if (target == "drug") {
            setDrug({ content: '', name: '', type: '' });
            setDrugUpload(false);
        } else if (target == "ssc") {
            setSsc({ content: '', name: '', type: '' });
            setSscUpload(false);
        } else if (target == "copyOfTB") {
            setCopyOfTB({ content: '', name: '', type: '' });
            setCopyOfTBUpload(false);
        }
    };

    const handleUpdate = async (target, e) => {
        Alert.alert('Alert!', 'Are you sure you want to update this?', [
            {
                text: 'OK',
                onPress: async () => {
                    let data = {};
                    if (target == "driverLicense") {
                        data = {
                            driverLicenseStatus: e
                        };
                        setDriverLicenseStatus(e);
                    } else if (target == "socialCard") {
                        data = {
                            socialCardStatus: e
                        };
                        setSocialCardStatus(e);
                    } else if (target == "physicalExam") {
                        data = {
                            physicalExamStatus: e
                        };
                        setPhysicalExamStatus(e);
                    } else if (target == "ppd") {
                        data = {
                            ppdStatus: e
                        };
                        setPpdStatus(e);
                    } else if (target == "mmr") {
                        data = {
                            mmrStatus: e
                        };
                        setMmrStatus(e);
                    } else if (target == "healthcareLicense") {
                        data = {
                            healthcareLicenseStatus: e
                        };
                        setHealthcareLicenseStatus(e);
                    } else if (target == "resume") {
                        data = {
                            resumeStatus: e
                        };
                        setResumeStatus(e);
                    } else if (target == "covidCard") {
                        data = {
                            covidCardStatus: e
                        };
                        setCovidCardStatus(e);
                    } else if (target == "bls") {
                        data = {
                            blsStatus: e
                        };
                        setBlsStatus(e);
                    } else if (target == "hepB") {
                        data = {
                            hepBStatus: e
                        };
                        setHepBStatus(e);
                    } else if (target == "flu") {
                        data = {
                            fluStatus: e
                        };
                        setFluStatus(e);
                    } else if (target == "cna") {
                        data = {
                            cnaStatus: e
                        };
                        setCnaStatus(e);
                    } else if (target == "taxForm") {
                        data = {
                            taxFormStatus: e
                        };
                        setTaxFormStatus(e);
                    } else if (target == "chrc102") {
                        data = {
                            chrc102Status: e
                        };
                        setChrc102Status(e);
                    } else if (target == "chrc103") {
                        data = {
                            chrc103Status: e
                        };
                        setChrc103Status(e);
                    } else if (target == "drug") {
                        data = {
                            drugStatus: e
                        };
                        setDrugStatus(e);
                    } else if (target == "ssc") {
                        data = {
                            sscStatus: e
                        };
                        setSscStatus(e);
                    } else if (target == "copyOfTB") {
                        data = {
                            copyOfTBStatus: e
                        };
                        setCopyOfTBStatus(e);
                    }
                    setLoading(true);
                    try {
                        const response = await Update(data, 'clinical');
                        if (!response?.error) {
                            console.log('successfully Updated');
                            data = {};
                            setLoading(false);
                            Alert.alert(
                                'Success!',
                                'Updated',
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
                            console.log('=====================');
                            console.log(JSON.stringify(response.error));
                        }
                    } catch (error) {
                        setLoading(false);
                        console.error('Update failed: ', error)
                    }
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent"/>
            <MHeader navigation={navigation} />
            <ScrollView style={{width: '100%', marginTop: height * 0.15}} showsVerticalScrollIndicator={false}>
                <View style={[styles.modal, { paddingHorizontal: '5%' }]}>
                    <View style={{flexDirection: 'row',  width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <View style={[styles.profileTitleBg, { marginLeft: 0, marginTop: 30 }]}>
                            <Text style={[styles.profileTitle, { fontSize: RFValue(12) }]}>🖥️ CAREGIVER DOCUMENTS</Text>
                        </View>
                    </View>

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={1}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Driver's License</Text>
                        {driverLicense.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (driverLicense.content != "") {
                                            handleFileViewer('driverLicense', driverLicense);
                                        } else {
                                            handleShowFile('driverLicense');
                                        }
                                    }}
                                >{driverLicense.name}</Text>
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
                                value={driverLicense.name || ''}
                            />
                        </View>
                        <View>
                        {driverLicenseUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('driverLicense')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Driver's License - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('driverLicense', val)}
                            selectedId={driverLicenseStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={2}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Social Security Card</Text>
                        {socialCard.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (socialCard.content != "") {
                                        handleFileViewer('socialCard', socialCard);
                                        } else {
                                        handleShowFile('socialCard');
                                        }
                                    }}
                                >{socialCard.name}</Text>
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
                                value={socialCard.name || ''}
                            />
                        </View>
                        <View>
                        {socialCardUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('socialCard')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Social Security Card - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('socialCard', val)}
                            selectedId={socialCardStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={3}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Physical Exam</Text>
                        {physicalExam.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (physicalExam.content != "") {
                                        handleFileViewer('physicalExam', physicalExam);
                                        } else {
                                        handleShowFile('physicalExam');
                                        }
                                    }}
                                >{physicalExam.name}</Text>
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
                                value={physicalExam.name || ''}
                            />
                        </View>
                        <View>
                            {physicalExamUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('physicalExam')} style={styles.saveFile}>
                                <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Physical Exam - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('physicalExam', val)}
                            selectedId={physicalExamStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={4}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>PPD (TB Test)</Text>
                        {ppd.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (ppd.content != "") {
                                        handleFileViewer('ppd', ppd);
                                        } else {
                                        handleShowFile('ppd');
                                        }
                                    }}
                                >{ppd.name}</Text>
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
                                value={ppd.name || ''}
                            />
                        </View>
                        <View>
                        {ppdUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('ppd')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>PPD (TB Test) - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('ppd', val)}
                            selectedId={ppdStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={5}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>MMR (Immunizations)</Text>
                        {mmr.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (mmr.content != "") {
                                        handleFileViewer('mmr', mmr);
                                        } else {
                                        handleShowFile('mmr');
                                        }
                                    }}
                                >{mmr.name}</Text>
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
                                value={mmr.name || ''}
                            />
                        </View>
                        <View>
                        {mmrUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('mmr')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>MMR (Immunizations) - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('mmr', val)}
                            selectedId={mmrStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={6}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Healthcare License</Text>
                        {healthcareLicense.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (healthcareLicense.content != "") {
                                        handleFileViewer('healthcareLicense', healthcareLicense);
                                        } else {
                                        handleShowFile('healthcareLicense');
                                        }
                                    }}
                                >{healthcareLicense.name}</Text>
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
                                value={healthcareLicense.name || ''}
                            />
                        </View>
                        <View>
                        {healthcareLicenseUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('healthcareLicense')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Healthcare License - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('healthcareLicense', val)}
                            selectedId={healthcareLicenseStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={7}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Resume</Text>
                        {resume.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (resume.content != "") {
                                        handleFileViewer('resume', resume);
                                        } else {
                                        handleShowFile('resume');
                                        }
                                    }}
                                >{resume.name}</Text>
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
                                value={resume.name || ''}
                            />
                        </View>
                        <View>
                        {resumeUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('resume')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Resume - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('resume', val)}
                            selectedId={resumeStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={8}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>COVID Card</Text>
                        {covidCard.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (covidCard.content != "") {
                                        handleFileViewer('covidCard', covidCard);
                                        } else {
                                        handleShowFile('covidCard');
                                        }
                                    }}
                                >{covidCard.name}</Text>
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
                                value={covidCard.name || ''}
                            />
                        </View>
                        <View>
                        {covidCardUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('covidCard')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>COVID Card - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('covidCard', val)}
                            selectedId={covidCardStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={9}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>BLS (CPR card)</Text>
                        {bls.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (bls.content != "") {
                                        handleFileViewer('bls', bls);
                                        } else {
                                        handleShowFile('bls');
                                        }
                                    }}
                                >{bls.name}</Text>
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
                                value={bls.name || ''}
                            />
                        </View>
                        <View>
                        {blsUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('bls')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>BLS (CPR card) - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('bls', val)}
                            selectedId={blsStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={10}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Hep B (shot or declination)</Text>
                        {hepB.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (hepB.content != "") {
                                        handleFileViewer('hepB', hepB);
                                        } else {
                                        handleShowFile('hepB');
                                        }
                                    }}
                                >{hepB.name}</Text>
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
                                value={hepB.name || ''}
                            />
                        </View>
                        <View>
                        {hepBUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('hepB')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Hep B (shot or declination) - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('hepB', val)}
                            selectedId={hepBStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={11}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Flu (shot or declination)</Text>
                        {flu.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (flu.content != "") {
                                        handleFileViewer('flu', flu);
                                        } else {
                                        handleShowFile('flu');
                                        }
                                    }}
                                >{flu.name}</Text>
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
                                value={flu.name || ''}
                            />
                        </View>
                        <View>
                        {fluUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('flu')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Flu (shot or declination) - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('flu', val)}
                            selectedId={fluStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={12}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>CNA Certificate or LPN/RN License</Text>
                        {cna.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (cna.content != "") {
                                        handleFileViewer('cna', cna);
                                        } else {
                                        handleShowFile('cna');
                                        }
                                    }}
                                >{cna.name}</Text>
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
                                value={cna.name || ''}
                            />
                        </View>
                        <View>
                        {cnaUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('cna')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>CNA Certificate or LPN/RN License - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('cna', val)}
                            selectedId={cnaStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={13}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Tax Form</Text>
                        {taxForm.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (taxForm.content != "") {
                                        handleFileViewer('taxForm', taxForm);
                                        } else {
                                        handleShowFile('taxForm');
                                        }
                                    }}
                                >{taxForm.name}</Text>
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
                                value={taxForm.name || ''}
                            />
                        </View>
                        <View>
                        {taxFormUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('taxForm')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Tax Form - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('taxForm', val)}
                            selectedId={taxFormStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={14}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>CHRC 102 Form</Text>
                        {chrc102.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (chrc102.content != "") {
                                        handleFileViewer('chrc102', chrc102);
                                        } else {
                                        handleShowFile('chrc102');
                                        }
                                    }}
                                >{chrc102.name}</Text>
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
                                value={chrc102.name || ''}
                            />
                        </View>
                        <View>
                        {chrc102Upload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('chrc102')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>CHRC 102 Form - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('chrc102', val)}
                            selectedId={chrc102Status}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={15}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>CHRC 103 Form</Text>
                        {chrc103.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (chrc103.content != "") {
                                        handleFileViewer('chrc103', chrc103);
                                        } else {
                                        handleShowFile('chrc103');
                                        }
                                    }}
                                >{chrc103.name}</Text>
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
                                value={chrc103.name || ''}
                            />
                        </View>
                        <View>
                        {chrc103Upload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('chrc103')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>CHRC 103 Form - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('chrc103', val)}
                            selectedId={chrc103Status}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={16}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Drug Test</Text>
                        {drug.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (drug.content != "") {
                                        handleFileViewer('drug', drug);
                                        } else {
                                        handleShowFile('drug');
                                        }
                                    }}
                                >{drug.name}</Text>
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
                                value={drug.name || ''}
                            />
                        </View>
                        <View>
                        {drugUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('drug')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Drug Test - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('drug', val)}
                            selectedId={drugStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={17}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Standard State Criminal</Text>
                        {ssc.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (ssc.content != "") {
                                        handleFileViewer('ssc', ssc);
                                        } else {
                                        handleShowFile('ssc');
                                        }
                                    }}
                                >{ssc.name}</Text>
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
                                value={ssc.name || ''}
                            />
                        </View>
                        <View>
                        {sscUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('ssc')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Standard State Criminal - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('ssc', val)}
                            selectedId={sscStatus}
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

                    <View style={{flexDirection: 'column', width: '100%', gap: 10}} key={18}>
                        <Text style={{fontWeight: 'bold', fontSize: RFValue(16), lineHeight: 30, marginBottom: 5, backgroundColor: '#F7F70059'}}>Copy Of TB Test</Text>
                        {copyOfTB.name != "" && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: 'auto' }]} 
                                    onPress={() => { 
                                        if (copyOfTB.content != "") {
                                        handleFileViewer('copyOfTB', copyOfTB);
                                        } else {
                                        handleShowFile('copyOfTB');
                                        }
                                    }}
                                >{copyOfTB.name}</Text>
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
                                value={copyOfTB.name || ''}
                            />
                        </View>
                        <View>
                        {copyOfTBUpload && <TouchableOpacity title="Select File" onPress={() => handleSendFile('copyOfTB')} style={styles.saveFile}>
                            <Text style={styles.saveFileBtn}>Save</Text>
                            </TouchableOpacity>}
                        </View>
                        <Text style={[styles.titles, { marginBottom: 5, width: '100%' }]}>Copy Of TB Test - Verified?</Text>
                        <RadioGroup 
                            radioButtons={radioButtons} 
                            onPress={(val) => handleUpdate('copyOfTB', val)}
                            selectedId={copyOfTBStatus}
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

                    <View>
                        <Text style={{ textDecorationLine: 'underline', color: '#2a53c1', marginBottom: 20 }} onPress={handleBack} >
                            Back to 🏚️ All Caregiver
                        </Text>
                    </View>
                </View>
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
                            <View style={styles.body}>
                            <View style={[styles.modalBody, { marginBottom: 20 }]}>
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
            </ScrollView>
            <MFooter />
            <Loader visible={loading} />
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
      borderRadius: 10,
      backgroundColor: 'red',
      padding: 20,
    },
    container: {
      marginBottom: 0,
      backgroundColor: 'rgba(155, 155, 155, 0.61))'
    },
    scroll: {
      marginTop: height * 0.15,
    },
    backTitle: {
      backgroundColor: 'black',
      width: '90%',
      height: 55,
      marginLeft: '5%',
      position: 'absolute',
      marginTop: 10,
      borderRadius: 10
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
    line: {
        width: '100%',
        height: 5,
        marginVertical: 15
    },
    title: {
      fontSize: RFValue(20),
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 10,
      marginLeft: '5%',
      padding: 15,
      width: '90%',
      backgroundColor: 'transparent'
    },
    marker: {
      width: 5,
      height: 5,
      borderRadius: 5,
      backgroundColor: 'white',
      borderColor: 'black',
      borderWidth: 1,
      marginRight: 10,
      marginTop: 17
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
      backgroundColor: '#ffffffa8',
    },
    intro: {
      marginTop: 30,
      paddingHorizontal: 20,
      marginBottom: 20
    },
    input: {
        backgroundColor: 'white', 
        height: 40, 
        marginBottom: 10, 
        borderWidth: 1, 
        borderColor: 'hsl(0, 0%, 86%)',
    },
    saveFile: {
        width: 80, 
        height: 25, 
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: 'black'
    },
    saveFileBtn: {
        fontWeight: '400', 
        padding: 0, 
        fontSize: RFValue(9), 
        color: 'black',
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
      fontSize: RFValue(18),
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
    },
    buttonWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 130
    },
    btn: {
      flexDirection: 'column',
      gap: 20,
      marginBottom: 30,
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
    modalBody: {
      backgroundColor: '#e3f2f1',
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
      height: '20%',
      padding: 20,
      borderBottomColor: '#c4c4c4',
      borderBottomWidth: 1,
    },
    headerText: {
      fontSize: RFValue(18),
      fontWeight: 'bold',
      color: 'black'
    },
    textStyle: {
      color: 'black'
    },
    closeButton: {
      color: 'red',
    },
    body: {
      marginTop: 10,
      paddingHorizontal:20,
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
});
  