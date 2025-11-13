// WeekView.js
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
  PixelRatio,
  Platform,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const HOUR_COL_WIDTH = 25;
const MIN_ROW_HEIGHT = 36;
const LANE_HEIGHT = 22;
const LANE_GAP = 4;
const V_PADDING = 6;
const START_MIN = 0;
const END_MIN = 24 * 60;
const TOTAL_TICKS = 25;
const EFFECTIVE_HOURS = 24;
const TIMELINE_TOTAL_W = TOTAL_TICKS * HOUR_COL_WIDTH;
const EFFECTIVE_W = EFFECTIVE_HOURS * HOUR_COL_WIDTH;

const SCREEN_H = Dimensions.get("window").height;
const MAX_VIEWPORT_HEIGHT = Math.max(280, Math.floor(SCREEN_H * 0.6));
const PILL_COLOR = "#5B61FF";

// --- Large text handling ---
const FONT_CAP = 1.2;
const FS = PixelRatio.getFontScale();
const SCALE = Math.min(FS, FONT_CAP);
const HEADER_H = Math.round(28 * SCALE);
const DAY_W = Math.round(35 * SCALE);

const toDateKey = (date) =>
  date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const getStartOfWeekSun = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const hourBoundaryLabel = (i) => {
  if (i === 0) return "12a";
  if (i === 12) return "12p";
  if (i === 24) return "12a";
  return String(i % 12);
};

const endLabelForDisplay = (m) => (m === 1440 ? "12:00 AM" : minutesToLabel(m));

const range = (n) => Array.from({ length: n }, (_, i) => i);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const minutesToLabel = (m) => {
  const total = clamp(m, 0, 24 * 60);
  let h24 = Math.floor(total / 60);
  const mm = total % 60;
  if (h24 === 24) h24 = 0;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const hh12 = h24 % 12 || 12;
  return `${hh12}:${String(mm).padStart(2, "0")} ${ampm}`;
};

function parseTimeToMinutes(s) {
  if (!s) return null;
  const raw = s.replace(/\u202F/g, " ").replace(/\s+/g, " ").trim();

  let m = raw.match(/^(\d{1,2}):?(\d{2})$/);
  if (m) {
    const hh = parseInt(m[1], 10),
      mm = parseInt(m[2], 10);
    if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) return hh * 60 + mm;
  }
  m = raw.match(/^(\d{1,2}):?(\d{2})\s*([AaPp][Mm])$/);
  if (m) {
    let hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const ampm = m[3].toUpperCase();
    if (hh === 12) hh = 0;
    if (ampm === "PM") hh += 12;
    return hh * 60 + mm;
  }
  m = raw.match(/^(\d{1,2})\s*([AaPp][Mm])$/);
  if (m) {
    let hh = parseInt(m[1], 10);
    const ampm = m[2].toUpperCase();
    if (hh === 12) hh = 0;
    if (ampm === "PM") hh += 12;
    return hh * 60;
  }
  m = raw.match(/^(\d{1,2})$/);
  if (m) {
    const hh = parseInt(m[1], 10);
    if (hh >= 0 && hh < 24) return hh * 60;
  }
  return null;
}

function parseEventTimeRange(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(/[➔➜→\-–—]/).map((x) => (x || "").trim());
  const start = parseTimeToMinutes(parts[0]);
  let end = parseTimeToMinutes(parts[1]);
  if (start == null || end == null) return null;
  if (end <= start) end += 24 * 60;
  return { start, end };
}

function layoutLanes(events) {
  const items = events
    .map((e, i) => ({ e, i, r: parseEventTimeRange(e.time) }))
    .filter((x) => x.r)
    .sort((a, b) => a.r.start - b.r.start);

  const lanes = [];
  const placed = [];

  for (const item of items) {
    const { r } = item;
    let laneIndex = 0;
    for (; laneIndex < lanes.length; laneIndex++) {
      if (r.start >= lanes[laneIndex]) break;
    }
    if (laneIndex === lanes.length) lanes.push(r.end);
    else lanes[laneIndex] = r.end;

    placed.push({ ...item, lane: laneIndex });
  }

  return { placed, laneCount: Math.max(1, lanes.length) };
}

