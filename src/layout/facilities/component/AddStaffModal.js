import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllUsersInRestau,
  addStaffToManager,
  getStaffShiftInfo
} from '../../../utils/useApi';

export default function AddStaffModal({ visible, onClose, onSubmit  }) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [aicRaw] = await Promise.all([
        AsyncStorage.getItem('aic'),
      ]);
  
      const managerAic = (aicRaw || '').trim();

      if (!managerAic) {
        console.warn('fetchUsers: missing managerAic', { managerAic });
        return;
      }
  
      const [allUsersRes, assignedUsersRes] = await Promise.all([
        getAllUsersInRestau("facilities"),
        getStaffShiftInfo("facilities", managerAic),
      ]);
  
      const allUsers = Array.isArray(allUsersRes) ? allUsersRes : [];
      const assignedUsers = Array.isArray(assignedUsersRes) ? assignedUsersRes : [];
  
      const assignedAics = new Set(
        assignedUsers
          .map(u => (u?.aic != null ? String(u.aic) : null))
          .filter(Boolean)
      );
  
      const filtered = allUsers.filter(u => !assignedAics.has(String(u?.aic)));
  
      setUsers(filtered);
      setSelectedUsers([]); 
    } catch (err) {
      console.error('Failed to fetch staff data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  
  const toggleSelect = (user) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.aic === user.aic);
      const updated = exists
        ? prev.filter((u) => u.aic !== user.aic)
        : [...prev, user];
      return updated;
    });
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase().trim();
    return users.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const title = (user.title || '').toLowerCase();
      const role = (user.userRole || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      
      return fullName.includes(query) || 
             title.includes(query) || 
             role.includes(query) ||
             email.includes(query);
    });
  }, [users, searchQuery]);

  const renderUser = ({ item }) => {
    const isSelected = selectedUsers.some((u) => u.aic === item.aic);
    return (
      <Pressable
        onPress={() => toggleSelect(item)}
        style={[styles.userItem, isSelected && styles.selected]}
      >
        <View style={styles.checkbox}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.userText}>
          {item.firstName} {item.lastName} - {item.title} - {item.userRole}
        </Text>
      </Pressable>
    );
  };

  const handleSubmit = async () => {
    const [aicRaw] = await Promise.all([
      AsyncStorage.getItem('aic'),
    ]);

    const aic = (aicRaw || '').trim();
    if (!aic) {
      console.warn('loadShifts: missing aic', { aic });
      setStaffList([]);
      return;
    }

    const result = await addStaffToManager("facilities", aic, selectedUsers);
    if (!result.error) {
      onSubmit(); 
    } else {
      alert('Failed to assign staff');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.headerText}>Select Staff</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, title, role, or email..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.aic.toString()}
              renderItem={renderUser}
              style={{ marginVertical: 10 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No staff found</Text>
              }
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: selectedUsers.length > 0 ? '#290135' : '#ccc',
                },
              ]}
              disabled={selectedUsers.length === 0}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#000',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
    height: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
    fontSize: 14,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selected: {
    backgroundColor: '#f0e7f5',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#290135',
    borderRadius: 3,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#290135',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userText: {
    color: '#000',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelText: {
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});
