import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addShiftType } from '../../../utils/useApi';

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function AdminAddShiftModal({ visible, onClose, onReload, selectedFacilityId }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [draftStart, setDraftStart] = useState(new Date());
  const [draftEnd, setDraftEnd] = useState(new Date());
  const [isPressedStart, setIsPressedStart] = useState(false);
  const [isPressedEnd, setIsPressedEnd] = useState(false);

  useEffect(() => {
  }, [showStartPicker, showEndPicker]);

  const openStartPicker = () => {
    setDraftStart(startTime || new Date());
    setShowStartPicker(true);
  };
  const openEndPicker = () => {
    setDraftEnd(endTime || new Date());
    setShowEndPicker(true);
  };

  const commitStart = () => {
    setStartTime(draftStart || startTime || new Date());
    setShowStartPicker(false);
  };
  const commitEnd = () => {
    setEndTime(draftEnd || endTime || new Date());
    setShowEndPicker(false);
  };

  const handleSubmit = async () => {
    if (!name?.trim()) {
      setError('Please enter a name.');
      return;
    }
    if (!startTime || !endTime) {
      setError('Start and end time must be selected.');
      return;
    }
    if (endTime <= startTime) {
      setError('End time must be later than start time.');
      return;
    }


    try {
      const body = {
        aic : selectedFacilityId,
        name: name.trim(),
        start: formatTime(startTime),
        end: formatTime(endTime),
      };
      const response = await addShiftType(body, "facilities");
      if (response?.error) {
        setError('Failed to add shift.');
        return;
      }
      onClose?.();
      onReload?.();
      setName('');
      setError('');
    } catch (err) {
      console.error('addShiftType error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Shift Type</Text>

          <TextInput
            placeholder="Shift name"
            value={name}
            onChangeText={setName}
            style={styles.textInput}
          />

          {/* Start time (Pressable “fake input”) */}
          <Pressable
            onPressIn={() => setIsPressedStart(true)}
            onPressOut={() => setIsPressedStart(false)}
            onPress={openStartPicker}
            style={[styles.input, isPressedStart && { opacity: 0.7 }]}
          >
            <Text
              style={[
                styles.fakeText,
                startTime ? styles.valueText : styles.placeholderText,
              ]}
            >
              {startTime ? formatTime(startTime) : 'Start time (e.g. 8:00 AM)'}
            </Text>
          </Pressable>

          {/* End time (same format as start) */}
          <Pressable
            onPressIn={() => setIsPressedEnd(true)}
            onPressOut={() => setIsPressedEnd(false)}
            onPress={openEndPicker}
            style={[styles.input, isPressedEnd && { opacity: 0.7 }]}
          >
            <Text
              style={[
                styles.fakeText,
                endTime ? styles.valueText : styles.placeholderText,
              ]}
            >
              {endTime ? formatTime(endTime) : 'End time (e.g. 4:00 PM)'}
            </Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={() => {
                setName('');
                setStartTime(null);
                setEndTime(null);
                setError('');
                onClose?.();
              }}
              style={styles.cancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submit}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>

          {/* START PICKER */}
          {showStartPicker &&
            (Platform.OS === 'ios' ? (
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
                  textColor="black"
                  onChange={(e, d) => {
                    if (d) setDraftStart(d);
                  }}
                  style={{ height: 216 }}
                />
              </View>
            ) : (
              <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                display="default"
                onChange={(e, d) => {
                  // Android dialog returns 'set' or 'dismissed'
                  if (e?.type === 'set' && d) setStartTime(d);
                  setShowStartPicker(false);
                }}
              />
            ))}

          {/* END PICKER */}
          {showEndPicker &&
            (Platform.OS === 'ios' ? (
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
                  textColor="black"
                  onChange={(e, d) => {
                    if (d) setDraftEnd(d);
                  }}
                  style={{ height: 216 }}
                />
              </View>
            ) : (
              <DateTimePicker
                value={endTime || new Date()}
                mode="time"
                display="default"
                onChange={(e, d) => {
                  if (e?.type === 'set' && d) setEndTime(d);
                  setShowEndPicker(false);
                }}
              />
            ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fakeText: { color: '#111827', fontWeight: '400' },
  valueText: { color: '#111827', fontWeight: '600' },
  placeholderText: { color: '#9CA3AF', fontWeight: '400' },

  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '85%',
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
   textInput: {
    height: 40,
    paddingHorizontal: 12,
    paddingVertical: 0,                // avoid growing on Android
    color: '#111827',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 12,
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center' } : null),
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ccc',
    borderRadius: 6,
  },
  cancelText: {
    fontWeight: 'bold',
  },
  submit: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#290135',
    borderRadius: 6,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  iosSheet: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  iosSheetHeader: {
    alignItems: 'flex-end',
    padding: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  doneText: { fontWeight: '600', color: '#290135' },
});
