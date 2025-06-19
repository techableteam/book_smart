import React from 'react';
import { View, Image, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import images from '../../assets/images';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import ImageButton from '../../components/ImageButton';
import { useAtom } from 'jotai';
import { firstNameAtom, lastNameAtom, contactPhoneAtom, contactEmailAtom, avatarAtom } from '../../context/FacilityAuthProvider'
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function FacilityProfile ({ navigation }) {
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastName] = useAtom(lastNameAtom);
  const [contactPhone, setContactPhone] = useAtom(contactPhoneAtom);
  const [contactEmail, setContactEmail] = useAtom(contactEmailAtom);
  const [avatar, setAvatar] = useAtom(avatarAtom);

  const handleNavigate = (navigateUrl) => {
    navigation.navigate(navigateUrl);
  };

  const userInfo = [
    {title: 'Contact Name', content: firstName + " " + lastName},
    {title: 'email', content: contactEmail},
    {title: 'Phone', content: contactPhone},
  ];

  const handleEdit = () => {
    navigation.navigate('FacilityEditProfile');
  };

  return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent"/>
        <MHeader navigation={navigation} />
        <SubNavbar navigation={navigation} name={"FacilityLogin"}/>
        <ScrollView style={{width: '100%', marginTop: height * 0.22}} showsVerticalScrollIndicator={false}>
          <View style={styles.topView}>
            <Image
              source={images.mark}
              resizeMode="cover"
              style={styles.mark}
            />
            <View style={styles.bottomBar}/>
          </View>
          <View style={styles.imageButton}>
            <View style={styles.buttonWrapper}>
              <ImageButton title="POST SHIFT" onPress={() => handleNavigate('AddJobShift')} />
            </View>
            <View style={styles.buttonWrapper}>
              <ImageButton title="VIEW / EDIT SHIFTS" onPress={() => handleNavigate('CompanyShift')} />
            </View>
            <View style={styles.buttonWrapper}>
              <ImageButton title="APPROVE SHIFTS" onPress={() => handleNavigate('CompanyShift')} />
            </View>
            <View style={styles.buttonWrapper}>
              <ImageButton title="Team Scheduling" onPress={() => handleNavigate('CompanyShift')} />
            </View>
          </View>
          <View style={styles.profile}>
            <View style={styles.profileTitleBg}>
              <Text style={styles.profileTitle}>FACILITY PROFILE</Text>
            </View>
            {/* {avatar.content && <Image
              source={{ uri: `${avatar.content}` }}
              resizeMode="cover"
              style={styles.nurse}
            />} */}
            {avatar.content && avatar.content.startsWith("http") && (
              <View style={styles.centered}>
                <Image
                  source={{ uri: avatar.content }}
                  resizeMode="cover"
                  style={styles.nurse}
                />
              </View>
            )}
            {/* <Text style={styles.name}>{firstName || "DaleWong"}</Text> */}
            <View style={styles.centered}>
              <TouchableOpacity style={styles.edit} onPress = {() => handleEdit()}>
                <Text style={{color: 'white'}}> Edit Profile</Text>
              </TouchableOpacity>
            </View>
            <View style={{height : 10}}/>
            <View style={styles.centered}>
              {userInfo.map((item, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.titles}>
                    {item.title.charAt(0).toUpperCase() + item.title.slice(1)}:
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      (item.title === "Phone" || item.title === "email") && styles.linkText
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        <MFooter />
      </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    width: '90%',
  },
  titles: {
    fontWeight: 'bold',
    fontSize: RFValue(16),
    width: RFValue(110), // fixed width for alignment
    marginRight: RFValue(5),
  },
  content: {
    fontSize: RFValue(16),
    flex: 1,
    flexWrap: 'wrap',
  },
  linkText: {
    color: '#2a53c1',
    textDecorationLine: 'underline',
    fontSize: RFValue(15),
  },
  container: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    width: '100%'
  },
  mark: {
    width:RFValue(225),
    height: RFValue(68),
  },
  topView: {
    marginTop: 20,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: '14%',
    marginTop: 30,
  },
  buttonWrapper: {
    width: '45%',      
    marginHorizontal: 5,  
    marginVertical: 8,    
    alignItems: 'center',
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
    fontSize: RFValue(16)
  },
  nurse: {
    width: RFValue(200),
    height: RFValue(200)
  },
  name: {
    fontSize: RFValue(16),
    marginVertical: RFValue(10),
    fontWeight: 'bold'
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
  