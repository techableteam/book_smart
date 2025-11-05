import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getShiftTypes, 
  addShiftToStaff,
  createDJob
} from '../../../utils/useApi';
import moment from 'moment';

export default function AddWeeklyShiftsModal({ visible, onClose, 
  staffList, degreelist, refreshShiftData }) {
  const [shiftTypes, setShiftTypes] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedShifts, setSelectedShifts] = useState({});
  const [employeeList, setEmployeeList] = useState([]);
  const [degrees, setDegrees] = useState('');
  const [isLoading, setIsLoading] = useState(false);  

  const nextWeekDates = getNextWeekDates();
  
  const isSubmitDisabled =
  !degrees || Object.keys(selectedShifts).length === 0 || Object.values(selectedShifts).every((shiftsArray) => shiftsArray.length === 0);

  // --- NEW: helper to get selected degree name (used for filtering staff)
  const selectedDegreeName = React.useMemo(() => {
    if (!degrees) return '';
    const found = degreelist?.find(d => String(d.Did) === String(degrees));
    return (found?.degreeName || '').trim();
  }, [degrees, degreelist]);

  // Reset all form fields
  const resetForm = () => {
    setDegrees('');
    setSelectedEmployee('');
    setEmployeeList([]);
    setSelectedShifts({});
  };

  useEffect(() => {
    if (visible) {
      fetchShiftTypes();
      resetForm();
    }
  }, [visible]);

  // --- NEW: whenever degree changes, (1) reset selected staff, (2) filter staff by userRole
  useEffect(() => {
    setSelectedEmployee('');

    if (!degrees || !selectedDegreeName) {
      setEmployeeList([]);
      return;
    }

    // Filter staff by userRole matching degreeName (case-insensitive, trimmed, and normalized)
    const normalizedDegreeName = selectedDegreeName.toLowerCase().trim();
    const filtered = (staffList || [])
      .filter(emp => {
        const userRole = (emp?.userRole || '').toLowerCase().trim();
        return userRole === normalizedDegreeName;
      })
      .map(emp => ({
        label: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        value: String(emp.aic),
      }));

    setEmployeeList(filtered);
  }, [degrees, selectedDegreeName, staffList]);

  const fetchShiftTypes = async () => {
    try {
      const [aicRaw] = await Promise.all([
        AsyncStorage.getItem('aic'),
      ]);
      const aic = Number.parseInt((aicRaw || '').trim(), 10);
  
      if (!Number.isFinite(aic)) {
        console.warn('fetchShiftTypes: missing aic', { aic });
        setShiftTypes([]);
        return;
      }
  
      const res = await getShiftTypes({ aic }, "facilities");
  
      if (Array.isArray(res?.shiftType)) {
        setShiftTypes(res.shiftType);
      } else {
        console.warn('fetchShiftTypes: unexpected payload', res);
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
    if (isLoading) return;

    try {
      if (!degrees) {
        Alert.alert('Missing degree', 'Please select a degree first.');
        return;
      }
      if (!selectedShifts || Object.keys(selectedShifts).length === 0) {
        Alert.alert('No shifts selected', 'Please pick at least one shift.');
        return;
      }

      setIsLoading(true);

      const [aicRaw] = await Promise.all([
        AsyncStorage.getItem('aic'),
      ]);
      const managerAic = Number.parseInt((aicRaw || '').trim(), 10);
  
      if (!Number.isFinite(managerAic)) {
        console.warn('handleSubmit: missing aic', { managerAic });
        Alert.alert('Error', 'Invalid facility ID.');
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
  
      for (const shift of shifts) {
        try {
          const result = await createDJob({
            shiftPayload: shift,
            degreeId: degrees,
            facilityId: managerAic,
            staffId: selectedEmployee || '',
            adminId: 0,
            adminMade: false, 
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
  
      if (hasError) {
        const msg = `Failed to create job(s) for ${failedJobs.length} shift(s).`;
        Alert.alert('Error', msg);
      } else {
        await refreshShiftData?.();
        resetForm();
        onClose?.();
        Alert.alert('Success', 'All shifts assigned successfully!');
      }
    } catch (err) {
      console.error('Submission error:', err);
      Alert.alert('Error', err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add next week's Shifts</Text>

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
            onChange={item => {
              setDegrees(item.value);
              // selectedEmployee will be reset and list recalculated in useEffect
            }}
            disabled={isLoading}
          />

          <Text style={styles.label}>Staff</Text>
          <Dropdown
            style={[
              styles.dropdown,
              !degrees && { backgroundColor: '#f2f2f2' },
            ]}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            itemTextStyle={styles.dropdownItemText}
            data={employeeList}
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder={degrees ? (employeeList.length ? 'Select Staff' : 'No matching staff') : 'Select Degree first'}
            value={selectedEmployee}
            onChange={(item) => setSelectedEmployee(item.value)}
            // react-native-element-dropdown uses "disable" prop (not "disabled")
            disable={!degrees || isLoading}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#290135" />
            </View>
          )}

          <ScrollView style={{ marginTop: 10 }}>
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

            <TouchableOpacity 
              onPress={() => {
                if (!isLoading) {
                  resetForm();
                  onClose();
                }
              }}
              disabled={isLoading}
            >
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
