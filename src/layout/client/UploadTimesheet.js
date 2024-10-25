import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Text, Alert, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import images from '../../assets/images';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs'
import Loader from '../Loader';
import HButton from '../../components/Hbutton';
import { updateTimeSheet } from '../../utils/useApi';
import { RFValue } from 'react-native-responsive-fontsize';

export default function UploadTimesheet ({ navigation, route }) {
    const { detailInfo, fileData } = route.params;
    const [detailedInfos, setDetailedInfos] = useState(detailInfo);
    const [fileTypeSelectModal, setFiletypeSelectModal] = useState(false);
    const [submitData, setSubmitData] = useState(fileData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setDetailedInfos(detailInfo);
        setSubmitData(fileData)
    }, []);

    const handleBack = () => {
        navigation.navigate('Shift');
    };

    const handleShowFile = (data) => {
        const jobIdObject = data.find(item => item.title === 'Job-ID');
        const jobId = jobIdObject ? jobIdObject.content : null;
        navigation.navigate("FileViewer", { jobId: jobId, fileData: '' });
    };

    const handleDelete = () => {
        setDetailedInfos(prevUploadInfo => {
            return prevUploadInfo.map((item, index) => {
                if (index === 2) {
                    return { ...item, content: '' };
                }
                return item;
            });
        });
    };

    const handleUploadSubmit = async () => {
        setLoading(true);
        const data = {jobId: submitData.jobId, timeSheet: submitData.timeSheet};
        if (submitData.timeSheet?.name != '') {
            const response = await updateTimeSheet(data, 'jobs');
            setLoading(false);
            if (!response?.error) {
                Alert.alert(
                    'Success!',
                    'Your timesheet has been submitted',
                    [
                        {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate('Shift');
                        },
                        }
                    ],
                    { cancelable: false }
                );
            } else {
                Alert.alert(
                    'Failure!',
                    'Pleae try later',
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
        } else {
            setLoading(false);
            Alert.alert(
                'Failure!',
                'Please upload documentation',
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

    const toggleFileTypeSelectModal = () => {
        setFiletypeSelectModal(!fileTypeSelectModal);
    };

    const openCamera = async () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        try {
            launchCamera(options, async (response) => {
                if (response.didCancel) {
                    console.log('User cancelled camera');
                } else if (response.error) {
                    Alert.alert(
                        'Alert!',
                        'Camera error: ' + response.error,
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
                    console.log('Camera error: ', response.error);
                } else if (response.customButton) {
                    console.log('User tapped custom button: ', response.customButton);
                } else if (response.errorCode) {
                    Alert.alert(
                        'Alert!',
                        'Camera errorCode: ' + response.errorCode,
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
                
                    setSubmitData({
                        ...submitData,
                        timeSheet: {
                            content: fileContent,
                            type: 'image',
                            name: response.assets[0].fileName,
                        }
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
            mediaType: 'photo',
            quality: 1,
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
                    
                    setSubmitData({
                        ...submitData,
                        timeSheet: {
                            content: fileContent,
                            type: 'image',
                            name: response.assets[0].fileName,
                        }
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

            setSubmitData({...submitData, timeSheet: {content: fileContent, type: fileType, name: res[0].name}});
            toggleFileTypeSelectModal();
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log('document picker cancelled');
            } else {
                console.log('document picker error: ', err);
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            <MHeader navigation={navigation} />
            <SubNavbar navigation={navigation} name={'ClientSignIn'}/>
            <ScrollView style={{width: '100%', marginTop: 160}} showsVerticalScrollIndicator={false} >
                <View style={styles.modal}>
                    <View style= {{width: '100%', marginTop: RFValue(20), paddingHorizontal : RFValue(50)}}>
                        <Text style={styles.headBar}>Upload TimeSheet</Text>
                    </View>
                    <View style={{ marginHorizontal: 20, marginBottom: 30 }}>
                        <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                            <Text style={[styles.titles, {marginBottom: 5, lineHeight: 20, marginTop: 20, paddingLeft: 2}]}>{detailedInfos[0]?.title}</Text>
                            <Text style={[styles.content, {lineHeight: 20, marginTop: 0}]}>{detailedInfos[0]?.content}</Text>
                        </View>
                        <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                            <Text style={[styles.titles, {marginBottom: 5, lineHeight: 20, marginTop: 20, paddingLeft: 2}]}>{detailedInfos[1]?.title}</Text>
                            <Text style={[styles.content, {lineHeight: 20, marginTop: 0}]}>{detailedInfos[1]?.content}</Text>
                        </View>
                        <View style={{flexDirection: 'column', width: '100%', gap: 10}}>
                            <Text style={[styles.titles, {marginBottom: 5, lineHeight: 20, marginTop: 20, paddingLeft: 2}]}>{detailedInfos[2]?.title}</Text>
                            {detailedInfos[2]?.content && 
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.content, { lineHeight: 20, marginTop: 0, color: 'blue', width: '80%' }]} onPress={() => { handleShowFile(detailedInfos); }}>{detailedInfos[2]?.content}</Text>
                                <Text style={{color: 'blue'}} onPress= {handleDelete}>&nbsp;&nbsp;remove</Text>
                            </View>}
                        </View>
                        <View style={{flexDirection: 'row', width: '100%', marginTop: 20}}>
                            <TouchableOpacity title="Select File" onPress={toggleFileTypeSelectModal} style={styles.chooseFile}>
                                <Text style={{fontWeight: '400', padding: 0, color:'black', fontSize: RFValue(12)}}>Choose File</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.input, {width: '70%', color: 'black'}]}
                                placeholder=""
                                autoCorrect={false}
                                autoCapitalize="none"
                                value={submitData?.timeSheet?.name || ''}
                            />
                        </View>
                        <View style={[styles.btn, {marginTop: RFValue(20)}]}>
                            <HButton style={styles.subBtn} onPress={handleUploadSubmit }>
                                Submit
                            </HButton>
                        </View>
                        <Text
                            style={{textDecorationLine: 'underline', color: '#2a53c1', marginTop: RFValue(20), fontSize: RFValue(14), textAlign: 'left', width: '90%'}}
                            onPress={handleBack}
                        >
                            Back to My Shift
                        </Text>
                    </View>
                </View>
            </ScrollView>
            {fileTypeSelectModal && 
                <Modal
                    visible={true}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => {
                        setFiletypeSelectModal(false);
                    }}
                >
                    <StatusBar translucent backgroundColor='transparent' />
                    <ScrollView style={styles.modalsContainer} showsVerticalScrollIndicator={false}>
                        <View style={[styles.viewContainer, { marginTop: '1%' }]}>
                            <View style={[styles.header, { height: RFValue(100) }]}>
                                <Text style={styles.headerText}>Choose File</Text>
                                <TouchableOpacity style={styles.modalClose} onPress={toggleFileTypeSelectModal}>
                                    <Image source={images.close} style={styles.modalClose} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.body}>
                                <View style={[styles.modalBody, { marginBottom: 20 }]}>
                                    <View style={styles.cameraContain}>
                                    <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={openCamera}>
                                        <Image source={images.camera} style={styles.modalImage} />
                                        <Text style={styles.textStyle}>Camera</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={pickGallery}>
                                        <Image source={images.gallery} style={styles.modalImage} />
                                        <Text style={styles.textStyle}>Gallery</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.5} style={styles.btnSheet} onPress={pickFile}>
                                        <Image source={images.folder} style={styles.modalImage} />
                                        <Text style={styles.textStyle}>Folder</Text>
                                    </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </Modal>}
                <Loader visible={loading}/>
            <MFooter />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%'
    },
    modal: {
        width: '90%',
        borderRadius: RFValue(10),
        margin: '5%',
        marginBottom: RFValue(100),
        borderWidth: 1,
        borderColor: 'grey',
        overflow: 'hidden',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 0,
        backgroundColor: "#dcd6fa",
    },
    modalImage : {
        width: RFValue(50), 
        height: RFValue(50)
    },

    modalClose : {
        width: RFValue(20), 
        height: RFValue(20)
    },

    textStyle : {
        color: 'black',
        fontSize : RFValue(14)
    },
    headBar: {
        textAlign: 'center',
        backgroundColor: '#BC222F',
        color: 'white',
        paddingVertical: 10,
        borderRadius: 10,
        fontSize: 18,
        fontWeight: 'bold'
    },
    titles: {
        fontWeight: 'bold',
        fontSize: RFValue(18),
        lineHeight: RFValue(30),
        width: '40%',
        color: "black"
    },
    content: {
        fontSize: RFValue(16),
        lineHeight: RFValue(30),
        width: '60%',
        color: "black"
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
        borderColor: 'black',
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
        color: 'black',
        fontWeight: 'bold',
    },
    closeButton: {
        color: 'red',
    },
    body: {
        marginTop: 10,
        paddingHorizontal:20,
    },
    modalBody: {
        backgroundColor: '#dcd6fa',
        borderRadius: 10,
        borderColor: '#c6c5c5',
        borderWidth: 2,
        paddingHorizontal: 20,
        paddingVertical: 20
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
    subBtn: {
        marginTop: RFValue(10),
        padding: RFValue(10),
        backgroundColor: '#A020F0',
        color: 'white',
        fontSize: RFValue(16),
    },
    btnSheet: {
        height: RFValue(100),
        width: RFValue(100),
        justifyContent: "center",
        alignItems: "center",
        borderRadius: RFValue(10),
        shadowOpacity: 0.5,
        shadowRadius: 10,
        margin: 5,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        marginVertical: RFValue(14),
        padding: 5,
    }
});
  