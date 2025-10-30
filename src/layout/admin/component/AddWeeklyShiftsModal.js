import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions 
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getShiftTypes, 
  addShiftToStaff,
  createDJob
} from '../../../utils/useApi';
import moment from 'moment';

export default function AddWeeklyShiftsModal({ 
  visible, 
  onClose, 
  staffList, 
  facilitieslist, 
  degreelist, 
  refreshShiftData,
  selectedFacilitiesId,
  selectedFacilitiescompanyName
}) {
  const [shiftTypes, setShiftTypes] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedShifts, setSelectedShifts] = useState({});
  const [employeeList, setEmployeeList] = useState([]);
  const [facilities, setFacilities] = useState('');
  const [degrees, setDegrees] = useState('');
  const [isLoading, setIsLoading] = useState(false);  
  const nextWeekDates = getNextWeekDates();
  
  const isSubmitDisabled =
  !degrees || Object.keys(selectedShifts).length === 0 || Object.values(selectedShifts).every((shiftsArray) => shiftsArray.length === 0);

  useEffect(() => {
    if (visible) {
      fetchShiftTypes();
      const formatted = staffList.map((emp) => ({
        label: `${emp.firstName} ${emp.lastName}`,
        value: emp.id.toString(),
      }));
      setEmployeeList(formatted);
      setSelectedShifts({});
    }
  }, [visible]);

  const fetchShiftTypes = async () => {
    try {
      const [AIdRaw] = await Promise.all([
        AsyncStorage.getItem('AId'),
      ]);
      const AId = Number.parseInt((AIdRaw || '').trim(), 10);
  
      if (!Number.isFinite(AId)) {
        console.log('fetchShiftTypes: missing AId', { AId});
        setShiftTypes([]);
        return;
      }
  
      const res = await getShiftTypes({ AId}, "admin");
  
      if (Array.isArray(res?.shiftType)) {
        setShiftTypes(res.shiftType);
      } else {
        console.log('fetchShiftTypes: unexpected payload', res);
        setShiftTypes([]);
      }
    } catch (err) {
      console.error('ShiftType Error:', err);
      setShiftTypes([]);
    }
  };
  
  const handleSelectShift = (day, shift) => {
    setSelectedShifts((prev) => {
      const current = prev[day] || [];
      const exists = current.find((s) => s.id === shift.id);
      const updated = exists
        ? current.filter((s) => s.id !== shift.id)
        : [...current, shift];
      return { ...prev, [day]: updated };
    });
  };

  const handleSubmit = async () => {
    try {
      if (!selectedShifts || Object.keys(selectedShifts).length === 0) {
        Alert.alert('No shifts selected', 'Please pick at least one shift.');
        return;
      }
      
      const [AIdRaw] = await Promise.all([
        AsyncStorage.getItem('AId'),
      ]);
      const AId = Number.parseInt((AIdRaw || '').trim(), 10);
      if (!Number.isFinite(AId)) {
        console.warn('handleSubmit: missing AId', { AId });
        return;
      }
  
      const shifts = [];
      for (const [dayKey, shiftsArray] of Object.entries(selectedShifts)) {
        const rawDate = nextWeekDates?.[dayKey];
        if (!rawDate) continue; 
    
        const formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
    
        (shiftsArray || []).forEach((s) => {
          if (!s?.start || !s?.end) return;
          shifts.push({
            date: formattedDate,
            time: `${s.start} ➔ ${s.end}`,
          });
        });
      }
    
      if (shifts.length === 0) {
        Alert.alert('No valid shifts', 'Please select valid shift times.');
        return;
      }
  
      let hasError = false;
      const failedJobs = [];

      setIsLoading(true);
  
      for (const shift of shifts) {
        try {
          const result = await createDJob({
            shiftPayload: shift,
            degreeId: degrees,
            facilityId: selectedFacilitiesId,
            staffId: selectedEmployee,
            adminId: AId,
            adminMade: true, 
          });
  
          const jobId = result?.data?.DJobId ?? result?.data?.id;
          if (!jobId) {
            throw new Error(result?.message || 'Failed to submit shift.');
          }
        } catch (err) {
          console.error('Error creating job for shift:', shift, err);
          failedJobs.push(shift); 
          hasError = true;
        }
      }

      setIsLoading(false);
  
      if (hasError) {
        const msg = `Failed to create job(s) for ${failedJobs.length} shift(s).`;
        Alert.alert('Error', msg);
      } else {
        await refreshShiftData?.();
        onClose?.();
        Alert.alert('Success', 'All shifts assigned successfully!');
      }
  
    } catch (err) {
      console.error('Submission error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };
  

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add next week's Shifts</Text>

          <Text style={styles.label}>Facility</Text>
          <TextInput
             style={[styles.inputBox, { 
              fontSize: 16, 
              color: 'black', 
              backgroundColor: '#f4f4f4',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 6,
            }]}
            placeholder="No Selected Facility"
            value = {selectedFacilitiescompanyName}
            editable={false}
          />
          {/* <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            itemTextStyle={styles.dropdownItemText}
            data={facilitieslist.map(facility => ({
              label: facility.companyName,
              value: facility.aic, 
            }))}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Select Facility"
            value={facilities}
            onChange={item => setFacilities(item.value)}
            disabled={isLoading}
          /> */}

          <Text style={styles.label}>
            Degree <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            itemTextStyle={styles.dropdownItemText}
            data={degreelist.map(degree => ({
              label: degree.degreeName,
              value: degree.Did, 
            }))}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder="Select Degree"
            value={degrees}
            onChange={item => setDegrees(item.value)}
            disabled={isLoading}
          />

          <Text style={styles.label}>Staff</Text>
          <Dropdown
            style={styles.dropdown}
            data={employeeList}
            labelField="label"
            valueField="value"
            placeholder="Select Staff"
            value={selectedEmployee}
            onChange={(item) => setSelectedEmployee(item.value)}
            disabled={isLoading}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#290135" />
            </View>
          )}

          <Text style={styles.label}>
            Shift <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <View style={styles.shiftScrollBox}>
            <ScrollView style={{ marginTop: 10, marginHorizontal: 10 }}>
              {Object.keys(nextWeekDates).map((day) => (
                <View key={day} style={{ marginBottom: 12 }}>
                  <Text style={styles.label}>{day} ({moment(nextWeekDates[day]).format('MMM DD, YYYY')})</Text>
                  <View style={styles.shiftRow}>
                    {shiftTypes.map((shift) => {
                      const selected = (selectedShifts[day] || []).some((s) => s.id === shift.id);
                      return (
                        <TouchableOpacity
                          key={shift.id}
                          style={[styles.shiftButton, selected && styles.shiftButtonSelected]}
                          onPress={() => handleSelectShift(day, shift)}
                          disabled={isLoading}
                        >
                          <Text style={[styles.shiftText, selected && styles.shiftTextSelected]}>
                            {shift.start} ➔ {shift.end}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

         

          

          <View style={styles.footer}>
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    isSubmitDisabled && { opacity: 0.5 }
                ]}
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
            >
                <Text style={styles.submitText}>Submit</Text>
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

function getNextWeekDates() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const nextWeekStart = new Date(today);
  nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));

  const result = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(nextWeekStart);
    d.setDate(d.getDate() + i);
    result[days[i]] = d.toISOString().split('T')[0];
  }
  return result;
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
  },
  inputBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    borderRadius: 4,
    paddingVertical: 0,
    paddingHorizontal: 10,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#C4C4C4',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  shiftRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shiftButton: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
    marginTop: 6,
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
});
