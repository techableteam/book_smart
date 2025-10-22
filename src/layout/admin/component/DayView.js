import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ROW_HEIGHT = 40; // px per hour
const HOURS = Array.from({ length: 24 }, (_, h) => h);

const dateKey = (y, m, d) =>
  new Date(y, m, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// --- helpers to parse "10:04 AM ➔ 5:04 PM" robustly ---
const normalize = (s = "") =>
  s.replace(/\u202F/g, " ") // narrow no-break space → space
    .replace(/\s+/g, " ")
    .trim();

const parseTimeToHourFloat = (s = "") => {
  const t = normalize(s);
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*([AP]M)$/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10) % 12;
  const mins = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = m[3].toUpperCase();
  if (ampm === "PM") hour += 12;
  return hour + mins / 60;
};

const splitTimeRange = (range = "") => {
  const clean = normalize(range);
  // split on various arrows/dashes
  const parts = clean.split(/\s*[➔→\-–>]\s*/);
  if (parts.length < 2) return [null, null];
  return [parts[0], parts[1]];
};

export default function DayView({
  date = new Date(),
  setDate,
  mockEvents,
  setSelectedEvent,
  setShowEventModal,
  onEventPress, // optional: same signature as WeekView/MonthView
}) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const key = dateKey(y, m, d);

  const events = Array.isArray(mockEvents?.[key]) ? mockEvents[key] : [];

  // Precompute layout with overlap handling
  const laidOut = events.map((event, i) => {
    const [startStr, endStr] = splitTimeRange(event.time);
    const startF = parseTimeToHourFloat(startStr ?? "") ?? 0;
    const endF = parseTimeToHourFloat(endStr ?? "") ?? Math.max(startF + 1, 1);

    const top = startF * ROW_HEIGHT;
    const height = Math.max((endF - startF) * ROW_HEIGHT, ROW_HEIGHT / 2);

    // simple overlap grouping
    const overlaps = events.filter((e, j) => {
      if (j === i) return false;
      const [s2, e2] = splitTimeRange(e.time);
      const s2f = parseTimeToHourFloat(s2 ?? "") ?? 0;
      const e2f = parseTimeToHourFloat(e2 ?? "") ?? s2f + 1;
      return !(endF <= s2f || startF >= e2f);
    });

    const total = overlaps.length + 1;
    const widthPercent = 100 / total;
    const leftIndex = overlaps.filter((_, j) => j < i).length;

    return {
      ...event,
      top,
      height,
      widthPercent,
      leftPercent: leftIndex * widthPercent,
      startF,
      endF,
    };
  });

  const handlePress = (eventObj) => {
    if (onEventPress) {
      onEventPress(eventObj, new Date(y, m, d));
    } else {
      setSelectedEvent?.(eventObj);
      setShowEventModal?.(true);
    }
  };

  return (
    <View style={{ flex: 1, zIndex : -1}}>
      <View style={styles.dayContainer}>
        {/* time gutter */}
        <View style={styles.timeColumn}>
          {HOURS.map((hour) => (
            <Text key={hour} style={styles.timeLabel}>
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </Text>
          ))}
        </View>

        {/* event column */}
        <View style={styles.eventColumn}>
          {HOURS.map((h) => (
            <View key={h} style={styles.timeSlot} />
          ))}

          {laidOut.map((ev, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handlePress(ev)}
              style={[
                styles.eventBox,
                {
                  top: ev.top,
                  height: ev.height,
                  backgroundColor: ev.color,
                  width: `${ev.widthPercent}%`,
                  left: `${ev.leftPercent}%`,
                },
              ]}
            >
              <Text numberOfLines={2} style={styles.eventText}>
              {ev.status} {ev.label}
                {"\n"}
                {normalize(ev.time)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    flexDirection: "row",
    width: "100%",
    minHeight: ROW_HEIGHT * 24,
    backgroundColor: "#fff",
    zIndex : -1,
    marginBottom: 110
  },
  timeColumn: {
    width: 50,
    backgroundColor: "#f9f9f9",
    borderRightWidth: 1,
    borderColor: "#ddd",
  },
  timeLabel: {
    height: ROW_HEIGHT,
    fontSize: 10,
    textAlign: "right",
    paddingRight: 6,
    color: "#555",
  },
  eventColumn: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff",
  },
  timeSlot: {
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderColor: "#f1f1f1",
  },
  eventBox: {
    position: "absolute",
    borderRadius: 6,
    justifyContent: "center",
    paddingHorizontal: 4,
    overflow: "hidden",
    zIndex: 1,
  },
  eventText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
    lineHeight: 14,
  },
});
