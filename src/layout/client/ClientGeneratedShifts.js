import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import { RFValue } from 'react-native-responsive-fontsize';
import { getDjobForClinician, updateDjob, applyForShift } from '../../utils/useApi';

const { height } = Dimensions.get('window');
const FOOTER_HEIGHT = RFValue(130);

// 🟣 status color mapping
const statusStyle = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'AVAILABLE':         return { bg: '#808080', fg: '#E5E7EB' };
    case 'ASSIGNED-PENDING':  return { bg: '#DBEAFE', fg: '#1E40AF' };
    case 'ASSIGNED-APPROVED': return { bg: '#A7F3D0', fg: '#065F46' };
    case 'PENDING':           return { bg: '#FFC107', fg: '#A16207' };
    case 'APPROVED':          return { bg: '#DCFCE7', fg: '#166534' };
    case 'REJECTED':          return { bg: '#FEE2E2', fg: '#991B1B' };
    case 'CANCELLED':         return { bg: '#E5E7EB', fg: '#374151' };
    default:                  return { bg: '#EEE', fg: '#000' };
  }
};

// 🟣 normalize status values
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

// 🟣 map API data → UI format
const mapApiItem = (api) => {
  const shiftObj = Array.isArray(api.shift) ? api.shift[0] : api.shift;
  return {
    key: api._id,
    djobId: api.DJobId,
    adminMade: !!api.adminMade,
    companyName: api.companyName,
    facilityCompanyName: api.facilityCompanyName,
    degreeName: api.degreeName,
    date: shiftObj?.date,
    time: shiftObj?.time,
    status: normalizeStatus(api.status),
    clinicianId: Number(api.clinicianId ?? 0),
    __raw: api, // keep full object for debugging
  };
};

