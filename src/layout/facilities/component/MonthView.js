import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";


export default function MonthView({
  calendarDays,
  mockEvents,
  setSelectedEvent,
  setShowEventModal,
  setEventDate,
  onEventPress,
  footerHeight = 110,
  nestedScrollEnabled = false,
}) {
  const dateKey = (y, m, d) =>
    new Date(y, m, d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [modalDayEvents, setModalDayEvents] = useState([]);
  const [modalDate, setModalDate] = useState(null);

  const openDayList = (events, date) => {
    setModalDayEvents(events || []);
    setModalDate(date);
    setShowDayEventsModal(true);
  };

  return (
    <>
      {/* Main vertical scroll so content isn't hidden behind the footer */}
      <ScrollView
        style={{ flex: 1, zIndex: -1 }}
        contentContainerStyle={{ paddingBottom: footerHeight }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={nestedScrollEnabled}
      >
        <View style={styles.calendarGrid}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <Text key={d} style={styles.dayHeader}>{d}</Text>
          ))}

          {calendarDays.map((dayObj, index) => {
            const { day, month, year, isFaded } = dayObj;
            const key = dateKey(year, month, day);
            const dayEvents = mockEvents[key] || [];
            const cellDate = new Date(year, month, day);

            return (
              <View key={index} style={styles.dayCell}>
                <Text style={[styles.dayNumber, isFaded && { color: "#bbb" }]}>{day}</Text>

                {dayEvents.slice(0, 2).map((event, idx) => {
                  const openDayEvents = () => openDayList(dayEvents, cellDate);

                  return (
                    <TouchableOpacity
                      key={`${event?.id ?? "e"}-${idx}`}
                      style={[styles.eventDot, { backgroundColor: event.color }]}
                      onPress={() => {
                        if (dayEvents.length > 2) {
                          openDayEvents();
                        } else if (onEventPress) {
                          onEventPress(event, cellDate);
                        } else {
                          setSelectedEvent?.(event);
                          setEventDate?.(cellDate);
                          setShowEventModal?.(true);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text numberOfLines={1} style={styles.eventText}>
                        {event.status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {dayEvents.length > 2 && (
                  <TouchableOpacity onPress={() => openDayList(dayEvents, cellDate)}>
                    <Text style={styles.moreText}>+{dayEvents.length - 2}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Day events modal */}
      <Modal visible={showDayEventsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.allEventsModal}>
            <Text style={styles.allEventsTitle}>
              {modalDate
                ? new Date(modalDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Selected Day"}
            </Text>

            <ScrollView style={{ maxHeight: 350 }} nestedScrollEnabled>
              {modalDayEvents.length === 0 ? (
                <Text style={styles.emptyAllEvents}>No events</Text>
              ) : (
                modalDayEvents.map((ev, idx) => (
                  <TouchableOpacity
                    key={`${ev?.id ?? "id"}-${ev?.shiftId ?? "shift"}-${idx}`}
                    style={styles.allEventsItem}
                    onPress={() => {
                      onEventPress?.(ev, modalDate);
                      setShowDayEventsModal(false);
                    }}
                  >
                    <View style={[styles.colorDot, { backgroundColor: ev.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.allEventsLabel} numberOfLines={1}>{ev.label}</Text>
                      <Text style={styles.allEventsTime}>{ev.time}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <View style={styles.allEventsFooter}>
              <TouchableOpacity
                style={styles.allEventsCloseBtn}
                onPress={() => setShowDayEventsModal(false)}
              >
                <Text style={styles.allEventsCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    overflow: "hidden",
    marginHorizontal: 10,
    // zIndex: -1, // removed so it doesn't sit under the footer
  },
  dayHeader: {
    width: `${100 / 7}%`,
    textAlign: "center",
    paddingVertical: 6,
    fontWeight: "bold",
    color: "#555",
    backgroundColor: "#f8f8f8",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  dayCell: {
    width: `${100 / 7}%`,
    minHeight: 80, // minHeight lets cells grow if fonts are larger
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  dayNumber: {
    color: "#000",
    fontWeight: "600",
    marginBottom: 2,
  },
  eventDot: {
    marginTop: 1,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  eventText: {
    fontSize: RFValue(8),
    color: "#fff",
  },
  moreText: {
    fontSize: RFValue(8),
    color: "#888",
    marginTop: 2,
    textAlign: "center",
  },

  // modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  allEventsModal: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "90%",
    elevation: 5,
  },
  allEventsTitle: { fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 12 },
  emptyAllEvents: { textAlign: "center", color: "#666", paddingVertical: 16 },
  allEventsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    gap: 10,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  allEventsLabel: { color: "#000", fontWeight: "600" },
  allEventsTime: { color: "#555", fontSize: 12 },
  allEventsFooter: { marginTop: 8, alignItems: "flex-end" },
  allEventsCloseBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#333",
  },
  allEventsCloseText: { color: "#333", fontWeight: "700" },
});
