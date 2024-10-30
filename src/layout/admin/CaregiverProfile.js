import React, { useState } from 'react';
import { View, Image, StyleSheet, ScrollView, StatusBar, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import { getClientInfoWithJobId } from '../../utils/useApi';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function CaregiverProfile({ navigation, route }) {
    const { id } = route.params;
    const [userInfo, setUserInfo] = useState({});
    const default_image = 'https://s3.amazonaws.com/assets.knackhq.com/assets/6605fd227f7c6e0027a2c623/66df2fef02a9740307513f2d/thumb_6/nurse.png';

    async function getData() {
        let data = await getClientInfoWithJobId({ bidId: id }, 'clinical');
        console.log('client infomation -> ', data);
        if (data?.error) {
            setUserInfo({});
        } else {
            setUserInfo(data);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            getData();
        }, [])
    );

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            <MHeader navigation={navigation} />
            <SubNavbar navigation={navigation} name={'ClientSignIn'} />
            <ScrollView style={{ width: '100%', marginTop: height * 0.25 }} showsVerticalScrollIndicator={false} >

                <View style = {{ flex:1, justifyContent:'center', alignItems: 'center', width: '100%' }}>

                    <View style={styles.profile}>
                        <View style={styles.profileTitleBg}>
                            <Text style={styles.profileTitle}>🖥️CAREGIVER PROFILE</Text>
                        </View>
                        <Image
                            resizeMode="cover"
                            style={styles.nurse}
                            source={{ uri: `${default_image}` }}
                        />
                        <Text style={styles.name}>{userInfo?.photoImage?.name}</Text>
                        <Text style={styles.name}>{userInfo?.firstName || ""}{" "}{userInfo?.lastName || ""}</Text>

                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            <Text style={[styles.titles, { width: '40%' }]}>Phone</Text>
                            <Text style={[styles.content, { color: '#2a53c1', textDecorationLine: 'underline', width: '100%' }]}>{userInfo?.phoneNumber}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            <Text style={[styles.titles, { width: '40%' }]}>Email</Text>
                            <Text style={[styles.content, { color: '#2a53c1', textDecorationLine: 'underline', width: '100%' }]}>{userInfo?.email}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            <Text style={[styles.titles, { width: '40%' }]}>Total Bids/Offers</Text>
                            <Text style={styles.content}>{userInfo?.totalBid}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            <Text style={[styles.titles, { width: '40%' }]}>Total Awarded</Text>
                            <Text style={styles.content}>{userInfo?.totalAward}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            <Text style={[styles.titles, { width: '40%' }]}>Bid to Award Ratio</Text>
                            <Text style={styles.content}>{userInfo?.AwardRatio}</Text>
                        </View>
                    </View>
                </View>
                
                <Text
                    style={{ color: '#2a53c1', textDecorationLine: 'underline', width: '100%', marginBottom: 100, paddingLeft: '7%', marginTop: 10 }}
                    onPress={() => navigation.navigate("AllJobShiftListing")}
                >
                    Back to Admin View Job Details
                </Text>
            </ScrollView>
            <MFooter />
        </View>
    )
};

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
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'center'
    },
    line: {
        width: '100%',
        height: 5,
        backgroundColor: '#ccc',
        marginVertical: 15
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
    input: {
        backgroundColor: 'white', 
        height: 30, 
        marginBottom: 10, 
        borderWidth: 1, 
        borderColor: 'hsl(0, 0%, 86%)',
    },
    text: {
        fontSize: RFValue(14),
        color: 'black',
        fontWeight: '300',
        textAlign: 'center',
        marginTop: 30,
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
        width: '86%',
        padding: RFValue(15),
        backgroundColor: '#e3f2f1',
        borderRadius: RFValue(30),
        borderWidth: 2,
        borderColor: '#b0b0b0',
        // marginBottom: 100
    },
    titles: {
        backgroundColor: '#eaeaea',
        width: 'auto',
        fontWeight: 'bold',
        fontSize: RFValue(14),
        lineHeight: 20,
        marginTop: 5,
        marginRight: 10,
        padding: 5
    },
    content: {
        fontSize: RFValue(16),
        lineHeight: 40,
    },
    profileTitleBg: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: RFValue(20),
        paddingHorizontal: RFValue(20)
    },
    profileTitle: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: RFValue(18)
    },
    nurse: {
        width: 200,
        height: 200
    },
    name: {
        fontSize: RFValue(20),
        marginVertical: 10,
    },
    edit: {
        backgroundColor: '#BC222F',
        padding: 10,
        borderRadius: 10,
        fontWeight: 'bold',
        color: 'white',
        width: '45%',
        flexDirection: 'row',
        justifyContent: 'center'
    }
});
  