export default function ClientGeneratedShift() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [busyKey, setBusyKey] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [aic, setAic] = useState(null);

  const headerPad = headerHeight || RFValue(120);

  // 🟣 load jobs
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const aicStr = await AsyncStorage.getItem('aic');
      const aicNum = aicStr ? Number(aicStr) : null;
      setAic(aicNum);

      const res = await getDjobForClinician();
      console.log('[ClientGeneratedShifts] Response:', res);
      
      if (!res.ok) {
        console.error('[ClientGeneratedShifts] Error:', res.error);
        Alert.alert('Error', res.error?.message || 'Failed to load jobs.');
        setItems([]);
      } else {
        console.log('[ClientGeneratedShifts] Received jobs:', res.data.length);
        console.log('[ClientGeneratedShifts] Raw jobs:', JSON.stringify(res.data, null, 2));
        const mapped = res.data.map(mapApiItem);
        console.log('[ClientGeneratedShifts] Mapped jobs:', mapped.length);
        setItems(mapped);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // 🟣 update job status
  const sendStatus = useCallback(async (item, next) => {
    setBusyKey(item.key);

    try {
      // Handle "Apply" action - use new applyForShift endpoint
      if (next === 'apply') {
        const res = await applyForShift(item.djobId, aic);
        if (!res.ok) {
          Alert.alert('Apply failed', res.error?.message || 'Please try again.');
          return;
        }
        await load();
        Alert.alert('Success', 'Successfully applied for this shift!');
        return;
      }

      // For other actions, use the existing updateDjob
      const shiftData = Array.isArray(item.__raw?.shift)
        ? item.__raw.shift
        : [item.__raw?.shift];

      // map UI actions to backend values
      let mappedStatus = next;
      if (next === 'accept') mappedStatus = 'accept';
      else if (next === 'reject') mappedStatus = 'reject';
      else if (next === 'cancel') mappedStatus = 'cancel';

      const res = await updateDjob({
        DJobId: item.djobId,
        shift: shiftData,
        degree: item.__raw?.degree,
        adminId: item.__raw?.adminId,
        adminMade: !!item.__raw?.adminMade,
        facilitiesId: item.__raw?.facilitiesId,
        clinicianId: aic,
        status: mappedStatus,
      });

      if (!res.ok) {
        Alert.alert('Update failed', res.error?.message || 'Please try again.');
        return;
      }
      await load();
      Alert.alert('Success', 'Job status updated successfully!');
    } catch (err) {
      console.error('update error:', err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setBusyKey(null);
    }
  }, [aic, load]);

  // 🟣 render list item
  const renderItem = ({ item }) => {
    const chip = statusStyle(item.status);
    const statusU = (item.status || '').toUpperCase();
    const isMine = aic != null && item.clinicianId === aic;
    const isUnassigned = item.clinicianId === 0;
    const isBusy = busyKey === item.key;

    // Check if I've applied to this job
    const hasApplied = item.__raw?.applicants?.some(app => app.clinicianId === aic);

    const isFinal =
      statusU === 'APPROVED' ||
      statusU === 'REJECTED' ||
      statusU === 'CANCELLED';

    // Show "Apply" button for AVAILABLE status only (and haven't applied yet)
    const canApply = statusU === 'AVAILABLE' && !hasApplied && !isFinal;

    // Show "Approve/Reject" buttons for ASSIGNED-PENDING status (admin assigned to me)
    const canRespondToAssignment = isMine && statusU === 'ASSIGNED-PENDING' && !isFinal;

    // Don't show buttons for PENDING status (application under review)
    const isPending = statusU === 'PENDING';
    
    // Don't show buttons for ASSIGNED-APPROVED (already accepted)
    const isAssignedApproved = statusU === 'ASSIGNED-APPROVED';
    
    return (
      <View style={styles.card}>
        <View style={[styles.statusChip, { backgroundColor: chip.bg }]}>
          <Text style={[styles.statusText, { color: chip.fg }]}>{item.status}</Text>
        </View>

        {item.adminMade ? <Row label="Admin :" value={item.companyName} /> : null}
        <Row label="Facility :" value={item.facilityCompanyName} />
        <Row label="Degree :" value={item.degreeName} />
        <Row label="Date :" value={item.date} />
        <Row label="Time :" value={item.time} />
        
        {/* Show message if they've applied (for any status) */}
        {hasApplied && statusU === 'AVAILABLE' && (
          <View style={styles.appliedBanner}>
            <Text style={styles.appliedText}>✓ You have applied - Awaiting facility review</Text>
          </View>
        )}

        {/* action buttons */}
        {canApply ? (
          <View style={styles.actionCRow}>
            <TouchableOpacity
              disabled={isBusy}
              style={[styles.actionBtn, styles.applyBtn, isBusy && styles.disabledBtn]}
              onPress={() => {
                Alert.alert(
                  'Apply for Shift',
                  `Do you want to apply for this shift on ${item.date}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Apply', onPress: () => sendStatus(item, 'apply') }
                  ]
                );
              }}
            >
              {isBusy ? <ActivityIndicator /> : <Text style={styles.actionText}>Apply</Text>}
            </TouchableOpacity>
          </View>
        ) : canRespondToAssignment ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              disabled={isBusy}
              style={[styles.actionBtn, styles.acceptBtn, isBusy && styles.disabledBtn]}
              onPress={() => sendStatus(item, 'accept')}
            >
              {isBusy ? <ActivityIndicator /> : <Text style={styles.actionText}>Approve</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              disabled={isBusy}
              style={[styles.actionBtn, styles.rejectBtn, isBusy && styles.disabledBtn]}
              onPress={() => sendStatus(item, 'reject')}
            >
              {isBusy ? <ActivityIndicator /> : <Text style={styles.actionText}>Reject</Text>}
            </TouchableOpacity>
          </View>
        ) : isPending || isAssignedApproved ? null : null}
      </View>
    );
  };

  const ListHeader = useMemo(() => (
    <View style={styles.headerWrap}>
      <View style={styles.topView}>
        <Text style={styles.title}>CLINICIAN JOBS</Text>
        <View style={styles.bottomBar} />
      </View>
      <Text style={styles.subtitle}>
        <Text style={{ fontWeight: 'bold' }}>AVAILABLE</Text> jobs are open - multiple clinicians can apply.
        <Text style={{ fontWeight: 'bold' }}> ASSIGNED-PENDING</Text> means admin selected you - Approve or Reject.
        <Text style={{ fontWeight: 'bold' }}> ASSIGNED-APPROVED</Text> means you approved and it's confirmed!
      </Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <View
        style={styles.headerOverlay}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <MHeader navigation={navigation} back={true} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.key)}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: headerPad, paddingBottom: FOOTER_HEIGHT + RFValue(34) },
          ]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: RFValue(24) }}>
              No jobs found.
            </Text>
          }
        />
      )}
      <MFooter />
    </View>
  );
}

/* helper row component */
const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
      {value ?? '-'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  headerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 1000, elevation: 10,
    backgroundColor: '#fff',
  },
  container: { flex: 1, width: '100%', backgroundColor: '#fff' },
  listContent: { paddingHorizontal: RFValue(16), paddingBottom: RFValue(40) },
  headerWrap: { alignItems: 'center', paddingTop: RFValue(1) },
  topView: { marginTop: RFValue(4), width: '100%', alignItems: 'center' },
  title: { fontSize: RFValue(18), fontWeight: 'bold', color: '#000' },
  bottomBar: {
    marginTop: RFValue(30),
    height: RFValue(5),
    backgroundColor: '#4f70ee1c',
    width: '80%',
    borderRadius: RFValue(6),
  },
  subtitle: {
    fontSize: RFValue(14),
    color: '#000',
    textAlign: 'center',
    marginTop: RFValue(16),
    paddingHorizontal: RFValue(12),
    marginBottom: RFValue(15),
  },
  card: {
    backgroundColor: '#dcd6fa',
    borderRadius: RFValue(14),
    padding: RFValue(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: RFValue(10),
  },
  row: { flexDirection: 'row', marginBottom: RFValue(6) },
  label: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: RFValue(15),
    lineHeight: RFValue(20),
    width: '30%',
  },
  value: {
    width: '70%',
    color: 'black',
    fontSize: RFValue(13.5),
    overflow: 'hidden',
    minWidth: 0,
  },
  statusChip: {
    alignSelf: 'flex-end',
    paddingVertical: RFValue(4),
    paddingHorizontal: RFValue(10),
    borderRadius: RFValue(999),
    marginTop: RFValue(2),
    marginBottom: RFValue(10),
  },
  statusText: { fontWeight: '700', fontSize: RFValue(12) },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: RFValue(8),
    marginTop: RFValue(5),
  },
  actionCRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: RFValue(8),
    marginTop: RFValue(5),
  },
  actionBtn: {
    paddingVertical: RFValue(8),
    paddingHorizontal: RFValue(14),
    borderRadius: RFValue(8),
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideBtn: {
    width: 180,
  },
  disabledBtn: { opacity: 0.6 },
  applyBtn: { backgroundColor: '#3B82F6' },
  cancelBtn: { backgroundColor: '#6B7280' },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#DC2626' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: RFValue(12) },
  appliedBanner: {
    backgroundColor: '#DBEAFE',
    paddingVertical: RFValue(8),
    paddingHorizontal: RFValue(12),
    borderRadius: RFValue(8),
    marginTop: RFValue(8),
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  appliedText: {
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: RFValue(13),
    textAlign: 'center',
  },
});
