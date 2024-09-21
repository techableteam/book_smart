import React, { useEffect, useState } from 'react';
import { View, Image, Animated, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import AHeader from '../../components/Aheader';
import { useAtom } from 'jotai';
import { firstNameAtom, lastNameAtom, companyNameAtom, phoneAtom, emailAtom, photoImageAtom } from '../../context/AdminAuthProvider'

export default function AdminCompany ({ navigation }) {
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastName] = useAtom(lastNameAtom);
  const [companyName, setCompanyName] = useAtom(companyNameAtom);
  const [phone, setPhone] = useAtom(phoneAtom);
  const [email, setEmail] = useAtom(emailAtom);
  const [avatar, setAvatar] = useAtom(photoImageAtom);
  const [backgroundColor, setBackgroundColor] = useState('#0000ff');
  let colorIndex = 0;

  useEffect(() => {
    const interval = setInterval(() => {
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

  const userInfo = [
    {title: 'Company', content: companyName},
    {title: 'Email', content: email},
    {title: 'Phone', content: phone},
  ]

  const handleEdit = () => {
    console.log('handleEdit')
    navigation.navigate('AdminEditProfile')
  }

  return (
      <View style={styles.container}>
        <StatusBar 
          translucent backgroundColor="transparent"
        />
        <AHeader navigation={navigation}  currentPage={2} />
        <SubNavbar navigation={navigation} name={"AdminLogin"}/>
        <ScrollView style={{width: '100%', marginTop: 155}}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topView}>
            <Animated.View style={[styles.backTitle, { backgroundColor }]}>
              <Text style={styles.title}>ADMIN / COMPANY PROFILE</Text>
            </Animated.View>
            <View style={styles.bottomBar} />
          </View>
          <View style={styles.profile}>
            <View style={styles.profileTitleBg}>
              <Text style={styles.profileTitle}>ADMIN / COMPANY PROFILE</Text>
            </View>
            {avatar.content && <Image
              source={{ uri: `data:image/jpeg;base64,${avatar.content}` }}
              resizeMode="cover"
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
    marginTop: 50,
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
    fontSize: 14,
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
    fontSize: 16,
    lineHeight: 40,
    width: '40%'
  },
  content: {
    fontSize: 16,
    width: '60%',
    lineHeight: 40,
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
  nurse: {
    width: 200,
    height: 200
  },
  name: {
    fontSize: 20,
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
  