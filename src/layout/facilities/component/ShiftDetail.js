import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
  Alert,
  Platform,
  Pressable,
} from 'react-native';
import MFooter from '../../../components/Mfooter';
import MHeader from '../../../components/Mheader';
import { RFValue } from 'react-native-responsive-fontsize';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateShiftType, deleteShiftType } from '../../../utils/useApi';

const { height } = Dimensions.get('window');

const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const formatTime = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return timeFmt.format(date);
};

const parseTime = (input) => {
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input;

  const str = String(input || '')
    .replace(/\u202F|\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  let m = str.match(/^(\d{1,2})[:.](\d{2})\s*(AM|PM)$/i);
  if (m) {
    let [, hh, mm, mer] = m;
    let h = parseInt(hh, 10);
    const minutes = parseInt(mm, 10);
    if (mer === 'PM' && h < 12) h += 12;
    if (mer === 'AM' && h === 12) h = 0;
    const d = new Date();
    d.setSeconds(0, 0);
    d.setHours(h, minutes);
    return d;
  }

  m = str.match(/^(\d{1,2})[:.](\d{2})$/);
  if (m) {
    let [, hh, mm] = m;
    const h = Math.min(Math.max(parseInt(hh, 10), 0), 23);
    const minutes = Math.min(Math.max(parseInt(mm, 10), 0), 59);
    const d = new Date();
    d.setSeconds(0, 0);
    d.setHours(h, minutes);
    return d;
  }

  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(9, 0);
  return d;
};

export default function ShiftDetailScreen({ route, navigation }) {
  const { shift } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(shift.name);
  const [start, setStart] = useState(parseTime(shift.start));
  const [end, setEnd] = useState(parseTime(shift.end));
  const [currentShift, setCurrentShift] = useState(route.params.shift);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [draftStart, setDraftStart] = useState(start || new Date());
  const [draftEnd, setDraftEnd] = useState(end || new Date());
  const [pressedStart, setPressedStart] = useState(false);
  const [pressedEnd, setPressedEnd] = useState(false);

  const isChanged =
    name !== shift.name ||
    formatTime(start) !== shift.start ||
    formatTime(end) !== shift.end;

  const openStartPicker = () => {
    setDraftStart(start || new Date());
    setShowStartPicker(true);
  };
  const openEndPicker = () => {
    setDraftEnd(end || new Date());
    setShowEndPicker(true);
  };

  const commitStart = () => {
    setStart(draftStart || start || new Date());
    setShowStartPicker(false);
  };
  const commitEnd = () => {
    setEnd(draftEnd || end || new Date());
    setShowEndPicker(false);
  };

  const saveChanges = async () => {
    try {
      const [aicRaw] = await Promise.all([
        AsyncStorage.getItem('aic'),
      ]);
      const aic = Number.parseInt(aicRaw ?? '', 10);
      if (Number.isNaN(aic)) {
        console.warn('saveChanges: invalid aic', { aicRaw});
        return;
      }

      const body = {
        aic,
        shiftId: shift.id,
        updatedShift: {
          name,
          start: formatTime(start),
          end: formatTime(end),
        },
      };

      const res = await updateShiftType(body, "facilities");
      if (res?.error) {
        console.warn('Update failed:', res.error);
        return;
      }

      setCurrentShift({
        id: shift.id,
        name,
        start: formatTime(start),
        end: formatTime(end),
      });
      setShowStartPicker(false);
      setShowEndPicker(false);
      setModalVisible(false);
    } catch (err) {
      console.error('saveChanges error:', err);
    }
  };

  const deleteShift = () => {
    Alert.alert('Delete Shift', 'Are you sure you want to delete this shift?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const [aicRaw] = await Promise.all([
              AsyncStorage.getItem('aic'),
            ]);
            const aic = Number.parseInt(aicRaw ?? '', 10);
            if (Number.isNaN(aic)) {
              console.warn('deleteShift: invalid aic', { aicRaw });
              return;
            }

            const body = { aic, shiftId: shift.id };
            const res = await deleteShiftType(body, "facilities");

            if (!res?.error) {
              navigation.navigate('SchedulerScreen', {
                screen: 'ShiftTab',
              });
            } else {
              console.warn('Delete failed:', res.error);
            }
          } catch (err) {
            console.error('deleteShift error:', err);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <MHeader back />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.editBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={deleteShift}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nameSection}>
        <Text style={styles.label}>
          Label: <Text style={styles.value}>{currentShift.name}</Text>
        </Text>
        <Text style={styles.label}>
          Time: <Text style={styles.value}>{currentShift.start} → {currentShift.end}</Text>
        </Text>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Shift</Text>

            <TextInput
              placeholder="Name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              style={styles.modalInput}
            />

            {/* Start time (Pressable fake input) */}
            <Pressable
              onPressIn={() => setPressedStart(true)}
              onPressOut={() => setPressedStart(false)}
              onPress={openStartPicker}
              style={[styles.modalInput, pressedStart && { opacity: 0.7 }]}
            >
              <Text
                style={[
                  styles.fakeText,
                  start ? styles.valueText : styles.placeholderText,
                ]}
              >
                {start ? formatTime(start) : 'Start time (e.g. 8:00 AM)'}
              </Text>
            </Pressable>

            {/* End time (same style) */}
            <Pressable
              onPressIn={() => setPressedEnd(true)}
              onPressOut={() => setPressedEnd(false)}
              onPress={openEndPicker}
              style={[styles.modalInput, pressedEnd && { opacity: 0.7 }]}
            >
              <Text
                style={[
                  styles.fakeText,
                  end ? styles.valueText : styles.placeholderText,
                ]}
              >
                {end ? formatTime(end) : 'End time (e.g. 4:00 PM)'}
              </Text>
            </Pressable>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowStartPicker(false);
                  setShowEndPicker(false);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { opacity: isChanged ? 1 : 0.5 }]}
                onPress={saveChanges}
                disabled={!isChanged}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* iOS wheels for START */}
            {showStartPicker && Platform.OS === 'ios' && (
              <View style={styles.iosSheet}>
                <View style={styles.iosSheetHeader}>
                  <TouchableOpacity onPress={commitStart}>
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={draftStart}
                  mode="time"
                  display="spinner"
                  preferredDatePickerStyle="wheels"
                  // themeVariant="light"
                  textColor="black"
                  onChange={(e, d) => d && setDraftStart(d)}
                  style={{ height: 216 }}
                />
              </View>
            )}

            {/* iOS wheels for END */}
            {showEndPicker && Platform.OS === 'ios' && (
              <View style={styles.iosSheet}>
                <View style={styles.iosSheetHeader}>
                  <TouchableOpacity onPress={commitEnd}>
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={draftEnd}
                  mode="time"
                  display="spinner"
                  preferredDatePickerStyle="wheels"
                  // themeVariant="light"
                  textColor="black"
                  onChange={(e, d) => d && setDraftEnd(d)}
                  style={{ height: 216 }}
                />
              </View>
            )}
          </View>
        </View>

        {/* Android dialogs (outside content so they appear as a popup) */}
        {showStartPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={start || new Date()}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              if (event?.type === 'set' && selectedDate) setStart(selectedDate);
              setShowStartPicker(false);
            }}
          />
        )}

        {showEndPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={end || new Date()}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              if (event?.type === 'set' && selectedDate) setEnd(selectedDate);
              setShowEndPicker(false);
            }}
          />
        )}
      </Modal>

      <MFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  // text styles for fake inputs
  fakeText: { color: '#111827', fontWeight: '400' },
  valueText: { color: '#111827', fontWeight: '600' },
  placeholderText: { color: '#9CA3AF', fontWeight: '400' },

  container: { flex: 1, backgroundColor: '#fff' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: RFValue(16),
    marginTop: height * 0.18,
  },
  editBtn: {
    flexDirection: 'row',
    backgroundColor: '#CBD5E1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginEnd: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  editText: { color: '#000', fontWeight: '600' },
  deleteBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  deleteText: { color: '#fff', fontWeight: '600' },
  nameSection: { paddingHorizontal: 16, marginTop: 20 },
  label: { fontSize: 15, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, color: '#000', fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000077',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  modalInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    padding: 12,
    color: '#000',
    width: '100%',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginRight: 6,
    alignItems: 'center',
  },
  cancelText: { color: '#000', fontWeight: '500' },
  saveBtn: {
    flex: 1,
    backgroundColor: '#290135',
    padding: 12,
    borderRadius: 6,
    marginLeft: 6,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: 'bold' },

  // iOS picker sheet
  iosSheet: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    width: '100%',
  },
  iosSheetHeader: {
    alignItems: 'flex-end',
    padding: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  doneText: { fontWeight: '600', color: '#290135' },
});
