import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import { Dimensions } from 'react-native';
import Loader from '../Loader';
import HButton from '../../components/Hbutton';
import { RFValue } from 'react-native-responsive-fontsize';
import { PostBid } from '../../utils/useApi';

const { width, height } = Dimensions.get('window');

export default function BookShiftsNow ({ navigation, route }) {
    const [content, setContent] = useState('');
    const [bidsubmit, setBidsubmit] = useState(false); 
    const { modalData, aic, firstName, lastName } = route.params;

    const handleBack = () => {
        navigation.navigate("ShiftListing");
    };

    const handleSubmit = async (id) => {
        setBidsubmit(true);
        const bidData = { jobId: id[0].content, message: content, caregiver: `${firstName} ${lastName}`, caregiverId: aic }
        console.log(bidData);
        let response = await PostBid(bidData, 'bids');
    
        if (!response?.error) {
            setBidsubmit(false);
            Alert.alert(
                'Success!',
                response?.message,
                [{
                    text: 'OK',
                    onPress: () => {
                        setContent('');
                        handleBack();
                    }
                }],
                { cancelable: false }
            );
        } else {
            setBidsubmit(false);
            Alert.alert(
                'Failed!',
                "",
                [{
                    text: 'OK',
                    onPress: () => {
                        console.log('OK pressed')
                    },
                }],
                { cancelable: false }
            );
        }
    };    

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.containerBody}
        >
            <View style={styles.container}>
                <StatusBar translucent backgroundColor="transparent"/>
                <MHeader navigation={navigation} back={true} />
                <SubNavbar navigation={navigation} name={'ClientSignIn'}/>
                <ScrollView
                    style={{width: '100%', marginTop: height * 0.22}}
                    showsVerticalScrollIndicator={false}
                    automaticallyAdjustKeyboardInsets={true}
                >
                    <View style={styles.body}>
                        <TouchableOpacity style={[styles.backBtn, { width: '100%' }]} onPress={handleBack}>
                            <Text style={[styles.profileTitle, { textAlign: 'center' }]}>Back to Job / Shift Listings {'>'}</Text>
                        </TouchableOpacity>
                        <View style={styles.modalBody}>
                            {modalData.map((item, index) => 
                                <View key={index} style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
                                    <Text style={[styles.titles, { backgroundColor: '#f2f2f2', marginBottom: 5, paddingLeft: 2 }]}>{item.title}</Text>
                                    <Text style={styles.content}>{item.content}</Text>
                                </View>
                            )}
                        </View>
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
                        <View style={[styles.btn, { marginTop: RFValue(20) }]}>
                            <HButton style={styles.subBtn} onPress={()=> handleSubmit(modalData) }>
                                Submit
                            </HButton>
                        </View>
                    </View>
                </ScrollView>
                <Loader visible={bidsubmit}/>
                <MFooter />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    containerBody: {
        flex: 1
    },
    container: {
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        width: '100%'
    },
    body: {
        paddingHorizontal: 30,
        paddingVertical: 30,
        marginBottom: 50
    },
    topView: {
        marginTop: 10,
        marginLeft: '10%',
        width: '80%',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'center'
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
    backBtn: {
        padding: RFValue(10),
        width: '80%',
        justifyContent: 'flex-start',
        borderColor: '#ffaa22',
        borderWidth: 2,
        borderRadius: RFValue(20),
        marginBottom: RFValue(10),
        backgroundColor: '#194f69'
    },
    profileTitle: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: RFValue(16)
    },
    modalBody: {
        backgroundColor: '#dcd6fa',
        borderRadius: 10,
        borderColor: '#c6c5c5',
        borderWidth: 2,
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    titles: {
        fontWeight: 'bold',
        fontSize: RFValue(16),
        lineHeight: RFValue(30),
        width: '40%'
    },
    content: {
        fontSize: RFValue(16),
        lineHeight: RFValue(30),
    },
    text: {
        fontSize: RFValue(12),
        color: 'black',
        marginTop: RFValue(30),
        width: '100%'
    },
    inputs: {
        marginTop: 5,
        marginBottom: 0,
        height: 100,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        backgroundColor: 'white'
    },
    btn: {
        flexDirection: 'column',
        gap: 20,
        marginBottom: 30,
    },
    subBtn: {
        marginTop: 0,
        padding: RFValue(10),
        backgroundColor: '#A020F0',
        color: 'white',
        fontSize: RFValue(16),
    },
});
