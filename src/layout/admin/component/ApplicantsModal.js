import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { reviewApplicant } from '../../../utils/useApi';

export default function ApplicantsModal({ visible, onClose, djobData, onApplicantReviewed }) {
  const [busyId, setBusyId] = useState(null);

  const handleReview = async (applicant, action) => {
    if (!djobData?.DJobId) return;

    setBusyId(applicant.clinicianId);
    try {
      const res = await reviewApplicant(djobData.DJobId, applicant.clinicianId, action);
      
      if (!res.ok) {
        Alert.alert('Error', res.error?.message || 'Failed to review applicant.');
        return;
      }

      Alert.alert('Success', `Applicant ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
      await onApplicantReviewed?.();
      onClose();
    } catch (err) {
      console.error('Error reviewing applicant:', err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setBusyId(null);
    }
  };

  const renderApplicant = ({ item }) => {
    const isBusy = busyId === item.clinicianId;
    const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown';

    return (
      <View style={styles.applicantCard}>
        <View style={styles.applicantInfo}>
          <Text style={styles.applicantName}>{fullName}</Text>
          <Text style={styles.applicantDetail}>{item.title || 'No title'}</Text>
          <Text style={styles.applicantDate}>
            Applied: {new Date(item.appliedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            disabled={isBusy}
            style={[styles.actionBtn, styles.acceptBtn, isBusy && styles.disabledBtn]}
            onPress={() => handleReview(item, 'accept')}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionText}>Accept</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isBusy}
            style={[styles.actionBtn, styles.rejectBtn, isBusy && styles.disabledBtn]}
            onPress={() => handleReview(item, 'reject')}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionText}>Reject</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const pendingApplicants = (djobData?.applicants || []).filter(a => a && a.status === 'pending');

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Applicants for Shift</Text>
          
          <View style={styles.shiftInfo}>
            <Text style={styles.infoText}>Date: {djobData?.shift?.date || 'N/A'}</Text>
            <Text style={styles.infoText}>Time: {djobData?.shift?.time || 'N/A'}</Text>
            <Text style={styles.infoText}>Degree: {djobData?.degreeName || 'N/A'}</Text>
          </View>

          {pendingApplicants.length === 0 ? (
            <Text style={styles.emptyText}>No pending applicants</Text>
          ) : (
            <FlatList
              data={pendingApplicants}
              keyExtractor={(item, index) => `${item.clinicianId}-${index}`}
              renderItem={renderApplicant}
              style={styles.list}
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  shiftInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  list: {
    maxHeight: 300,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 40,
    fontSize: 16,
  },
  applicantCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  applicantDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  applicantDate: {
    fontSize: 12,
    color: '#666',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});

