import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import MHeader from '../../components/Mheader';
import MFooter from '../../components/Mfooter';
import CustomTopNav from '../../components/CustomTopNav';
import AdminHomeTab from './component/AdminTeamSchedulerHome';
import AdminStaffTab from './component/AdminTeamStaffTap';
import AdminShiftTab from './component/AdminshiftTap';

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const generateYears = (start, end) => {
  const years = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
};

const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

const getStartDay = (month, year) => {
  const day = new Date(year, month, 1).getDay(); // Sunday = 0
  return day === 0 ? 6 : day - 1;
};

const { width, height } = Dimensions.get('window');


const AdminTeamScheduler = ({ navigation }) => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);

  const [selectedTab, setSelectedTab] = useState("Home");
  const [viewMode, setViewMode] = useState("Week");
  const years = generateYears(2000, 2030);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [selectedFacilityCompanyName, setSelectedFacilityCompanyName] = useState(null);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const handleSelectMonth = (m) => {
    setMonth(m);
    setShowMonthPicker(false);
  };

  const buildCalendarDays = () => {
    const days = [];
    const startDay = getStartDay(month, year);
    const daysInMonth = getDaysInMonth(month, year);

    // Previous month info
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(prevMonth, prevYear);

    // Add previous month's ending days
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({ day, month: prevMonth, year: prevYear, isFaded: true });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month, year, isFaded: false });
    }

    // Add next month's starting days to fill 6 rows (35 days total)
    const total = days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; total + i <= 35; i++) {
      days.push({ day: i, month: nextMonth, year: nextYear, isFaded: true });
    }
    return days;
  };

  const calendarDays = buildCalendarDays();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent"/>
      <MHeader navigation={navigation} back={true} />
      <CustomTopNav selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

        {selectedTab === "Home" && (
          <AdminHomeTab
            navigation={navigation}
            month={month}
            year={year}
            months={months}
            years={years}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            handleSelectMonth={handleSelectMonth}
            setShowMonthPicker={setShowMonthPicker}
            viewMode={viewMode}
            setViewMode={setViewMode}
            showViewDropdown={showViewDropdown}
            setShowViewDropdown={setShowViewDropdown}
            calendarDays={calendarDays}
            selectedFacilityId={selectedFacilityId}
            selectedFacilityCompanyName={selectedFacilityCompanyName}
            onFacilityChange={(id, name) => {
              setSelectedFacilityId(id);
              setSelectedFacilityCompanyName(name);
            }}
          />
        )}

        {selectedTab === "Staff" && (
          <AdminStaffTab
            selectedFacilityId={selectedFacilityId}
            selectedFacilityCompanyName={selectedFacilityCompanyName}
          />
        )}

        {selectedTab === "Shifts" && (
          <AdminShiftTab
            selectedFacilityId={selectedFacilityId}
            selectedFacilityCompanyName={selectedFacilityCompanyName}
          />
        )}
      <MFooter />

      {/* Month-Year Picker Modal */}
      <Modal visible={showMonthPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month & Year</Text>

            <Picker
              selectedValue={year}
              onValueChange={(value) => setYear(value)}
              style={styles.yearPicker}
            >
              {years.map((y) => (
                <Picker.Item key={y} label={String(y)} value={y} />
              ))}
            </Picker>

            <FlatList
              data={months}
              numColumns={3}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.monthButton}
                  onPress={() => handleSelectMonth(index)}
                >
                  <Text style={styles.monthText}>{item}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    width : "100%",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop : 10,
    paddingHorizontal : 10
  },
 
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 16,
    borderRadius: 10,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  yearPicker: {
    marginBottom: 10,
  },
  monthButton: {
    flex: 1,
    margin: 4,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    alignItems: "center",
  },
  monthText: {
    color: "#000",
    fontSize: 14,
  },
  closeText: {
    textAlign: "center",
    color: "red",
    marginTop: 10,
  },
  eventModalContent: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 16,
    borderRadius: 10,
  },
  eventDetailText: {
    color: "#333",
    marginBottom: 6,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  eventColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
});


export default AdminTeamScheduler;
