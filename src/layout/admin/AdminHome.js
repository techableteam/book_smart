import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import { useAtom } from 'jotai';
import { firstNameAtom, lastNameAtom, userRoleAtom } from '../../context/AdminAuthProvider';
import AHeader from '../../components/Aheader';
import AnimatedHeader from '../AnimatedHeader';

const { width, height } = Dimensions.get('window');

export default function AdminHome ({ navigation }) {
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastNameAtom] = useAtom(lastNameAtom);
  const [userRole, setUserRole] = useAtom(userRoleAtom);

  const userInfo = [
    {title: 'Name', content: firstName + " "+lastName},
    {title: 'User Roles', content: userRole},
  ]

  return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent"/>
        <AHeader currentPage={3} navigation={navigation} style={{zIndex: 10}}/>
        <SubNavbar navigation={navigation} name={"AdminLogin"} style={{zIndex: 0}}/>
        <ScrollView style={{width: '100%', marginTop: height * 0.25}}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topView}>
            <AnimatedHeader title="WELCOME TO BookSmart™!" />
            <View style={styles.bottomBar}/>
          </View>
            {
              userInfo.map((item, index) => 
                <View key={index} style={{flexDirection: 'row', width: '90%', marginLeft: '10%', marginBottom: 5}}>
                  <Text style={[styles.titles, { fontWeight: 'bold', backgroundColor: '#ccc'}]}>{item.title}</Text>
                  <Text style={[
                    styles.content, 
                    item.title == "Phone" || item.title == "Email" ? {color: '#2a53c1', textDecorationLine:'underline', width: '100%'} : {}
                  ]}>{item.content}</Text>
                </View>
              )
            }
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
    marginVertical: 30,
    height: 5,
    backgroundColor: '#4f70ee1c',
    width: '100%'
  },
  titles: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 30,
    width: '35%',
    marginRight: '3%',
    paddingHorizontal: 5
  },
  content: {
    fontSize: 16,
    width: '60%',
    lineHeight: 30,
  },
});
  