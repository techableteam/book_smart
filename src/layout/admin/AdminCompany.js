import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import AHeader from '../../components/Aheader';
import AnimatedHeader from '../AnimatedHeader';
import { useAtom } from 'jotai';
import { emailAtom } from '../../context/AdminAuthProvider'
import { getAdminInfo } from '../../utils/useApi';
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function AdminCompany ({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useAtom(emailAtom);
  const [avatar, setAvatar] = useState({ name: '', type: '', content: '' });
  const [loading, setLoading] = useState(false);

  const userInfo = [
    {title: 'Company', content: companyName},
    {title: 'Email', content: email},
    {title: 'Phone', content: phone},
  ];

  const handleEdit = () => {
    console.log('handleEdit')
    navigation.navigate('AdminEditProfile')
  };

  const getData = async () => {
    setLoading(true);
    let response = await getAdminInfo({ email: email });
    if (response?.error) {
      setFirstName('');
      setLastName('');
      setCompanyName('');
      setPhone('');
      setAvatar({  name: '', type: '', content: '' });
    } else {
      setFirstName(response.user.firstName);
      setLastName(response.user.lastName);
      setCompanyName(response.user.companyName);
      setPhone(response.user.phone);
      setAvatar(response.user.photoImage);
    }
    setLoading(false);
  };
  
  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  return (
      <View style={styles.container}>
        <StatusBar 
          translucent backgroundColor="transparent"
        />
        <AHeader navigation={navigation}  currentPage={2} />
        <SubNavbar navigation={navigation} name={"AdminLogin"}/>
        <ScrollView style={{width: '100%', marginTop: height * 0.25}}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topView}>
            <AnimatedHeader title="ADMIN / COMPANY PROFILE" />
            <View style={styles.bottomBar} />
          </View>
          <View style={styles.profile}>
            <View style={styles.profileTitleBg}>
              <Text style={styles.profileTitle}>ADMIN / COMPANY PROFILE</Text>
            </View>
            {avatar.content && <Image
              source={{ uri: `data:image/jpeg;base64,${avatar.content}` }}
              resizeMode="contain"
              style={styles.nurse}
            />}
            <Text style={styles.name}>{firstName || ""} {lastName || ""}</Text>
            <TouchableOpacity style={styles.edit} onPress = {() => handleEdit()}>
              <Text style={{color: 'white'}}> Edit Profile</Text>
            </TouchableOpacity>
            {
              userInfo.map((item, index) => 
                <View key={index} style={{flexDirection: 'column', width: '100%'}}>
                  <Text style={styles.titles}>{item.title}</Text>
                  <Text style={[
                    styles.content, 
                    item.title == "Phone" || item.title == "Email" ? {color: '#2a53c1', textDecorationLine:'underline', width: '100%'} : {}
                  ]}>{item.content}</Text>
                </View>
              )
            }
            {/* <MapView
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            /> */}
          </View>
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
    position: 'relative',
    width: '100%'
  },
  mark: {
    width:225,
    height: 68,
  },
  topView: {
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
    marginLeft: '10%',
    width: '80%',
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
    marginBottom: 100
  },
  titles: {
    fontWeight: 'bold',
    fontSize: RFValue(16),
    lineHeight: 30,
    width: '40%'
  },
  content: {
    fontSize: RFValue(14),
    width: '60%',
    lineHeight: 40,
  },
  profileTitleBg: {
    backgroundColor: '#BC222F',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '90%',
    marginLeft: '5%',
    marginBottom: 20
  },
  profileTitle: {
    fontSize: RFValue(12),
    fontWeight: 'bold',
    color: 'white',
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
    backgroundColor: '#A020F0',
    padding: 10,
    borderRadius: 10,
    fontWeight: 'bold',
    color: 'white',
    width: '45%',
    flexDirection: 'row',
    justifyContent: 'center'
  }
});
  