function StartDot({ leftPx, top, size, direction = "left" }) {
  const r = size / 2;
  return direction === "left" ? (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: leftPx - r,
        top,
        width: r,
        height: size,
        backgroundColor: PILL_COLOR,
        borderTopLeftRadius: r,
        borderBottomLeftRadius: r,
      }}
    />
  ) : (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: leftPx,
        top,
        width: r,
        height: size,
        backgroundColor: PILL_COLOR,
        borderTopRightRadius: r,
        borderBottomRightRadius: r,
      }}
    />
  );
}

function PillRangeOverlay({ leftPx, rightPx, top, height }) {
  const width = Math.max(rightPx - leftPx, height);
  const left = rightPx - leftPx < height ? (leftPx + rightPx) / 2 - width / 2 : leftPx;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        backgroundColor: PILL_COLOR,
        borderRadius: height / 2,
      }}
    />
  );
}

function SimpleSelect({ label, items, getKey, getLabel, value, onChange, emptyMessage }) {
  const [open, setOpen] = useState(false);
  const displayText = value == null 
    ? (emptyMessage || "Select…") 
    : getLabel(items.find((it) => getKey(it) === value));
    
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Pressable
        onPress={() => items.length > 0 && setOpen((v) => !v)}
        style={[styles.selectBox, open && { borderColor: "#5B61FF" }, items.length === 0 && { backgroundColor: "#f5f5f5" }]}
      >
        <Text style={{ color: value == null ? "#999" : "#000", fontWeight: "600" }}>
          {displayText}
        </Text>
      </Pressable>

      {open && items.length > 0 && (
        <View style={styles.dropdownMenu}>
          <ScrollView style={{ maxHeight: 180 }}>
            {items.map((it) => {
              const k = getKey(it);
              return (
                <Pressable
                  key={String(k)}
                  onPress={() => {
                    onChange(k);
                    setOpen(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={{ color: "#000" }}>{getLabel(it)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function WeekView({
  startDate,
  mockEvents = {},
  onEventPress,
  setSelectedEvent,
  setShowEventModal,
  onTimeRangeSelected,
  staffList = [],
  shiftTypes = [],
  footerHeight = 110,
  degrees = [],  
  djobList = [],
}) {
  const [sel, setSel] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [staffId, setStaffId] = useState(null);
  const [shiftText, setShiftText] = useState("");
  const minuteOptions = useMemo(() => [0, 15, 30, 45], []);
  const [startMinute, setStartMinute] = useState(0);
  const [endMinute, setEndMinute] = useState(0);
  const startHour = confirm ? Math.floor(confirm.startMin / 60) : 0;
  const endHour = confirm ? Math.floor(confirm.endMin / 60) : 0;
  const endMinuteChoices = endHour >= 24 ? [0] : minuteOptions;
  const [degreeId, setDegreeId] = useState(null);

  // Filter staff by selected degree
  const filteredStaffList = useMemo(() => {
    if (!degreeId) return staffList;
    
    const selectedDegree = degrees.find(d => String(d.Did ?? d.id) === String(degreeId));
    if (!selectedDegree) return staffList;
    
    const degreeName = (selectedDegree.degreeName || '').toLowerCase().trim();
    
    return staffList.filter(staff => {
      const userRole = (staff.userRole || '').toLowerCase().trim();
      return userRole === degreeName;
    });
  }, [degreeId, staffList, degrees]);

  const derivedStartMin = useMemo(
    () => (confirm ? startHour * 60 + startMinute : 0),
    [confirm, startHour, startMinute]
  );
  const derivedEndMin = useMemo(
    () => (confirm ? Math.min(24 * 60, endHour * 60 + endMinute) : 0),
    [confirm, endHour, endMinute]
  );

  useEffect(() => {
    if (showModal && confirm) {
      const sMin = confirm.startMin % 60;
      const eMin = confirm.endMin % 60;
      setStartMinute(minuteOptions.includes(sMin) ? sMin : 0);
      setEndMinute(minuteOptions.includes(eMin) ? eMin : 0);
    }
  }, [showModal, confirm, minuteOptions]);

  useEffect(() => {
    if (showModal && confirm) {
      const start = minutesToLabel(confirm.startMin);
      const end = minutesToLabel(confirm.endMin);
      setShiftText(`${start} ➜ ${end}`);
    }
  }, [showModal, confirm]);

  const weekDays = useMemo(() => {
    const sunday = getStartOfWeekSun(startDate || new Date());
    return range(7).map((i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d;
    });
  }, [startDate]);

  const rowHeights = useMemo(() => {
    return weekDays.reduce((acc, dateObj) => {
      const key = toDateKey(dateObj);
      const events = Array.isArray(mockEvents[key]) ? mockEvents[key] : [];
      const { placed, laneCount } = layoutLanes(events);
      const baseLaneCount = events.length > 0 ? laneCount : 0;
      const lanesWithExtra = baseLaneCount + 1;
      const contentHeight =
        V_PADDING * 2 + lanesWithExtra * LANE_HEIGHT + (lanesWithExtra - 1) * LANE_GAP;
      acc[key] = Math.max(MIN_ROW_HEIGHT, contentHeight);
      return acc;
    }, {});
  }, [mockEvents, weekDays]);

  const todayKey = toDateKey(new Date());

  const handleEventPressInternal = (ev, date) => {
    if (onEventPress) onEventPress(ev, date);
    else {
      setSelectedEvent?.(ev);
      setShowEventModal?.(true);
    }
  };

  const handleGridTap = (dateObj, hourIndex) => {
    const key = toDateKey(dateObj);
    const minute = clamp(hourIndex * 60, 0, 24 * 60);

    if (!sel || sel.key !== key || (confirm && confirm.key === key)) {
      setSel({ key, dateObj, startMin: minute });
      setConfirm(null);
      return;
    }
    const startMin = Math.min(sel.startMin, minute);
    const endMin = Math.max(sel.startMin, minute);
    setSel(null);
    setConfirm({ key, dateObj, startMin, endMin });
    setShowModal(true);
    setStaffId(null);
    setShiftText("");
    setDegreeId(null);
  };

  const pxFromMin = (m) =>
    ((clamp(m, 0, 1440) - START_MIN) / (END_MIN - START_MIN)) * EFFECTIVE_W;

  const handleCancelModal = () => {
    setShowModal(false);
    setConfirm(null);
    setSel(null);
    setStaffId(null);
    setShiftText("");
    setDegreeId(null);
  };

  const timeOk = confirm ? derivedEndMin > derivedStartMin : true;
  const canConfirm = degreeId != null && timeOk; 

  const handleConfirmModal = () => {
    if (!confirm || !canConfirm) return;
    const { dateObj } = confirm;

    const selectedDegree   = degrees.find(d => String(d.Did ?? d.id) === String(degreeId));
    const selectedStaff    = staffList.find(s => String(s.aic) === String(staffId));

    onTimeRangeSelected?.({
      date: dateObj,
      startLabel: minutesToLabel(derivedStartMin),
      endLabel: minutesToLabel(derivedEndMin),
      startMin: derivedStartMin,
      endMin: derivedEndMin,
      staffId: Number(selectedStaff?.aic ?? 0),
      degreeId: Number(selectedDegree?.Did ?? selectedDegree?.aic ?? selectedDegree?.id ?? 0),
      shiftText,
    });

    setShowModal(false);
    setConfirm(null);
    setSel(null);
    setStaffId(null);
    setDegreeId(null);
    setShiftText("");
  };


  return (
    <View style={{ width: "100%", zIndex:-1 }}>
      <View style={styles.hintRow}>
        <Text style={styles.hintText}>Browse more hours →</Text>
      </View>

      {/* Vertical scroll (outer) */}
      <ScrollView
        style={{ maxHeight: MAX_VIEWPORT_HEIGHT }}
        contentContainerStyle={{ paddingBottom: footerHeight }}
        nestedScrollEnabled
        directionalLockEnabled
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator
        {...(Platform.OS === "android" ? { overScrollMode: "always" } : {})}
      >
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              position: "absolute",
              left: 10,
              top: 0,
              width: DAY_W,
              zIndex: 2, // Make sure it's on top
              marginTop: HEADER_H + 6
            }}
          >
            {weekDays.map((dateObj) => {
              const key = toDateKey(dateObj);
              const rowHeight = rowHeights[key]; // Dynamically calculate the row height
              const isToday = key === toDateKey(new Date());

              return (
                <View
                  key={key}
                  style={[
                    styles.dayLabelCell,
                    {
                      width: DAY_W,
                      height: rowHeight, // Apply the same height as the timeline
                      backgroundColor: isToday ? "#EFE9FF" : "#fff",
                      borderColor: isToday ? "#EFE9FF" : "#ccc",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text
                    style={[styles.dayLabelTop, { fontWeight: isToday ? "900" : "700" }]}
                    numberOfLines={1}
                    maxFontSizeMultiplier={FONT_CAP}
                  >
                    {dateObj.toLocaleDateString("en-US", { weekday: "short" })}
                  </Text>
                </View>
              );
            })}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            nestedScrollEnabled
            directionalLockEnabled
            keyboardDismissMode="on-drag"
            {...(Platform.OS === "android" ? { overScrollMode: "always" } : {})}
          >
            <View style={{ minWidth: TIMELINE_TOTAL_W + DAY_W }}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={[styles.dayLabelHeaderCell, { width: DAY_W, height: HEADER_H }]} />
                <View style={[styles.timeHeaderRow, { width: TIMELINE_TOTAL_W, height: HEADER_H }]}>
                  {Array.from({ length: TOTAL_TICKS }, (_, i) => (
                    <View key={`tick-${i}`} style={[styles.timeHeaderCell, { width: HOUR_COL_WIDTH }]}>
                      <Text
                        style={styles.timeHeaderText}
                        numberOfLines={1}
                        maxFontSizeMultiplier={FONT_CAP}
                      >
                        {hourBoundaryLabel(i)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {weekDays.map((dateObj) => {
                const key = toDateKey(dateObj);
                const events = Array.isArray(mockEvents[key]) ? mockEvents[key] : [];
                const { placed, laneCount } = layoutLanes(events);
                const hasEvents = placed.length > 0;
                const baseLaneCount = hasEvents ? laneCount : 0;
                const lanesWithExtra = baseLaneCount + 1;

                const contentHeight =
                  V_PADDING * 2 +
                  lanesWithExtra * LANE_HEIGHT +
                  (lanesWithExtra - 1) * LANE_GAP;

                const rowHeight = Math.max(MIN_ROW_HEIGHT, contentHeight);
                const isToday = key === todayKey;

                const extraTop = V_PADDING + baseLaneCount * (LANE_HEIGHT + LANE_GAP);
                const extraHeight = rowHeight - extraTop - V_PADDING;
                const pillH = Math.min(20, Math.max(14, extraHeight - 4));

                return (
                  <View key={key} style={[styles.row]}>
                    <View style = {{ width: DAY_W,}}/>
                    <View
                      style={[
                        styles.timelineRow,
                        {
                          width: TIMELINE_TOTAL_W,
                          height: rowHeight,
                          backgroundColor: isToday ? "#EFE9FF" : "#fff",
                          borderColor: isToday ? "#EFE9FF" : "#ccc",
                        },
                      ]}
                    >
                      <View style={[styles.gridColumns, { backgroundColor: isToday ? "#EFE9FF" : "#fff" }]}>
                        {Array.from({ length: TOTAL_TICKS }, (_, i) => (
                          <View
                            key={`col-${i}`}
                            style={[
                              styles.gridCol,
                              {
                                width: HOUR_COL_WIDTH,
                                backgroundColor: isToday ? "#EFE9FF" : i % 2 === 1 ? "#fafafa" : "#fff",
                              },
                            ]}
                          />
                        ))}
                      </View>

                      <View style={StyleSheet.absoluteFill}>
                        {placed.map(({ e: ev, r, lane }, idx) => {
                          const start = Math.max(r.start, START_MIN);
                          const end = Math.min(r.end, END_MIN);
                          if (end <= START_MIN || start >= END_MIN) return null;

                          const leftPx = pxFromMin(start);
                          const rightPx = end === END_MIN ? TIMELINE_TOTAL_W : pxFromMin(end);
                          const widthPx = Math.max(rightPx - leftPx, 18);
                          const top = V_PADDING + lane * (LANE_HEIGHT + LANE_GAP);
                          const height = LANE_HEIGHT;

                          return (
                            <TouchableOpacity
                              key={`${ev.id || "ev"}-${ev.shiftId || idx}-${key}`}
                              activeOpacity={0.9}
                              onPress={() => handleEventPressInternal(ev, dateObj)}
                              style={[
                                styles.eventBlock,
                                {
                                  left: leftPx,
                                  width: Math.max(widthPx, 18),
                                  top,
                                  height,
                                  backgroundColor: ev.color || "#290135",
                                },
                              ]}
                            >
                              <Text numberOfLines={1} style={styles.eventText}>
                                {ev.status} {ev.time}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Tap zones for creating a range */}
                      <View
                        style={{
                          position: "absolute",
                          left: 0,
                          top: extraTop,
                          width: TIMELINE_TOTAL_W,
                          height: extraHeight,
                        }}
                      >
                        {Array.from({ length: TOTAL_TICKS }, (_, h) => (
                          <Pressable
                            key={`tap-${h}`}
                            style={{
                              position: "absolute",
                              left: h * HOUR_COL_WIDTH,
                              top: 0,
                              width: HOUR_COL_WIDTH,
                              height: "100%",
                            }}
                            onPress={() => handleGridTap(dateObj, h)}
                          />
                        ))}
                      </View>

                      {sel && sel.key === key && (
                        <StartDot
                          leftPx={pxFromMin(sel.startMin)}
                          top={extraTop + (extraHeight - pillH) / 2}
                          size={pillH}
                          direction="left"
                        />
                      )}
                      {confirm && confirm.key === key && (
                        <PillRangeOverlay
                          leftPx={pxFromMin(derivedStartMin)}
                          rightPx={derivedEndMin >= END_MIN ? TIMELINE_TOTAL_W : pxFromMin(derivedEndMin)}
                          top={extraTop + (extraHeight - pillH) / 2}
                          height={pillH}
                        />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        
      </ScrollView>

      <Modal transparent visible={showModal} animationType="fade" onRequestClose={handleCancelModal}>
        <Pressable style={styles.modalOverlay} onPress={handleCancelModal}>
          <Pressable style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Create Shift</Text>

            {!!confirm && (
              <>
                <Text style={styles.confirmInfo}>
                  {confirm.dateObj.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>

                <Text style={styles.confirmInfo}>
                  {minutesToLabel(derivedStartMin)} ➜ {endLabelForDisplay(derivedEndMin)}
                </Text>

                <View style={styles.minutesRow}>
                  <View style={styles.minutesCol}>
                    <SimpleSelect
                      label="Start minutes"
                      items={minuteOptions}
                      getKey={(m) => String(m)}
                      getLabel={(m) => String(m).padStart(2, "0")}
                      value={String(startMinute)}
                      onChange={(k) => setStartMinute(parseInt(k, 10))}
                    />
                  </View>
                  <View style={[styles.minutesCol, { marginRight: 0 }]}>
                    <SimpleSelect
                      label="End minutes"
                      items={endMinuteChoices}
                      getKey={(m) => String(m)}
                      getLabel={(m) => String(m).padStart(2, "0")}
                      value={String(endMinute)}
                      onChange={(k) => setEndMinute(parseInt(k, 10))}
                    />
                  </View>
                </View>

                <SimpleSelect
                  label="Degree"
                  items={degrees}
                  getKey={(d) => String(d.Did ?? d.id ?? d._id)}
                  getLabel={(d) => d.degreeName || d.name || 'Unknown'}
                  value={degreeId}
                  onChange={(newDegreeId) => {
                    setDegreeId(newDegreeId);
                    setStaffId(null);
                  }}
                />

                <SimpleSelect
                  label="Staff"
                  items={filteredStaffList}
                  getKey={(s) => String(s.aic ?? s.id ?? s._id)}
                  getLabel={(s) =>
                    [s.firstName, s.lastName].filter(Boolean).join(" ") || s.email || "Unknown"
                  }
                  value={staffId}
                  onChange={setStaffId}
                  emptyMessage={degreeId && filteredStaffList.length === 0 ? "No matching staff" : null}
                />

                {!timeOk && (
                  <Text style={{ color: "#b00020", marginTop: 6, fontWeight: "700" }}>
                    End time must be after start time.
                  </Text>
                )}
              </>
            )}

            <View style={styles.confirmRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, !canConfirm && { opacity: 0.5 }]}
                disabled={!canConfirm}
                onPress={handleConfirmModal}
              >
                <Text style={styles.btnPrimaryText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={handleCancelModal}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginHorizontal: 10,
    marginTop: 6,
  },
  dayLabelHeaderCell: {
    width: 35,
    height: 30,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderTopLeftRadius: 6,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },

  timeHeaderRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f8f8f8",
    borderTopRightRadius: 6,
  },

  timeHeaderCell: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 1,
  },
  timeHeaderText: {
    fontSize: RFValue(8),
    color: "#555",
    fontWeight: "700",
    includeFontPadding: false,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    marginHorizontal: 10,
  },
  dayLabelCell: {
    width: 35,
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderLeftWidth: 1,
    borderRightWidth: 0.5,
    borderBottomWidth: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  dayLabelTop: {
    fontSize: RFValue(8.5),
    color: "black",
    fontWeight: "300",
    includeFontPadding: false,
  },
  timelineRow: {
    borderRightWidth: 1,
    borderBottomWidth: 2,
    overflow: "hidden",
  },
  gridColumns: { flexDirection: "row", ...StyleSheet.absoluteFillObject },
  gridCol: { height: "100%", backgroundColor: "#fff" },
  eventBlock: {
    position: "absolute",
    borderRadius: 6,
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  eventText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCard: { width: "88%", backgroundColor: "#fff", borderRadius: 12, padding: 18 },
  confirmTitle: { fontSize: 16, fontWeight: "800", color: "#000", marginBottom: 6 },
  confirmInfo: { color: "#333", marginVertical: 2, fontWeight: "600" },

  inputLabel: { marginTop: 12, marginBottom: 6, color: "#222", fontWeight: "700" },

  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12 },

  confirmRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 10 },
  btnPrimary: { backgroundColor: PILL_COLOR },
  btnPrimaryText: { color: "#fff", fontWeight: "800" },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#444" },
  btnGhostText: { color: "#333", fontWeight: "800" },

  minutesRow: { flexDirection: "row", marginTop: 8 },
  minutesCol: { flex: 1, marginRight: 10 },

  hintRow: {
    width: "100%",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  hintText: {
    color: "#666",
    fontWeight: "700",
  },
});
