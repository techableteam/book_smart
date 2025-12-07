import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Dimensions, TextInput, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import MFooter from '../../components/Mfooter';
import SubNavbar from '../../components/SubNavbar';
import AHeader from '../../components/Aheader';
import AnimatedHeader from '../AnimatedHeader';
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';
import { getTermsOverview, saveDraftTerms, publishTerms, getTermsById } from '../../utils/useApi';

const { width, height } = Dimensions.get('window');

export default function AdminTerms({ navigation }) {
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [type, setType] = useState('clinician'); // 'clinician' or 'facility'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [publishedClinicianTerms, setPublishedClinicianTerms] = useState(null);
  const [publishedFacilityTerms, setPublishedFacilityTerms] = useState(null);
  const [draftClinicianTerms, setDraftClinicianTerms] = useState([]);
  const [draftFacilityTerms, setDraftFacilityTerms] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPublishedModal, setShowPublishedModal] = useState(false);
  const [viewingPublishedTerms, setViewingPublishedTerms] = useState(null);

  // Load terms overview
  const loadTermsOverview = async () => {
    setLoading(true);
    try {
      const response = await getTermsOverview();
      if (response.error) {
        setPublishedClinicianTerms(null);
        setPublishedFacilityTerms(null);
        setDraftClinicianTerms([]);
        setDraftFacilityTerms([]);
        setShowCreateForm(false);
      } else {
        setPublishedClinicianTerms(response.publishedClinicianTerms);
        setPublishedFacilityTerms(response.publishedFacilityTerms);
        setDraftClinicianTerms(response.draftClinicianTerms || []);
        setDraftFacilityTerms(response.draftFacilityTerms || []);
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error loading terms overview:', error);
      Alert.alert('Error', 'Failed to load terms');
    } finally {
      setLoading(false);
    }
  };

  // Load specific draft for editing
  const loadDraftForEditing = async (draft) => {
    try {
      const response = await getTermsById(draft.id);
      if (response.error) {
        Alert.alert('Error', 'Failed to load draft');
      } else if (response.terms) {
        setSelectedDraft(draft);
        setContent(response.terms.content || '');
        setVersion(response.terms.version || '1.0.0');
        setType(response.terms.type || 'clinician');
        setDraftId(response.terms.id);
        setLastSaved(response.terms.lastModifiedDate || response.terms.updatedAt);
        setShowCreateForm(true);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      Alert.alert('Error', 'Failed to load draft');
    }
  };

  // View published terms
  const handleViewPublished = async (terms, termsType) => {
    if (terms) {
      setViewingPublishedTerms({ ...terms, type: termsType });
      setShowPublishedModal(true);
    }
  };

  // Create new draft
  const handleCreateNew = (termsType) => {
    const selectedType = termsType || 'clinician';
    
    // Check if there's already a draft for this type
    const existingDrafts = selectedType === 'clinician' ? draftClinicianTerms : draftFacilityTerms;
    
    if (existingDrafts && existingDrafts.length > 0) {
      Alert.alert(
        'Draft Already Exists',
        `You already have a saved draft for ${selectedType === 'clinician' ? 'Clinician' : 'Facility'} Terms. Please edit the existing draft or publish it before creating a new one.`,
        [
          {
            text: 'Edit Existing Draft',
            onPress: () => {
              // Load the first (most recent) draft for editing
              loadDraftForEditing(existingDrafts[0]);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    // No existing draft, proceed with creation
    setSelectedDraft(null);
    setContent('');
    setVersion('1.0.0');
    setType(selectedType);
    setDraftId(null);
    setLastSaved(null);
    setShowCreateForm(true);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTermsOverview();
    }, [])
  );

  // Save as Draft
  const handleSaveDraft = async () => {
    if (!content.trim()) {
      Alert.alert('Validation', 'Please enter some content before saving.');
      return;
    }

    if (!version.trim()) {
      Alert.alert('Validation', 'Please enter a version number.');
      return;
    }

    if (!type) {
      Alert.alert('Validation', 'Please select a type (Clinician or Facility).');
      return;
    }

    setSaving(true);
    try {
      const response = await saveDraftTerms(content, version, type);
      if (response.error) {
        Alert.alert('Error', response.error || 'Failed to save draft');
      } else {
        setDraftId(response.terms?.id);
        setLastSaved(new Date().toISOString());
        Alert.alert('Success', 'Draft saved successfully!');
        loadTermsOverview();
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  // Publish Terms
  const handlePublish = async () => {
    if (!content.trim()) {
      Alert.alert('Validation', 'Please enter some content before publishing.');
      return;
    }

    if (!version.trim()) {
      Alert.alert('Validation', 'Please enter a version number.');
      return;
    }

    if (!type) {
      Alert.alert('Validation', 'Please select a type (Clinician or Facility).');
      return;
    }

    Alert.alert(
      'Confirm Publish',
      'Are you sure you want to publish these Terms? This will make them visible to all users.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          style: 'destructive',
          onPress: async () => {
            setPublishing(true);
            try {
              // ALWAYS save first to ensure latest content is saved
              const saveResponse = await saveDraftTerms(content, version, type);
              if (saveResponse.error) {
                Alert.alert('Error', saveResponse.error || 'Failed to save draft before publishing');
                setPublishing(false);
                return;
              }
              
              const termsId = saveResponse.terms?.id || draftId;
              if (!termsId) {
                Alert.alert('Error', 'Failed to get terms ID after saving');
                setPublishing(false);
                return;
              }

              // Now publish the saved terms (pass content/version/type to ensure they're updated)
              const response = await publishTerms(termsId, content, version, type);
              if (response.error) {
                Alert.alert('Error', response.error || 'Failed to publish terms');
              } else {
                Alert.alert('Success', 'Terms published successfully!');
                setLastSaved(new Date().toISOString());
                loadTermsOverview();
                setShowCreateForm(false);
              }
            } catch (error) {
              console.error('Error publishing terms:', error);
              Alert.alert('Error', 'Failed to publish terms');
            } finally {
              setPublishing(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <AHeader navigation={navigation} currentPage={9} />
      <SubNavbar navigation={navigation} name={"AdminLogin"} />
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={{ width: '100%', marginTop: height * 0.22 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
        <View style={styles.topView}>
          <AnimatedHeader title="TERMS MANAGEMENT" />
          <View style={styles.bottomBar} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Terms Management</Text>
            <Text style={styles.infoText}>
              Manage Terms of Service. View published terms, edit drafts, or create new terms.
            </Text>
          </View>

          {/* Published Clinician Terms Section */}
          {publishedClinicianTerms && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👩‍⚕️ Published Clinician Terms (Latest)</Text>
              <TouchableOpacity 
                style={styles.publishedCard}
                onPress={() => handleViewPublished(publishedClinicianTerms, 'clinician')}
              >
                <Text style={styles.publishedVersion}>Version {publishedClinicianTerms.version}</Text>
                {publishedClinicianTerms.createdByName && (
                  <Text style={styles.publishedAuthor}>
                    Created by: {publishedClinicianTerms.createdByName}
                  </Text>
                )}
                <Text style={styles.publishedDate}>
                  Published: {formatDate(publishedClinicianTerms.publishedDate)}
                </Text>
                <Text style={styles.viewText}>Tap to view →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Published Facility Terms Section */}
          {publishedFacilityTerms && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏢 Published Facility Terms (Latest)</Text>
              <TouchableOpacity 
                style={styles.publishedCard}
                onPress={() => handleViewPublished(publishedFacilityTerms, 'facility')}
              >
                <Text style={styles.publishedVersion}>Version {publishedFacilityTerms.version}</Text>
                {publishedFacilityTerms.createdByName && (
                  <Text style={styles.publishedAuthor}>
                    Created by: {publishedFacilityTerms.createdByName}
                  </Text>
                )}
                <Text style={styles.publishedDate}>
                  Published: {formatDate(publishedFacilityTerms.publishedDate)}
                </Text>
                <Text style={styles.viewText}>Tap to view →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Draft Clinician Terms Section */}
          {draftClinicianTerms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Draft Clinician Terms</Text>
              {draftClinicianTerms.map((draft, index) => (
                <TouchableOpacity
                  key={draft.id || index}
                  style={styles.draftCard}
                  onPress={() => loadDraftForEditing(draft)}
                >
                  <Text style={styles.draftVersion}>Version {draft.version || 'N/A'}</Text>
                  <Text style={styles.draftDate}>
                    Last modified: {formatDate(draft.lastModifiedDate || draft.updatedAt)}
                  </Text>
                  <Text style={styles.editText}>Tap to edit →</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Draft Facility Terms Section */}
          {draftFacilityTerms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Draft Facility Terms</Text>
              {draftFacilityTerms.map((draft, index) => (
                <TouchableOpacity
                  key={draft.id || index}
                  style={styles.draftCard}
                  onPress={() => loadDraftForEditing(draft)}
                >
                  <Text style={styles.draftVersion}>Version {draft.version || 'N/A'}</Text>
                  <Text style={styles.draftDate}>
                    Last modified: {formatDate(draft.lastModifiedDate || draft.updatedAt)}
                  </Text>
                  <Text style={styles.editText}>Tap to edit →</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Create Terms Buttons */}
          {!showCreateForm && (
            <View style={styles.createButtonsContainer}>
              <TouchableOpacity
                style={[styles.createButton, styles.createClinicianButton]}
                onPress={() => handleCreateNew('clinician')}
              >
                <Text style={styles.createButtonText}>+ Create Clinician Terms</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, styles.createFacilityButton]}
                onPress={() => handleCreateNew('facility')}
              >
                <Text style={styles.createButtonText}>+ Create Facility Terms</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Create/Edit Form */}
          {showCreateForm && (
            <View style={styles.formSection}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {selectedDraft ? 'Edit Draft' : 'Create New Terms'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCreateForm(false);
                    setSelectedDraft(null);
                  }}
                >
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {((type === 'clinician' && publishedClinicianTerms) || (type === 'facility' && publishedFacilityTerms)) && (
                <View style={styles.versionWarning}>
                  <Text style={styles.versionWarningText}>
                    ⚠️ Latest published {type} version: {type === 'clinician' ? publishedClinicianTerms?.version : publishedFacilityTerms?.version}
                  </Text>
                  <Text style={styles.versionWarningSubtext}>
                    Your version must be equal or higher than this.
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type:</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[styles.typeButton, type === 'clinician' && styles.typeButtonActive]}
                    onPress={() => setType('clinician')}
                  >
                    <Text style={[styles.typeButtonText, type === 'clinician' && styles.typeButtonTextActive]}>
                      👩‍⚕️ Clinician
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, type === 'facility' && styles.typeButtonActive]}
                    onPress={() => setType('facility')}
                  >
                    <Text style={[styles.typeButtonText, type === 'facility' && styles.typeButtonTextActive]}>
                      🏢 Facility
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Version:</Text>
                <TextInput
                  style={styles.versionInput}
                  value={version}
                  onChangeText={setVersion}
                  placeholder="e.g., 1.0.0"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Content:</Text>
                <TextInput
                  style={styles.contentInput}
                  value={content}
                  onChangeText={setContent}
                  placeholder="Enter Terms content here..."
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {lastSaved && (
                <Text style={styles.lastSavedText}>
                  Last saved: {formatDate(lastSaved)}
                </Text>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
                  onPress={handleSaveDraft}
                  disabled={saving || publishing}
                >
                  <Text style={styles.buttonText}>
                    {saving ? 'Saving...' : 'Save Draft'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.publishButton, (publishing || saving) && styles.buttonDisabled]}
                  onPress={handlePublish}
                  disabled={saving || publishing}
                >
                  <Text style={styles.buttonText}>
                    {publishing ? 'Publishing...' : 'Publish'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Published Terms Modal */}
      <Modal
        visible={showPublishedModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPublishedModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Published {viewingPublishedTerms?.type === 'clinician' ? 'Clinician' : 'Facility'} Terms - Version {viewingPublishedTerms?.version}
              </Text>
              <TouchableOpacity onPress={() => setShowPublishedModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalInfo}>
                {viewingPublishedTerms?.createdByName && (
                  <Text style={styles.modalAuthor}>
                    Created by: {viewingPublishedTerms.createdByName}
                  </Text>
                )}
                {viewingPublishedTerms?.publishedDate && (
                  <Text style={styles.modalDate}>
                    Published: {formatDate(viewingPublishedTerms.publishedDate)}
                  </Text>
                )}
              </View>
              <Text style={styles.modalText}>
                {viewingPublishedTerms?.content || 'No content available'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Loader visible={loading} />
      <MFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    width: '100%',
    backgroundColor: '#f5f5f5'
  },
  topView: {
    marginLeft: '10%',
    width: '80%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomBar: {
    marginTop: 30,
    height: 5,
    backgroundColor: '#4f70ee1c',
    width: '100%'
  },
  contentContainer: {
    marginTop: 20,
    width: '90%',
    marginLeft: '5%',
    marginBottom: 100
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  infoTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8
  },
  infoText: {
    fontSize: RFValue(14),
    color: '#424242',
    lineHeight: 20
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 10
  },
  publishedCard: {
    backgroundColor: '#c8e6c9',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 10
  },
  publishedVersion: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5
  },
  publishedAuthor: {
    fontSize: RFValue(12),
    color: '#1b5e20',
    marginBottom: 5,
    fontWeight: '600'
  },
  publishedDate: {
    fontSize: RFValue(12),
    color: '#1b5e20',
    marginBottom: 5
  },
  viewText: {
    fontSize: RFValue(12),
    color: '#2e7d32',
    fontStyle: 'italic',
    marginTop: 5
  },
  draftCard: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff9800',
    marginBottom: 10
  },
  draftVersion: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 5
  },
  draftDate: {
    fontSize: RFValue(12),
    color: '#bf360c',
    marginBottom: 5
  },
  editText: {
    fontSize: RFValue(12),
    color: '#e65100',
    fontStyle: 'italic',
    marginTop: 5
  },
  createButtonsContainer: {
    marginBottom: 20,
    gap: 10
  },
  createButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  createClinicianButton: {
    backgroundColor: '#2196F3'
  },
  createFacilityButton: {
    backgroundColor: '#FF9800'
  },
  createButtonText: {
    color: 'white',
    fontSize: RFValue(16),
    fontWeight: 'bold'
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    alignItems: 'center'
  },
  typeButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd'
  },
  typeButtonText: {
    fontSize: RFValue(14),
    color: '#757575',
    fontWeight: '600'
  },
  typeButtonTextActive: {
    color: '#1976d2',
    fontWeight: 'bold'
  },
  formSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 10
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  versionWarning: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffc107'
  },
  versionWarningText: {
    fontSize: RFValue(13),
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4
  },
  versionWarningSubtext: {
    fontSize: RFValue(11),
    color: '#856404'
  },
  formTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#424242'
  },
  closeButton: {
    fontSize: RFValue(20),
    color: '#757575',
    fontWeight: 'bold'
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8
  },
  versionInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: RFValue(14),
    color: '#424242'
  },
  contentInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: RFValue(14),
    color: '#424242',
    minHeight: 300,
    maxHeight: 600
  },
  lastSavedText: {
    fontSize: RFValue(12),
    color: '#757575',
    fontStyle: 'italic',
    marginBottom: 15
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveButton: {
    backgroundColor: '#2196F3'
  },
  publishButton: {
    backgroundColor: '#4CAF50'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6
  },
  buttonText: {
    color: 'white',
    fontSize: RFValue(14),
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10
  },
  modalTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#424242',
    flex: 1
  },
  modalBody: {
    maxHeight: height * 0.6
  },
  modalInfo: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalAuthor: {
    fontSize: RFValue(13),
    color: '#424242',
    fontWeight: '600',
    marginBottom: 5
  },
  modalText: {
    fontSize: RFValue(14),
    color: '#424242',
    lineHeight: 22,
    marginBottom: 15
  },
  modalDate: {
    fontSize: RFValue(12),
    color: '#757575',
    fontStyle: 'italic'
  }
});
