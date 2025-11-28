import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Dimensions, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import AHeader from '../../components/Aheader';
import AnimatedHeader from '../AnimatedHeader';
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';
import { getTermsStatus } from '../../utils/useApi';

const { width, height } = Dimensions.get('window');

export default function AdminTermsStatus({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clinicians'); // 'clinicians' or 'facilities'
  const [termsData, setTermsData] = useState(null);

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
    if (!dateString) return 'N/A';
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
      return 'Invalid Date';
    }
  };

  const getStatusColor = (hasAccepted, isUpToDate) => {
    if (!hasAccepted) return '#ff4444'; // Red - not accepted
    if (!isUpToDate) return '#ffaa00'; // Orange - accepted but outdated
    return '#00aa00'; // Green - accepted and up to date
  };

  const getStatusText = (hasAccepted, isUpToDate, latestVersion) => {
    if (!hasAccepted) return 'Not Accepted';
    if (!isUpToDate) return `Outdated (Latest: ${latestVersion})`;
    return 'Up to Date';
  };

  if (loading) {
    return <Loader />;
  }

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
          <AnimatedHeader title="Terms Status" />
          <View style={styles.bottomBar} />
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
          <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
          {activeTab === 'facilities' && (
            <Text style={[styles.headerCell, { flex: 2 }]}>Company</Text>
          )}
          <Text style={[styles.headerCell, { flex: 2 }]}>Contact</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>Status</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>Version</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>Signed Date</Text>
        </View>

        {/* Table Rows */}
        {currentData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} found</Text>
          </View>
        ) : (
          currentData.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 2 }]}>
                {item.firstName} {item.lastName}
              </Text>
              {activeTab === 'facilities' && (
                <Text style={[styles.cell, { flex: 2 }]}>
                  {item.companyName || 'N/A'}
                </Text>
              )}
              <View style={[styles.cell, { flex: 2 }]}>
                <Text style={styles.contactText}>{activeTab === 'clinicians' ? item.email : item.contactEmail}</Text>
                <Text style={styles.contactText}>{activeTab === 'clinicians' ? item.phoneNumber : item.contactPhone}</Text>
              </View>
              <View style={[styles.cell, { flex: 1.5 }]}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.hasAccepted, item.isUpToDate) }
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(item.hasAccepted, item.isUpToDate, latestTerms?.version || '')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cell, { flex: 1.5 }]}>
                {item.termsVersion || 'N/A'}
              </Text>
              <Text style={[styles.cell, { flex: 2 }]}>
                {formatDate(item.termsSignedDate)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
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
  }
});

