import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Dimensions, TouchableOpacity, Text, Modal, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import AHeader from '../../components/Aheader';
import AnimatedHeader from '../AnimatedHeader';
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';
import { getTermsStatus, getSignatureHistory } from '../../utils/useApi';

const { width, height } = Dimensions.get('window');

export default function AdminTermsStatus({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clinicians'); // 'clinicians' or 'facilities'
  const [termsData, setTermsData] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [signatureHistory, setSignatureHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadTermsStatus = async () => {
    setLoading(true);
    try {
      const response = await getTermsStatus();
      if (response.error) {
        console.error('Error loading terms status:', response.error);
        setTermsData(null);
      } else {
        setTermsData(response);
      }
    } catch (error) {
      console.error('Error loading terms status:', error);
      setTermsData(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTermsStatus();
    }, [])
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  const getStatusColor = (hasAccepted) => {
    if (!hasAccepted) return '#ff4444'; // Red - not accepted
    return '#00aa00'; // Green - accepted
  };

  const getStatusText = (hasAccepted) => {
    if (!hasAccepted) return 'Not Signed';
    return 'Signed';
  };

  const getDisplayVersion = (item, latestTerms) => {
    // If user has accepted and has a version, show their accepted version
    if (item.hasAccepted && item.termsVersion && item.termsVersion.trim() !== '') {
      return item.termsVersion;
    }
    // If no version but latest exists, show latest version
    if (latestTerms && latestTerms.version) {
      return latestTerms.version;
    }
    // Otherwise show empty
    return '';
  };

  const handleViewHistory = async (user, type) => {
    setSelectedUser(user);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    
    try {
      const response = await getSignatureHistory(user.aic, type);
      if (response.error) {
        console.error('Error loading signature history:', response.error);
        setSignatureHistory([]);
      } else {
        setSignatureHistory(response.history || []);
      }
    } catch (error) {
      console.error('Error loading signature history:', error);
      setSignatureHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedUser(null);
    setSignatureHistory([]);
  };

  const currentData = activeTab === 'clinicians' 
    ? (termsData?.clinicians || [])
    : (termsData?.facilities || []);
  
  const latestTerms = activeTab === 'clinicians'
    ? termsData?.latestClinicianTerms
    : termsData?.latestFacilityTerms;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <AHeader currentPage={10} navigation={navigation} style={{ zIndex: 10 }} />
      <SubNavbar navigation={navigation} name={"AdminLogin"} style={{ zIndex: 0 }} />
      <ScrollView
        style={{ width: '100%', marginTop: height * 0.22 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topView}>
          <View style={styles.animatedHeaderContainer}>
            <AnimatedHeader title="Terms Status" style={styles.animatedHeader} />
          </View>
        </View>

        {/* Latest Terms Info */}
        {latestTerms && (
          <View style={styles.latestTermsInfo}>
            <Text style={styles.latestTermsTitle}>Latest Published Terms</Text>
            <Text style={styles.latestTermsText}>
              Version: {latestTerms.version}
            </Text>
            <Text style={styles.latestTermsText}>
              Published: {formatDate(latestTerms.publishedDate)}
            </Text>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'clinicians' && styles.activeTab]}
            onPress={() => setActiveTab('clinicians')}
          >
            <Text style={[styles.tabText, activeTab === 'clinicians' && styles.activeTabText]}>
              Clinicians ({termsData?.clinicians?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'facilities' && styles.activeTab]}
            onPress={() => setActiveTab('facilities')}
          >
            <Text style={[styles.tabText, activeTab === 'facilities' && styles.activeTabText]}>
              Facilities ({termsData?.facilities?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          {activeTab === 'clinicians' && (
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Name</Text>
          )}
          {activeTab === 'facilities' && (
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Company</Text>
          )}
          <Text style={[styles.headerCell, { flex: 1 }]}>Status</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Version</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>Signed Date</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>Signature</Text>
        </View>

        {/* Table Rows */}
        {currentData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} found</Text>
          </View>
        ) : (
          currentData.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              {activeTab === 'clinicians' && (
                <TouchableOpacity 
                  style={[styles.cell, { flex: 1.5 }]}
                  onPress={() => handleViewHistory(item, 'clinician')}
                >
                  <Text style={styles.clickableName}>
                    {item.firstName} {item.lastName}
                  </Text>
                </TouchableOpacity>
              )}
              {activeTab === 'facilities' && (
                <TouchableOpacity 
                  style={[styles.cell, { flex: 1.5 }]}
                  onPress={() => handleViewHistory(item, 'facility')}
                >
                  <Text style={styles.clickableName}>
                    {item.companyName || ''}
                  </Text>
                </TouchableOpacity>
              )}
              <View style={[styles.cell, { flex: 1 }]}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.hasAccepted) }
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(item.hasAccepted)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cell, { flex: 1 }]}>
                {getDisplayVersion(item, latestTerms)}
              </Text>
              <Text style={[styles.cell, { flex: 1.5 }]}>
                {item.termsSignedDate ? formatDate(item.termsSignedDate) : ''}
              </Text>
              <View style={[styles.cell, { flex: 1.5, alignItems: 'center', justifyContent: 'center' }]}>
                {item.signature && item.signature.trim() !== '' ? (
                  <Image
                    source={{ uri: `data:image/png;base64,${item.signature}` }}
                    style={styles.dashboardSignatureImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={[styles.cell, { color: '#999', fontStyle: 'italic', fontSize: RFValue(9) }]}>No signature</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <Loader visible={loading} />
      
      {/* Signature History Modal */}
      <Modal
        visible={showHistoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeHistoryModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Signature History
                {selectedUser && (
                  <Text style={styles.modalSubtitle}>
                    {'\n'}
                    {activeTab === 'clinicians' 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.companyName}
                  </Text>
                )}
              </Text>
              <TouchableOpacity onPress={closeHistoryModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {loadingHistory ? (
              <View style={styles.loadingContainer}>
                <Text>Loading history...</Text>
              </View>
            ) : signatureHistory.length === 0 ? (
              <View style={styles.emptyHistoryContainer}>
                <Text style={styles.emptyHistoryText}>No signature history found</Text>
              </View>
            ) : (
              <ScrollView style={styles.historyScrollView}>
                <View style={styles.historyTableHeader}>
                  <Text style={[styles.historyHeaderCell, { flex: 1 }]}>Version</Text>
                  <Text style={[styles.historyHeaderCell, { flex: 1.5 }]}>Signed Date</Text>
                  <Text style={[styles.historyHeaderCell, { flex: 1.5 }]}>Signature</Text>
                </View>
                {signatureHistory.map((record, index) => (
                  <View key={index} style={styles.historyTableRow}>
                    <Text style={[styles.historyCell, { flex: 1 }]}>
                      {record.version || ''}
                    </Text>
                    <Text style={[styles.historyCell, { flex: 1.5 }]}>
                      {formatDate(record.signedDate)}
                    </Text>
                    <View style={[styles.historyCell, { flex: 1.5, alignItems: 'center', justifyContent: 'center' }]}>
                      {record.signature && record.signature.trim() !== '' ? (
                        <Image
                          source={{ uri: `data:image/png;base64,${record.signature}` }}
                          style={styles.signatureImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={[styles.historyCell, { color: '#999', fontStyle: 'italic' }]}>No signature</Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      <MFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    backgroundColor: '#f5f5f5'
  },
  topView: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20
  },
  animatedHeaderContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  animatedHeader: {
    width: '80%'
  },
  bottomBar: {
    width: '90%',
    height: 2,
    backgroundColor: '#A020F0',
    marginTop: 10
  },
  latestTermsInfo: {
    width: '90%',
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'center'
  },
  latestTermsTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#2a53c1',
    marginBottom: 8
  },
  latestTermsText: {
    fontSize: RFValue(14),
    color: '#333',
    marginBottom: 4
  },
  tabContainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6
  },
  activeTab: {
    backgroundColor: '#A020F0'
  },
  tabText: {
    fontSize: RFValue(14),
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  tableHeader: {
    flexDirection: 'row',
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#A020F0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 2
  },
  headerCell: {
    fontSize: RFValue(12),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  cell: {
    fontSize: RFValue(11),
    color: '#333',
    textAlign: 'center',
    justifyContent: 'center'
  },
  contactText: {
    fontSize: RFValue(10),
    color: '#666',
    marginBottom: 2
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'center'
  },
  statusText: {
    fontSize: RFValue(10),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  emptyContainer: {
    width: '95%',
    alignSelf: 'center',
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: RFValue(14),
    color: '#999'
  },
  clickableName: {
    fontSize: RFValue(11),
    color: '#0066cc',
    textDecorationLine: 'underline',
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#333'
  },
  modalSubtitle: {
    fontSize: RFValue(14),
    fontWeight: 'normal',
    color: '#666'
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#f0f0f0'
  },
  closeButtonText: {
    fontSize: RFValue(18),
    color: '#666'
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyHistoryContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyHistoryText: {
    fontSize: RFValue(14),
    color: '#999'
  },
  historyScrollView: {
    maxHeight: 400
  },
  historyTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#A020F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginBottom: 5
  },
  historyHeaderCell: {
    fontSize: RFValue(12),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  historyTableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  historyCell: {
    fontSize: RFValue(11),
    color: '#333',
    textAlign: 'center'
  },
  signatureImage: {
    width: 100,
    height: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4
  },
  dashboardSignatureImage: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4
  }
});

