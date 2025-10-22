import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView, 
  Dimensions 
} from 'react-native';
import { 
  getShiftTypes, 
  addShiftToStaff,
  getDegreeListInAdmin,
  getAllFacilitiesInAdmin,
  createDJob,
  getAllDjob, 
} from '../../../utils/useApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import DatePicker from 'react-native-date-picker';

export default function AddNewShiftModal({ visible, onClose, staffList, facilitieslist, degreelist, refreshShiftData  }) {
  const [shiftTypes, setShiftTypes] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [facilities, setFacilities] = useState('');
  const [degrees, setDegrees] = useState('');

  useEffect(() => {
    if (visible && staffList.length > 0) {
      const formatted = staffList.map((emp) => ({
        label: `${emp.firstName} ${emp.lastName}`,
        value: emp.id.toString(),
      }));
      setEmployeeList(formatted);
    }
    fetchShiftTypes();
  }, [visible, staffList]);

  const fetchShiftTypes = async () => {
    try {
      const [AIdRaw] = await Promise.all([
        AsyncStorage.getItem('AId'),
      ]);
      const AId = Number.parseInt((AIdRaw || '').trim(), 10);
      if (!Number.isFinite(AId)) {
        console.log('fetchShiftTypes: missing/invalid aic', { AId });
        setShiftTypes([]);
        return;
      }
      const userData = {AId};
      const response = await getShiftTypes(userData, "admin");
      const types = Array.isArray(response?.shiftType) ? response.shiftType : [];
      if (!types.length) {
        console.log('ShiftTypes API returned empty or invalid list:', response);
      }
      setShiftTypes(types);
    } catch (err) {
      setShiftTypes([]);
    }
  };
  

  const handleSubmit = async () => {
    if ( !selectedShift || !selectedDate || !degrees) {
      alert('Please make sure all required fields are filled');
      return;
    }
  
    const selectedShiftObj = shiftTypes.find(
      (s) => String(s.id) === String(selectedShift)
    );
    if (!selectedShiftObj) {
      alert('Invalid shift selected');
      return;
    }
  
    try {
      const [AIdRaw] = await Promise.all([
        AsyncStorage.getItem('AId'),
      ]);
      const AId = Number.parseInt((AIdRaw || '').trim(), 10);
  
      if (!Number.isFinite(AId)) {
        console.warn('Missing AId:', {AId});
        return;
      }
  
      const d = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      const formattedDate = d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
  
      const formattedTime = `${selectedShiftObj.start} ➔ ${selectedShiftObj.end}`;
  
      const shiftPayload = [
        {
          date: formattedDate,
          time: formattedTime,
        },
      ];

      const result = await createDJob({
        shiftPayload,
        degreeId: degrees,
        facilityId: facilities,
        staffId: selectedEmployee,
        adminId: AId,
        adminMade: true,
      });

      const jobId = result?.data?.DJobId ?? result?.data?.id;

      if (jobId) {
        await refreshShiftData();
        onClose();
      } else {
        const msg = result?.message || 'Failed to submit shift.';
        alert(msg);
      }
    } catch (err) {
      console.error('Error submitting shift:', err);
      alert('Failed to submit shift. Please try again.');
    }
  };
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add New Shift</Text>

          <Text style={styles.label}>Facility</Text>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            itemTextStyle={styles.dropdownItemText}
            data={facilitieslist.map(facility => ({
              label: facility.companyName,
              value: facility.aic, // Assuming `aic` is the ID for the facility
            }))}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Select Facility"
            value={facilities}
            onChange={item => setFacilities(item.value)}
          />

          <Text style={styles.label}>Degree</Text>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            itemTextStyle={styles.dropdownItemText}
            data={degreelist.map(degree => ({
              label: degree.degreeName,
              value: degree.Did, // Assuming `id` is the ID for the degree
            }))}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Select Degree"
            value={degrees}
            onChange={item => setDegrees(item.value)}
          />

          <Text style={styles.label}>Staff</Text>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            itemTextStyle={styles.dropdownItemText}
            data={employeeList}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Select Staff"
            value={selectedEmployee}
            onChange={item => setSelectedEmployee(item.value)}
          />

          <Text style={styles.label}>Day</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
                mode="outlined"
                placeholder="mm/dd/yyyy"
                value={selectedDate.toLocaleDateString()}
                editable={false}
                pointerEvents="none"
                style={styles.inputBox}
            />
            </TouchableOpacity>

            <DatePicker
              modal
              open={showDatePicker}
              date={selectedDate}
              mode="date"
              onConfirm={(date) => {
                  setShowDatePicker(false);
                  setSelectedDate(date);
              }}
              onCancel={() => setShowDatePicker(false)}
            />

            <Text style={styles.label}>Shift</Text>
            <View style={styles.shiftScrollBox}>
              <ScrollView
                style={styles.shiftScroll}
                contentContainerStyle={styles.shiftListContent}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                <View style={styles.shiftOptions}>
                  {shiftTypes.map((shift) => (
                    <TouchableOpacity
                      key={shift.id}
                      style={[
                        styles.shiftButton,
                        selectedShift === shift.id && styles.shiftButtonSelected,
                      ]}
                      onPress={() => setSelectedShift(shift.id)}
                    >
                      <Text
                        style={[
                          styles.shiftText,
                          selectedShift === shift.id && styles.shiftTextSelected,
                        ]}
                      >
                        {shift.start} ➔ {shift.end}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>


          <View style={styles.footer}>
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitText} onPress={handleSubmit} >Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#333',
    marginBottom: 4,
    fontWeight: '600',
  },
  shiftOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  shiftButton: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 8,
    backgroundColor: '#f9f9f9',
  },
  shiftButtonSelected: {
    backgroundColor: '#290135',
    borderColor: '#290135',
  },
  shiftText: {
    color: '#333',
  },
  shiftTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#290135',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelText: {
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#C4C4C4',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
  },
  
  dropdownContainer: {
    borderRadius: 4,
    borderColor: '#C4C4C4',
  },
  
  dropdownPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  
  dropdownSelectedText: {
    color: '#000',
    fontSize: 16,
  },
  
  dropdownItemText: {
    fontSize: 16,
    color: '#000',
  },

  inputBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    borderRadius: 4,
    paddingVertical: 0,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  shiftScrollBox: {
    maxHeight: Math.floor(Dimensions.get('window').height * 0.3), 
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 20,
  },

  shiftListContent: {
    padding: 10,
  },

  shiftOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
