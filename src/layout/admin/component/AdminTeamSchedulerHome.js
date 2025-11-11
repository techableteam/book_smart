import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Pressable,
  ActivityIndicator,
  Dimensions
} from "react-native";
import DatePicker from 'react-native-date-picker';
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import AddNewShiftModal from './AddNewShiftModal';
import AddWeeklyShiftsModal from './AddWeeklyShiftsModal';
import ApplicantsModal from './ApplicantsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import {
  getStaffShiftInfo,
  getShiftTypes,
  editShiftFromStaff,
  deleteShiftFromStaff,
  addShiftType,
  addShiftToStaff,
  getDegreeListInAdmin,
  getAllFacilitiesInAdmin,
  createDJob,
  getAllDjob,
  deleteDjob,
  getDjobForFacilitiesById
 } from '../../../utils/useApi';
import { transformStaffListToMockEvents } from './transformStaffListToMockEvents';
import { transformDjobListToMockEvents } from './transformDjobListToMockEvents';

import { RFValue } from "react-native-responsive-fontsize";

const BusyOverlay = ({ visible, text }) => {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.busyBackdrop}>
        <View style={styles.busyCard}>
          <ActivityIndicator size="large" />
          {text ? <Text style={styles.busyText}>{text}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

const normalizeStatus = (s) => {
  const v = (s || '').toLowerCase().trim();
  if (v === 'notselect') return 'AVAILABLE';
  if (v === 'assigned-pending') return 'ASSIGNED-PENDING';
  if (v === 'assigned-approved') return 'ASSIGNED-APPROVED';
  if (v === 'pending') return 'PENDING';
  if (v === 'approved' || v === 'approve' || v === 'accept') return 'APPROVED';
  if (v === 'rejected' || v === 'reject') return 'REJECTED';
  if (v === 'cancelled' || v === 'cancel') return 'CANCELLED';
  return v ? v.toUpperCase() : 'AVAILABLE';
};

const statusColors = (label) => {
  switch (label) {
    case 'AVAILABLE':         return { bg: '#808080', fg: '#E5E7EB' };
    case 'ASSIGNED-PENDING':  return { bg: '#DBEAFE', fg: '#1E40AF' };
    case 'ASSIGNED-APPROVED': return { bg: '#A7F3D0', fg: '#065F46' };
    case 'PENDING':           return { bg: '#FFC107', fg: '#A16207' };
    case 'APPROVED':          return { bg: '#DCFCE7', fg: '#166534' };
    case 'REJECTED':          return { bg: '#DC2626', fg: '#991B1B' };
    case 'CANCELLED':         return { bg: '#E5E7EB', fg: '#374151' };
    default:                  return { bg: '#EEE',    fg: '#000'     };
  }
};

const formatWeekRange = (anchorDate = new Date()) => {
  const d = new Date(anchorDate);
  d.setHours(12, 0, 0, 0);

  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  const m1 = sunday.toLocaleString('en-US', { month: 'short' });  
  const m2 = saturday.toLocaleString('en-US', { month: 'short' });
  const s  = sunday.getDate();
  const e  = saturday.getDate();
  const y1 = sunday.getFullYear();
  const y2 = saturday.getFullYear();

  if (y1 === y2) {
    if (m1 === m2) return `${m1} ${s}–${e}, ${y1}`;
    return `${m1} ${s} – ${m2} ${e}, ${y1}`;
  }

  return `${m1} ${s}, ${y1} – ${m2} ${e}, ${y2}`;
};


const AdminHomeTab = ({
  navigation,
  month,
  year,
  months,
  years,
  handlePrevMonth,
  handleNextMonth,
  handleSelectMonth,
  setShowMonthPicker,
  viewMode,
  setViewMode,
  showViewDropdown,
  setShowViewDropdown,
  calendarDays,
  selectedFacilityId,
  selectedFacilityCompanyName,
  onFacilityChange,
}) => {
  const [weekStartDate, setWeekStartDate] = useState(new Date());
  const [dayDate, setDayDate] = useState(new Date());
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [showAddWeekModal, setShowAddWeekModal] = useState(false);
  const [ShiftData, setShiftData] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [eventDate, setEventDate] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bootLoading, setBootLoading] = useState(false); 
  const [opLoading, setOpLoading] = useState(false);     
  const [busyText, setBusyText] = useState('');  
  const [degrees, setDegrees] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [djobList, setDjobList] = useState([]);
  const [transformedDjobList, setTransformedDjobList] = useState([]);

  // const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  // const [selectedFacilityCompanyName, setSelectedFacilityCompanyName] = useState(null);
  const [facilityDjobList, setFacilityDjobList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isValueOptionFocus, setIsValueOptionFocus] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);

  const [startTime, endTime] = React.useMemo(() => {
    const raw = String(selectedEvent?.time || '');
    const [s, e] = raw.split(/[➔➜→]/).map(t => t?.trim());
    return [s || '', e || ''];
  }, [selectedEvent?.time]);

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      setBusyText('Loading…');
      setBootLoading(true);
      try {
        await Promise.all([
          fetchStaffInfo(), 
          fetchShiftTypes(), 
          fetchDegrees(), 
          fetchFacilities(),
          // fetchDjobList()
        ]);
        setIsDataLoaded(true);
      } finally {
        setBootLoading(false);
        setBusyText('');
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedFacilityId != null) {
      const selectedFacility = facilities.find(
        f => String(f.aic) === String(selectedFacilityId)
      );
      if (selectedFacility) {
        handleFacilitySelect(selectedFacility);
      }
    }
  }, [selectedFacilityId, facilities]);

  const handleFacilitySelect = async (selectedFacility) => {
    // Early exit if no valid facility is selected
    if (!selectedFacility || !selectedFacility.aic) {
      console.error('Invalid facility selected');
      return;
    }
  
    try {
      onFacilityChange?.(selectedFacility.aic, selectedFacility.companyName);
  
      // Set loading state
      setBusyText('Loading…');
      setBootLoading(true);
  
      const djobResult = await getDjobForFacilitiesById(selectedFacility.aic);
      if (Array.isArray(djobResult?.data) && djobResult?.data.length > 0) {
        const transformedDjobList = await transformDjobListToMockEvents(djobResult.data);
        setFacilityDjobList(djobResult.data);
        setTransformedDjobList(transformedDjobList);
      } else {
        console.log("Djob list is empty or not in the expected format");
        setFacilityDjobList([]);
        setTransformedDjobList([]);
      }

      const data = await getStaffShiftInfo("facilities", selectedFacility.aic);
      const list = Array.isArray(data) ? data : [];
      setStaffList(list);

      const res = await getShiftTypes({ aic : selectedFacility.aic }, "facilities");
      const types = Array.isArray(res?.shiftType) ? res.shiftType : [];
      setShiftTypes(types);

     
    } catch (error) {
      // Improved error handling
      console.error('Error handling facility select:', error);
      Alert.alert('Error', 'Failed to load facility data. Please try again.');
    } finally {
      // Reset loading state
      setBootLoading(false);
      setBusyText('');
    }
  };
  
  const fetchDegrees = async () => {
    try {
      const list = await getDegreeListInAdmin('degree');
      setDegrees(Array.isArray(list) ? list : []);
    } catch {
      setDegrees([]);
    }
  };

  const fetchFacilities = async () => {
    try {
      const list = await getAllFacilitiesInAdmin();
      setFacilities(Array.isArray(list) ? list : []);
    } catch {
      setFacilities([]);
    }
  };

  const fetchStaffInfo = async () => {
    if(selectedFacilityId != null){
      try {
        const data = await getStaffShiftInfo("facilities", selectedFacilityId);
        const list = Array.isArray(data) ? data : [];
        setStaffList(list);
        setShiftData(transformStaffListToMockEvents(list));
      } catch (err) {
        console.error('Error fetching staff list:', err);
        setStaffList([]);
        setShiftData({});
      }
    } else{
      setStaffList([]);
      setShiftData({});
    }
   
  };

  const fetchShiftTypes = async () => {
    if (selectedFacilityId != null ){
      try {
        const res = await getShiftTypes({ aic : selectedFacilityId }, "facilities");
        const types = Array.isArray(res?.shiftType) ? res.shiftType : [];
        setShiftTypes(types);
      } catch (err) {
        setShiftTypes([]);
      }
    }else{
      setShiftTypes([]);
    }
   
  };


  const ensurePrereqs = async () => {
    if (!isDataLoaded) {
      return { needShiftTypes: true, needStaff: true }; // do not proceed if data is not loaded
    }
  

    const needShiftTypes = !Array.isArray(shiftTypes) || shiftTypes.length === 0;
    const needStaff = !Array.isArray(staffList) || staffList.length === 0;

    return { needShiftTypes, needStaff };
  };

  const openCreateSingleShift = async () => {
    if (!selectedFacilityId) {
      Alert.alert('Select Facility', 'Please select a facility before proceeding.');
      return;
    }
  
    const { needShiftTypes, needStaff } = await ensurePrereqs();
  
    if (needShiftTypes || needStaff) {
      Alert.alert(
        "Missing data",
        `${[
          needShiftTypes ? "Shift types" : null,
          needStaff ? "Staff list" : null,
        ]
          .filter(Boolean)
          .join(" and ")} not selected yet. Please make it first.`
      );
      return;
    }
  
    setShowAddShiftModal(true);
  };
  
  const openCreateNextWeek = async () => {
    if (!selectedFacilityId) {
      Alert.alert('Select Facility', 'Please select a facility before proceeding.');
      return;
    }
  
    const { needShiftTypes, needStaff } = await ensurePrereqs();
  
    if (needShiftTypes || needStaff) {
      Alert.alert(
        "Missing data",
        `${[
          needShiftTypes ? "Shift types" : null,
          needStaff ? "Staff list" : null,
        ]
          .filter(Boolean)
          .join(" and ")} not selected yet. Please make it first.`
      );
      return;
    }
  
    setShowAddWeekModal(true);
  };
  

  const handlePrev = () => {
    if (viewMode === "Month") {
      handlePrevMonth();
    } else if (viewMode === "Week") {
      setWeekStartDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() - 7);
        return newDate;
      });
    } else if (viewMode === "Day") {
      setDayDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() - 1);
        return newDate;
      });
    }
  };

  const handleNext = () => {
    if (viewMode === "Month") {
      handleNextMonth();
    } else if (viewMode === "Week") {
      setWeekStartDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
      });
    } else if (viewMode === "Day") {
      setDayDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
      });
    }
  };

  const handleConfirmDelete = async () => {
     try {
      setBusyText('Deleting…');
      setDeleting(true);
     
      const result = await deleteDjob(
        selectedEvent.DJobId,                    
      );
  
      if (result?.success) {
        const selectedFacility = facilities.find(facility => facility.aic === selectedFacilityId);
      
        if (selectedFacility) {
          await handleFacilitySelect(selectedFacility);
        } else {
          console.error('Selected facility not found');
        }
        setShowConfirmDelete(false);
        setShowEventModal(false);
        setSelectedEvent(null);
      } else {
        Alert.alert(`Delete failed: ${result?.message || 'Unknown error'}`);
        const selectedFacility = facilities.find(facility => facility.aic === selectedFacilityId);
        if (selectedFacility) {
          await handleFacilitySelect(selectedFacility);
        } else {
          console.error('Selected facility not found');
        }
        setShowConfirmDelete(false);
      }
    } catch (e) {
      console.error('Delete error:', e);
      Alert.alert('Delete failed. Please try again.');
      await fetchStaffInfo();
      setShowConfirmDelete(false);
    } finally {
      setDeleting(false);
      setBusyText('');
    }
  };

  const normalizeTime = (s = "") =>
    s
      .replace(/\u202F/g, " ")        
      .replace(/\s+/g, " ")           
      .replace(/[^\dAPMapm: ]/g, "")  
      .trim()
      .toUpperCase();

  const handleMonthEventPress = (event, cellDate) => {
    setSelectedEvent(event);
    setEventDate(cellDate);
    setShowEventModal(true);
  
    if (event?.time && Array.isArray(shiftTypes) && shiftTypes.length) {
      const [startRaw, endRaw] = event.time.split("➔").map(t => (t || "").trim());
  
      const startN = normalizeTime(startRaw);
      const endN   = normalizeTime(endRaw);
  
      const matched = shiftTypes.find(s =>
        normalizeTime(s.start) === startN && normalizeTime(s.end) === endN
      );
  
      setSelectedShift(matched ? matched.id : null);
    } else {
      setSelectedShift(null);
    }
  };

  const _norm = (s = "") =>
    s.replace(/\u202F/g, " ").replace(/\s+/g, " ").replace(/[^\dAPMapm: ]/g, "").trim().toUpperCase();

  const handleCreateShiftFromRange = async ({
    date,
    startLabel,
    endLabel,
    staffId,
    shiftText,
    facilityId,
    degreeId
  }) => {
    try {
      if (!date || !startLabel || !endLabel || !degreeId) {
        Alert.alert('Missing info', 'Please pick a degree and a valid time range.');
        return;
      }
      const [AIdRaw] = await Promise.all([
        AsyncStorage.getItem('AId'),
      ]);
      const AId = Number.parseInt((AIdRaw || '').trim(), 10);
 
      if (!Number.isFinite(AId) ) {
        Alert.alert('Account issue', 'Unable to determine your role/account. Please re-login.');
        return;
      }
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      const timeStr = `${startLabel} ➔ ${endLabel}`;
      const shiftPayload = [{ date: formattedDate, time: timeStr }];
      
      const result = await createDJob({
        shiftPayload : shiftPayload,
        degreeId : degreeId,
        facilityId : facilityId,
        staffId : staffId,
        adminId: AId,
        adminMade: true,
      });
      
      const jobId = result?.data?.DJobId ?? result?.data?.id;

      if (jobId) {
        const selectedFacility = facilities.find(facility => facility.aic === selectedFacilityId);
        if (selectedFacility) {
          await handleFacilitySelect(selectedFacility);
        }
        Alert.alert('Shift created', `${formattedDate} • ${timeStr}`);
      } else {
        Alert.alert('Create failed', result?.message || 'Unexpected response.');
      }
    } catch (err) {
      console.error('handleCreateShiftFromRange error:', err);
      Alert.alert('Create failed', err?.message || 'Please try again.');
    }
  };
  

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Dropdown
          style={[
            styles.dropdownFacilities,
            { 
              width: '80%', 
              alignSelf: 'flex-end', 
              marginTop: 10,         
              height: 40, 
            },
            isValueOptionFocus && { borderColor: 'blue' },
          ]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          iconStyle={styles.iconStyle}
          data={facilities}
          maxHeight={300}
          labelField="companyName"
          valueField="aic"
          placeholder={"Select Facility"}
          value={selectedFacilityId} 
          onFocus={() => setIsValueOptionFocus(true)}
          onBlur={() => setIsValueOptionFocus(false)}
          onChange={(item) => handleFacilitySelect(item)}
        />
    </View>

    <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
      <View style={styles.topRightControls}>
        <View style={styles.shiftButtonGroup}>
          <TouchableOpacity 
            style={styles.shiftButtonPrimary} 
            onPress={openCreateSingleShift}>
            <Text style={styles.shiftButtonText} numberOfLines={1} ellipsizeMode="tail">
              Create Single Shift
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shiftButtonSecondary} 
            onPress={openCreateNextWeek}>
            <Text style={styles.shiftButtonText} numberOfLines={1} ellipsizeMode="tail">
              Create Next Week's Shifts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
            <Text style={styles.navText}>◀</Text>
          </TouchableOpacity>

          <Text style={styles.monthYearText}>
            {viewMode === "Month"
              ? `${months[month].slice(0, 3)} ${year}`
              : viewMode === "Week"
              ? formatWeekRange(weekStartDate)  
              : dayDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
          </Text>


          <TouchableOpacity onPress={handleNext} style={styles.navButton}>
            <Text style={styles.navText}>▶</Text>
          </TouchableOpacity>

          <View style={styles.viewModeWrapper}>
            <TouchableOpacity
              style={styles.viewModeButton}
              onPress={() => setShowViewDropdown((prev) => !prev)}
            >
              <Text style={styles.viewModeButtonText}>{viewMode}</Text>
            </TouchableOpacity>

            {showViewDropdown && (
              <View style={styles.dropdownOverCalendar}>
                {["Month", "Week", "Day"].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => {
                      setViewMode(mode);
                      setShowViewDropdown(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      viewMode === mode && styles.dropdownSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        viewMode === mode && styles.dropdownSelectedText,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
      

      {viewMode === "Month" && (
        <MonthView
          calendarDays={calendarDays}
          mockEvents={transformedDjobList}
          setSelectedEvent={setSelectedEvent}
          setShowEventModal={setShowEventModal}
          setEventDate={setEventDate} 
          onEventPress={handleMonthEventPress}
        />
      )}
      

      {viewMode === 'Week' && (
        <WeekView
          startDate={weekStartDate}l
          mockEvents={transformedDjobList}
          onEventPress={handleMonthEventPress}
          setSelectedEvent={setSelectedEvent}
          setShowEventModal={setShowEventModal}
          staffList={staffList}
          degrees={degrees}         
          facilities={facilities}
          djobList={djobList}
          selectedFacilityId={selectedFacilityId}
          selectedFacilityCompanyName={selectedFacilityCompanyName}
          onTimeRangeSelected={handleCreateShiftFromRange}
        />
      )}


      {viewMode === "Day" && (
        <DayView
          date={dayDate}
          setDate={setDayDate}
          mockEvents={transformedDjobList}
          setSelectedEvent={setSelectedEvent}
          setShowEventModal={setShowEventModal}
        />
      )}

      <AddNewShiftModal
        visible={showAddShiftModal}
        onClose={() => setShowAddShiftModal(false)}
        staffList={staffList}
        facilitieslist={facilities}
        degreelist={degrees}
        selectedFacilitiesId={selectedFacilityId}
        selectedFacilitiescompanyName={selectedFacilityCompanyName}
        refreshShiftData={() => {
          const selectedFacility = facilities.find(facility => facility.aic === selectedFacilityId);
          if (selectedFacility) {
            handleFacilitySelect(selectedFacility);
          }
        }}
      />

      <AddWeeklyShiftsModal
        visible={showAddWeekModal}
        onClose={() => setShowAddWeekModal(false)}
        staffList={staffList}
        facilitieslist={facilities}
        degreelist={degrees}
        selectedFacilitiesId={selectedFacilityId}
        selectedFacilitiescompanyName={selectedFacilityCompanyName}
        refreshShiftData={() => {
          const selectedFacility = facilities.find(facility => facility.aic === selectedFacilityId);
          if (selectedFacility) {
            handleFacilitySelect(selectedFacility);
          }
        }}
      />
    </ScrollView>

      <Modal visible={showEventModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.eventModal}>

          <View style={styles.modalHeaderRow}>
            {(() => {
              const label = normalizeStatus(
                selectedEvent?.status ?? selectedEvent?.data?.status
              );
              const colors = statusColors(label);
              return (
                <View style={[styles.statusChip, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.statusText, { color: colors.fg }]}>{label}</Text>
                </View>
              );
            })()}

            <Pressable
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  'Delete this shift?',
                  'This action cannot be undone.',
                  [
                    { text: 'No', onPress: () => setShowConfirmDelete(false), style: 'cancel' },
                    { text: 'Yes, delete', onPress: handleConfirmDelete, style: 'destructive' },
                  ],
                  { cancelable: false }
                );
              }}
            >
              <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
            </Pressable>
          </View>

            <Text style={styles.label}>Day</Text>
           
            <View style={{ position: 'relative' }}>
              <TextInput
                mode="outlined"
                value={eventDate ? new Date(eventDate).toLocaleDateString('en-US', {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                }) : ''}
                editable={false}
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>Facility</Text>
            <TextInput
              mode="outlined"
              value={selectedEvent?.facilitiesCompanyName || ''}
              editable={false}
              style={styles.input}
            />

            <Text style={styles.label}>
              Degree <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              mode="outlined"
              value={selectedEvent?.degreeName || ''}
              editable={false}
              style={styles.input}
            />

            <Text style={styles.label}>Staff</Text>
            <TextInput
              mode="outlined"
              value={Array.isArray(selectedEvent?.clinicianslabel) 
                ? (selectedEvent?.clinicianslabel.length ? selectedEvent.clinicianslabel.join(', ') : '') 
                : (selectedEvent?.clinicianslabel === "Unknown Clinician" ? '' : selectedEvent?.clinicianslabel)}
              editable={false}
              style={styles.input}
            />

            {/* Show applicants button if there are pending applicants */}
            {(() => {
              const applicants = selectedEvent?.data?.job?.applicants || [];
              const pendingCount = applicants.filter(a => a && a.status === 'pending').length;
              
              if (pendingCount > 0) {
                return (
                  <TouchableOpacity
                    style={styles.viewApplicantsBtn}
                    onPress={() => {
                      setSelectedJobForApplicants(selectedEvent.data.job);
                      setShowEventModal(false);
                      setTimeout(() => setShowApplicantsModal(true), 300);
                    }}
                  >
                    <Text style={styles.viewApplicantsText}>
                      👥 View {pendingCount} Applicant(s)
                    </Text>
                  </TouchableOpacity>
                );
              }
              return null;
            })()}

            <Text style={styles.label}>Shift</Text>
            <View style={styles.shiftScrollBox}>
              <ScrollView
                contentContainerStyle={styles.shiftListContent}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                 <View style={styles.shiftOptions}>
                  <View style={[styles.shiftButton, styles.shiftButtonSelected]}>
                    <Text style={[styles.shiftText, styles.shiftTextSelected]}>
                      {startTime && endTime ? `${startTime} ➔ ${endTime}` : '—'}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ApplicantsModal
        visible={showApplicantsModal}
        onClose={() => {
          setShowApplicantsModal(false);
          setSelectedJobForApplicants(null);
        }}
        djobData={selectedJobForApplicants}
        onApplicantReviewed={async () => {
          setShowApplicantsModal(false);
          setSelectedJobForApplicants(null);
          const selectedFacility = facilities.find(facility => facility.aic === selectedFacilityId);
          if (selectedFacility) {
            await handleFacilitySelect(selectedFacility);
          }
        }}
      />

      <BusyOverlay
        visible={bootLoading || opLoading || deleting}
        text={busyText || (deleting ? 'Deleting…' : '')}
      />
    </View>

   
  );
};

const styles = StyleSheet.create({
  
  dropdownFacilities: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 2,
    backgroundColor: '#f9f9f9',
    paddingLeft : 15,
    paddingRight : 10,
    marginEnd : 10
  },
  placeholderStyle: {
    color: 'gray',
    fontSize: RFValue(14),
  },
  selectedTextStyle: {
    color: 'black',
    fontSize: RFValue(14),
  },
  itemTextStyle: {
    color: 'black'
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: RFValue(16),
  },
  busyBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  busyCard: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 160,
    gap: 10,
  },

  busyText: {
    color: '#111',
    fontWeight: '700',
  },

  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  statusChip: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  
  statusText: {
    fontWeight: '700',
  },

  topRightControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 10,
  },

  shiftButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal : 10
  },
  
  shiftButtonPrimary: {
    backgroundColor: "#7A8A91",
    paddingHorizontal: 2,
    paddingVertical: 5,
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: "40%",       // 40%
    minWidth: 0,        // needed for ellipsis on Android
    overflow: "hidden",
    marginRight: 8,     // spacing between buttons
  },
  
  shiftButtonSecondary: {
    backgroundColor: "#7A8A91",
    paddingHorizontal: 2,
    paddingVertical: 5,
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: "60%",       // 60%
    minWidth: 0,
    overflow: "hidden",
  },
  
  shiftButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: RFValue(10),
    textAlign: "center",
    flexShrink: 1,      // allow truncation
  },
  
  
  headerContainer: {
    position: 'relative', 
  },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  
  viewModeWrapper: {
    position: "relative",
  },
  navButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  navText: {
    fontSize: RFValue(11),
    fontWeight: "bold",
    color: "#000",
  },
  monthYearText: {
    fontSize: RFValue(11),
    fontWeight: "bold",
    color: "#000",
  },
 
  viewModeButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 40,
    justifyContent: "center",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  viewModeButtonText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "bold",
  },
  dropdownOverCalendar: {
    position: "absolute",
    top: 42,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    width: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    zIndex: 9999,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownText: {
    color: "#000",
    fontWeight: "bold",
  },
  dropdownSelected: {
    backgroundColor: "#e8f0fe",
  },
  dropdownSelectedText: {
    color: "#1a73e8",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    elevation: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    color : 'black'
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#f9f9f9',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#290135',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#333',
    textAlign: 'center',
    padding: 10,
    fontWeight: 'bold',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    padding: 10,
    borderRadius: 6,
    borderWidth : 2,
    borderColor : "black"
  },
  deleteButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  confirmModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    elevation: 5,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  confirmSubtitle: {
    color: '#555',
    marginBottom: 16,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  confirmCancel: {
    borderColor: '#333',
    backgroundColor: 'transparent',
  },
  confirmCancelText: {
    color: '#333',
    fontWeight: '700',
  },
  confirmDelete: {
    borderColor: '#d00',
    backgroundColor: '#d00',
  },
  confirmDeleteText: {
    color: '#fff',
    fontWeight: '700',
  },
  shiftScrollBox: {
    maxHeight: Math.floor(Dimensions.get("window").height * 0.3), // ~35% of screen; tweak if needed
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 12,
  },
  
  shiftListContent: {
    padding: 10,
  },

  shiftOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  viewApplicantsBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  viewApplicantsText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default AdminHomeTab;
