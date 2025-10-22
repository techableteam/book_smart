import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import MFooter from '../../../components/Mfooter';
import MHeader from '../../../components/Mheader';
import { RFValue } from 'react-native-responsive-fontsize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteStaffFromManager } from '../../../utils/useApi';

const { width, height } = Dimensions.get('window');

export default function AdminStaffDetail({ route,  navigation}) {
  const { staff } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <MHeader back />

      <ScrollView
        style={{ width: '100%', marginTop: height * 0.15 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.profileContainer}>
            <View style={styles.editWrapper}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    Alert.alert(
                      'Confirm Delete',
                      'Are you sure you want to delete this staff member?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const [aicRaw] = await Promise.all([
                                AsyncStorage.getItem('AId'),
                              ]);
                              const managerAic = Number.parseInt(aicRaw ?? '', 10);
                              if (Number.isNaN(managerAic)) {
                                console.warn('fetchUsers: missing managerAic', { managerAic });
                                return;
                              }
                
                              const result = await deleteStaffFromManager(
                                "admin",
                                String(managerAic),
                                staff.id
                              );
                
                              if (result?.message?.includes('Staff deleted')) {
                                navigation.goBack();
                              } else {
                                Alert.alert('Failed to delete staff.');
                                console.log('Delete response:', result);
                              }
                            } catch (err) {
                              console.error('deleteStaffFromManager error:', err);
                              Alert.alert('Something went wrong. Please try again.');
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.editText}>Delete</Text>
                </TouchableOpacity>


            </View>
            <Image source={require('../../../assets/images/default_avatar.png')} 
              style={styles.profileImage} />
            <Text style={styles.profileName}>{staff.name}</Text>
        </View>


        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{staff.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{staff.email}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Mobile</Text>
            <Text style={styles.value}>{staff.mobile}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{staff.role}</Text>
          </View>
        
        </View>

        <Text style={styles.shiftHeader}>Scheduled Shifts</Text>
        {staff.shifts.map((item, index) => (
          <View key={index} style={styles.shiftBox}>
            <Text style={styles.shiftDate}>{item.date.toUpperCase()}</Text>
            <Text style={styles.shiftTime}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>

      <MFooter />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      flex: 1,
      width: '100%',
    },

    editWrapper: {
        width: '100%',
        alignItems: 'flex-end',
        paddingRight: 10,
        position: 'absolute',
        top: 10,
        zIndex: 10,
    },
      
    content: {
      padding: 10,
      paddingBottom: 100,
    },
    profileContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImage: {
      width: 90,
      height: 90,
      borderRadius: 45,
      marginBottom: 8,
    },
    profileName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#111',
    },
    editButton: {
      backgroundColor: '#290135',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginTop: 8,
      width: RFValue(60),
      justifyContent: 'center',
      alignItems: 'center', 
    },
    editText: {
      color: 'white',
      fontWeight: '500',
    },
    section: {
      backgroundColor: '#f8f9fb',
      borderRadius: 10,
      padding: 16,
      marginBottom: 20,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 8,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 10,
    },
    label: {
      fontWeight: '600',
      color: '#555',
      fontSize: 16,
    },
    value: {
      fontSize: 16,
      color: '#111',
      fontWeight: '500',
    },
    smallAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    shiftHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#111',
    },
    shiftBox: {
        backgroundColor: '#f1f1f1',
        padding: 12,
        borderRadius: 10,
        marginBottom: 5,
        marginHorizontal : 5
      },
      shiftDate: {
        color: '#111',
        fontWeight: '700',
        fontSize: 13,
        marginBottom: 1,
      },
      shiftTime: {
        color: '#333',
        fontSize: 16,
      },
      
  });
  