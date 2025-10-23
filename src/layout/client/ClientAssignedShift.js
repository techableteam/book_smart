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
import { useNavigation } from '@react-navigation/native';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import { RFValue } from 'react-native-responsive-fontsize';
import { getAssignedShifts, setStatusFromUser } from '../../utils/useApi';

const { height } = Dimensions.get('window');
const FOOTER_HEIGHT = RFValue(130);

const statusStyle = (status) => {
  switch (status) {
    case 'PENDING':   return { bg: '#FEF9C3', fg: '#A16207' };
    case 'APPROVED':  return { bg: '#DCFCE7', fg: '#166534' };
    case 'REJECTED':  return { bg: '#FEE2E2', fg: '#991B1B' };
    case 'CANCELLED': return { bg: '#E5E7EB', fg: '#374151' };
    default:          return { bg: '#EEE',    fg: '#000'     };
  }
};

const normalizeStatus = (s) => {
  const v = (s || '').toLowerCase();
  if (v === 'pending') return 'PENDING';
  if (v === 'accept' || v === 'approved' || v === 'approve') return 'APPROVED';
  if (v === 'reject' || v === 'rejected') return 'REJECTED';
  if (v === 'cancel' || v === 'cancelled') return 'CANCELLED';
  return 'PENDING';
};

const mapApiItem = (api) => ({
  id: api.id,
  assignedShiftId: api.id,
  location: api.companyName,
  date: api.date,
  time: api.time,
  status: normalizeStatus(api.status),
});

export default function AssignedShift() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [busyId, setBusyId] = useState(null); 
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerPad = headerHeight || RFValue(120);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAssignedShifts("clinical");
    if (!res.ok) {
      console.error(res.error);
      Alert.alert('Error', res.error?.message || 'Failed to load assigned shifts.');
      setShifts([]);
    } else {
      setShifts(res.data.map(mapApiItem));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onChangeStatus = useCallback(async (item, next) => {
    console.log(item);
    // next: 'accept' | 'reject' | 'cancel'
    setBusyId(item.id);
    const res = await setStatusFromUser
    ({endpoint: 'clinical',   assignedShiftId: item.assignedShiftId, status: next });
    setBusyId(null);

    if (!res.ok) {
      console.error(res.error);
      Alert.alert('Update failed', res.error?.message || 'Please try again.');
      return;
    }

    // Optionally, verify the "to" status in response
    const to = res.data?.user?.to;
    if (to && to !== next) {
      // Backend returned a different status than requested
      Alert.alert('Warning', `Server applied status "${to}" (requested "${next}").`);
    }

    // Optimistic UI update
    setShifts((prev) =>
      prev.map((s) =>
        s.id === item.id ? { ...s, status: normalizeStatus(to || next) } : s
      )
    );
  }, []);

  const renderItem = ({ item }) => {
    const chip = statusStyle(item.status);
    const isPending = item.status === 'PENDING';
    const isBusy = busyId === item.id;

    return (
      <View style={styles.card}>
        <View style={[styles.statusChip, { backgroundColor: chip.bg }]}>
          <Text style={[styles.statusText, { color: chip.fg }]}>{item.status}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Location :</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {item.location}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date :</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {item.date}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Time :</Text>
          <Text style={styles.value}>{item.time}</Text>
        </View>

        {isPending ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              disabled={isBusy}
              style={[styles.actionBtn, styles.acceptBtn, isBusy && styles.disabledBtn]}
              onPress={() => onChangeStatus(item, 'accept')}
            >
              {isBusy ? <ActivityIndicator /> : <Text style={styles.actionText}>Accept</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              disabled={isBusy}
              style={[styles.actionBtn, styles.rejectBtn, isBusy && styles.disabledBtn]}
              onPress={() => onChangeStatus(item, 'reject')}
            >
              {isBusy ? <ActivityIndicator /> : <Text style={styles.actionText}>Reject</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionCRow}>
            <TouchableOpacity
              disabled={isBusy}
              style={[styles.actionBtn, styles.cancelBtn, isBusy && styles.disabledBtn]}
              onPress={() => onChangeStatus(item, 'pending')}
            >
              {isBusy ? <ActivityIndicator /> : <Text style={styles.actionText}>Cancel</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const ListHeader = useMemo(() => (
    <View style={styles.headerWrap}>
      <View style={styles.topView}>
        <Text style={styles.title}>ASSIGNED SHIFTS</Text>
        <View style={styles.bottomBar} />
      </View>
      <Text style={styles.subtitle}>
        All shifts are assigned directly to you by manager. Please
        <Text style={{ fontWeight: 'bold' }}>{' '}approve</Text> or
        <Text style={{ fontWeight: 'bold' }}>{' '}cancel</Text> them.
      </Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent"/>
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
          data={shifts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: headerPad,
              paddingBottom: FOOTER_HEIGHT + RFValue(34),
            },
          ]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: RFValue(24) }}>
              No assigned shifts.
            </Text>
          }
        />
      )}
      <MFooter />
    </View>

  );
}

const styles = StyleSheet.create({
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,        
    elevation: 10,       
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
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: RFValue(8), marginTop: RFValue(5) },
  actionCRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: RFValue(8), marginTop: RFValue(5) },
  actionBtn: {
    paddingVertical: RFValue(8),
    paddingHorizontal: RFValue(14),
    borderRadius: RFValue(8),
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: { opacity: 0.6 },
  acceptBtn: { backgroundColor: '#A020F0' },
  rejectBtn: { backgroundColor: '#991B1B' },
  cancelBtn: { backgroundColor: '#6B7280' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: RFValue(12) },
});
