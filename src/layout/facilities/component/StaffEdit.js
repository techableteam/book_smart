import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
} from 'react-native';
import MHeader from '../../../components/Mheader';
import MFooter from '../../../components/Mfooter';

const { width, height } = Dimensions.get('window');
const roles = ['Admin', 'Employee', 'Super Admin'];

export default function StaffEdit({ route, navigation }) {
  const { staff } = route.params;
  
  const [form, setForm] = useState({
    name: staff.name || '',
    mobile: staff.mobile || '',
    email: staff.email || '',
    role: staff.role || 'Employee',
    active: staff.active || false,
    photo: staff.avatar,
    photoName: 'UxP4G...XW.png', // simulate file name
  });

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Updated data:', form);
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MHeader back />
      <ScrollView style={{ marginTop: height * 0.15 }} contentContainerStyle={styles.content}>
        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={form.name}
          onChangeText={text => updateField('name', text)}
          style={styles.input}
          placeholder="Enter name"
        />

        {/* Mobile */}
        <Text style={styles.label}>Mobile</Text>
        <TextInput
          value={form.mobile}
          onChangeText={text => updateField('mobile', text)}
          style={styles.input}
          placeholder="Enter mobile"
          keyboardType="phone-pad"
        />

        {/* Role */}
        <Text style={styles.label}>Role</Text>
        <View style={styles.roleGroup}>
          {roles.map(role => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                form.role === role && styles.roleSelected,
              ]}
              onPress={() => updateField('role', role)}
            >
              <Text style={form.role === role ? styles.roleSelectedText : styles.roleText}>
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={form.email}
          onChangeText={text => updateField('email', text)}
          style={styles.input}
          placeholder="Enter email"
          keyboardType="email-address"
        />

        {/* Active */}
        <View style={styles.switchRow}>
            <Switch
                value={form.active}
                onValueChange={val => updateField('active', val)}
                trackColor={{ false: '#ccc', true: '#290135' }}
                thumbColor={form.active ? '#fff' : '#f4f3f4'}
            />
            <Text style={styles.activeLabel}>
                {form.active ? 'Active' : 'Inactive'}
            </Text>
        </View>



        {/* Photo */}
        <Text style={styles.label}>Photo</Text>
        <View style={styles.photoRow}>
          <Image source={form.photo} style={styles.avatar} />
          <Text style={styles.photoName}>{form.photoName}</Text>
          <TouchableOpacity style={styles.removePhoto}>
            <Text style={{ fontWeight: 'bold', color: '#777' }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    padding: 16,
    paddingBottom: 100,
  }, 
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
    fontSize : 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 15,
    color: '#000',
  },
  roleGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  roleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginEnd : 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  roleSelected: {
    backgroundColor: '#dde5f5',
    borderColor: '#999',
  },
  roleText: {
    color: '#333',
    fontSize: 14,
  },
  roleSelectedText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 13,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  activeLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  photoName: {
    flex: 1,
    color: '#333',
  },
  removePhoto: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelBtn: {
    backgroundColor: '#eee',
    padding: 12,
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
  },
  cancelText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#290135',
    padding: 12,
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
  },
  submitText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
});
