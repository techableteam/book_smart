import React, { useState, useRef, useEffect, useCallback  } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AddStaffModal from './AddStaffModal';
import { useNavigation, useFocusEffect  } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStaffShiftInfo, } from '../../../utils/useApi';


export default function AdminStaffTab() {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [query, setQuery] = useState("");

    useFocusEffect(
      useCallback(() => {
        console.log("admin staff tap page");
        loadShifts();
      }, [loadShifts])
    );

    const loadShifts = useCallback(async () => {
      try {
        const [aicRaw] = await Promise.all([
          AsyncStorage.getItem('AId'),
        ]);
        const aic = (aicRaw || '').trim();
        if (!aic) {
          console.warn('loadShifts: missing endpoint or aic', {aic});
          setStaffList([]);
          return;
        }
        
        const data = await getStaffShiftInfo("admin", aic);
        const list = (Array.isArray(data) ? data : []).map((user) => ({
          id: String(user?.id ?? ''),
          aic: String(user?.aic ?? aic),
          name:
            [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
            user?.name ||
            '—',
          email: user?.email ?? '',
          mobile: user?.phoneNumber ?? user?.mobile ?? '',
          role: user?.userRole ?? user?.role ?? '',
          shifts: Array.isArray(user?.shifts) ? user.shifts : [],
          active: Boolean(user?.active ?? true),
        }));
    
        setStaffList(list);
      } catch (err) {
        console.error('Failed to fetch staff shift info:', err);
        setStaffList([]);
      }
    }, [setStaffList]);

    // Normalize text for robust search (case/accents/extra spaces)
    const norm = (s = "") =>
      s
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // strip accents
        .replace(/\s+/g, " ")
        .trim();

    const filteredStaff = React.useMemo(() => {
      const q = norm(query);
      if (!q) return staffList;
      return staffList.filter((u) => {
        const haystack = [
          u.name,
          u.role,
          u.email,
          u.mobile,
          u.aic,
        ].map(norm).join(" | ");
        return haystack.includes(q);
      });
    }, [query, staffList]);
    

    const renderItem = ({ item }) => {
      return (
        <View>
          <View style={styles.row}>
            <TouchableOpacity
              style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
              onPress={() => navigation.navigate('AdminStaffDetail', { staff: item })}
            >
              <Image
                source={require('../../../assets/images/default_avatar.png')}
                style={styles.avatar}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>{item.role}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    };
      
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredStaff}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <Text style={{ padding: 16, color: "#555" }}>
            {query ? "No staff match your search." : "No staff yet."}
          </Text>
        }
      />

      <AddStaffModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={() => {
          setModalVisible(false);
          loadShifts();
        }}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // light background
    paddingTop: 10,
    position: 'relative',
  },
  dots: {
    fontSize: 24,
    color: '#000',
    paddingHorizontal: 8,
  },
  
  menu: {
    position: 'absolute',
    backgroundColor: 'red', // ⬅ light mode
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 8,
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  
  
  header: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#290135',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  role: {
    color: '#555',
    fontSize: 13,
    letterSpacing : 0.5  
  },
});
