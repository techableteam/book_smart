import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Image, Alert, Dimensions, Button
} from 'react-native';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import { useAtom } from 'jotai';
import Hyperlink from 'react-native-hyperlink';
import { Dropdown } from 'react-native-element-dropdown';
import SignatureCapture from 'react-native-signature-capture';
import images from '../../assets/images';
import HButton from '../../components/Hbutton';
import { facilityAcknowledgementAtom } from '../../context/FacilityAuthProvider';
import { Update } from '../../utils/useApi';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function FacilityPermission({ navigation }) {
  const [facilityAcknowledgement, setFacilityAcknowledgement] = useAtom(facilityAcknowledgementAtom);
  const items = [
    { label: 'Yes', value: 1 },
    { label: 'No', value: 2 },
  ];
  const [checked, setChecked] = useState('first');
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [credentials, setCredentials] = useState({
    signature: '',
    facilityAcknowledgeTerm: facilityAcknowledgement,
    selectedoption: 'first'
  });
  const signatureRef = useRef(null);

  const onSaveEvent = (result) => {
    setTimeout(() => {
      setCredentials(prev => ({
        ...prev,
        signature: result.encoded
      }));
      setIsSigned(true);
      setIsSaving(false);
    }, 100); // Delay for iOS
  };

  const handleReset = () => {
    signatureRef.current?.resetImage();
    setIsSigned(false);
    setIsSaving(false);
    setCredentials(prev => ({
      ...prev,
      signature: ''
    }));
  };

  const handlePreSubmit = () => {
    if (value !== 1) return;
    if (!isSigned) {
      Alert.alert('Please sign and click Save button');
      return;
    }
    handleUploadSubmit();
  };

  const handleUploadSubmit = async () => {
    if (value !== 1 || !isSigned) {
      Alert.alert('Please sign and click Save button');
      return;
    }

    try {
      const response = await Update(credentials, 'facilities');
      if (!response?.error) {
        Alert.alert('Success!', "You're in", [{ text: 'OK' }]);
        setFacilityAcknowledgement(response.user.facilityAcknowledgeTerm);
        navigation.navigate("FacilityProfile");
      } else {
        Alert.alert('Failed!', "Network Error", [{ text: 'OK' }]);
      }
    } catch (error) {
      Alert.alert('Failed!', "Network Error", [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <MHeader navigation={navigation} back={true} />
      <SubNavbar navigation={navigation} name={"FacilityLogin"} />
      <ScrollView style={{ width: '100%', marginTop: height * 0.22 }} showsVerticalScrollIndicator={false}>
        <Hyperlink linkDefault={true}>
          <View style={styles.permission}>
            <View style={styles.titleBar}>
              <Text style={styles.title}>BOOKSMART™ TERMS OF USE</Text>
              <Text style={styles.text}>The Terms of Use (“TERMS” or “Agreement”) established by BookSmart Technologies LLC, 
                a New York Limited Liability Company, (hereinafter BOOKSMART™) and set forth below are agreed to by Client, such entity, 
                including any successors, assigns, and third party beneficiaries) (collectively “You”), and govern your access to and use of the BookSmart™  
                provisions of services (described below), effective and agreed to by You as of the earlier of the date You click “Accept,” first access or 
                use BOOKSMART™ or otherwise indicate your assent to the Agreement (“Effective Date”). By clicking “Accept” or otherwise using BOOKSMART™ 
                You agree to bound to the TERMS set forth below.</Text>
            </View>

              <View style={styles.titleBar}>
                <Text style={styles.subTitle}>1. Definitions.</Text>
                <Text style={styles.text}>
                  <Text style={{fontWeight: 'bold'}}>(a) Independent Contractors and Clients. </Text>
                  For purposes of this Agreement, Independent Contractors (I/Cs) are independent third-party providers of services and are willing to provide such services on a short-term basis with Clients who are independent third-party businesses that seek to engage I/Cs to provide Services. You may then review responses from I/Cs indicating their availability and determine which I/Cs You wish to engage based on information supplied by the I/C to You through the Service.</Text>
                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>(b) You, Your, or Users. </Text> As used herein, “You,” “Your,” or “Users” alternatively refers to Clients using BookSmart™.</Text>
                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>(c) Service Requests. </Text>You may post requests for the services (“Service Requests” or “Request for Services”) of one or more I/C’s. The Service Request will contain the nature and type of Services required of the I/C, including a description of the services requested and where and when the services may be performed.</Text>
                <Text style={[styles.text, {marginTop: 0}]}>
                <Text style={{fontWeight: 'bold'}}>(d) Completed Service. </Text>
                  An I/C’s response to Your Service Request is referred to herein as a
                  “Service Application.” You, through BookSmart™, can review the Service Application and select
                  the I/C or I/Cs that best match the Service Request. Once the I/C completes the accepted
                  Service Request, the service shall be considered a “Completed Service.”
                </Text>
              </View>

              <View style={styles.titleBar}>
                <Text style={styles.subTitle}>2. No Control.</Text>
                <Text style={styles.text}>
                  <Text style={{fontWeight: 'bold'}}>(a) Use of This Service. </Text>
                    You retain total and absolute discretion as to when You choose to use BOOKSMART™, submit Service Applications, or otherwise respond to Service Requests. There are no set times or days during which I/Cs are required to use BOOKSMART™ or provide services of any kind to any entity. All Service Requests by Customers are posted through BOOKSMART™ by the Customers, not BOOKSMART™.</Text>
                    <Text style={[styles.text, { marginTop: 0 }]}>
                      <Text style={{ fontWeight: 'bold' }}>(b) Providing Services. </Text>
                        BookSmart™ will never: direct or control your interaction(s) with any I/C regarding their 
                        Service Application; take any active role in any I/C’s provision of services pursuant to your Service Request; 
                        direct Your acts or omissions in connection with any I/C; or direct any I/C to report to any
                        facility at any given time, for any given shift, or for any set period of time. 
                        BookSmart™ simply makes Service Requests visible to I/Cs, and You retain total and complete 
                        control as to when, if ever, You post a shift or otherwise use BookSmart™. 
                        You acknowledge and agree that each I/C retains total and complete autonomy to provide 
                        other services to other entities or to 
                        <Text>{' '}otherwise engage in other business activities.</Text>
                    </Text> 

                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>(c) No Authorization. </Text>
                  Users of BookSmart’s Services acknowledge and agree that they are not the agent or representative of BOOKSMART™ and are not authorized to make any representation, contract or commitment on behalf of BOOKSMART™.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(d) Qualifications. </Text>I/Cs represent that they are duly licensed (as applicable) and have the experience, qualifications, and ability to perform each Request the I/C accepts.</Text>
                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>(e) No Reimbursement. </Text>
                    BookSmart™ does not reimburse any user for any expenses incurred
                    because of the performance of Services for Clients.
                  </Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(f) No Employment Relationship. </Text>In addition to the Terms set forth above, You expressly acknowledge and agree that there is no employment, part-time employment, consulting, partnership, or joint venture relationship between I/C and You, I/C and BookSmart, or between You and BookSmart™. You agree that You are not a joint employer with BookSmart™. You further agree and acknowledge that BookSmart™ is not an employment service or agency and does not secure employment for You. You understand and acknowledge that BookSmart™ does not pay any unemployment compensation taxes with respect to any provision of any work for any Client. You understand and acknowledge that I/Cs are not entitled to any unemployment compensation benefits chargeable to or claimed from BookSmart™ during any period of time that any I/C is partially or fully engaged in the provision of services related to any Service Request. </Text>
                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>(g) Consent to Text Messages, Notifications, Phone Calls, and Emails. </Text>
                  You consent to receiving text messages, notifications, phone calls, and emails from BookSmart™ and/or from users of BookSmart™ using the contact information provided by You to BookSmart™. You are solely responsible for any costs You incur when receiving text messages, including any carrier charges that apply for receiving such text messages. </Text>
              </View>

              <View style={styles.titleBar}>
                <Text style={styles.subTitle}>3. Payment and Insurance Terms.</Text>
                <Text style={[styles.text, { marginBottom: 20 }]}>
                  <Text style={{fontWeight: 'bold'}}>(a) Payment Terms. </Text>
                    For each Completed Service that an I/C performs, BookSmart™ will receive 
                    from You the I/C's hourly rates plus applicable fees as such: 
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 10 }} />
                  <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black' }}>If Client is a Staffing Agency or Managed Services Provider, the fee is $5/hour per I/C for use of BookSmart™ and related processing of payments and insurances (“Service Fee”). Payment Terms for this are due upon receipt (Net 0); </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 20 }} />
                  <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop: 10 }}>If Client is a Facility or Community, the fee is $7/hour per CNA, $10/hour for LPN or $15/hour for RN for use of BookSmart™ and related processing of payments and insurances (“Service Fee”). Payment Terms for this are due upon receipt (Net 0); </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 20 }} />
                  <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop: 10 }}>If Client is a Facility or Community paying Net 30, the maximum bill rate is: $35/hour - CNA, $55/hour - LPN, $75/hour – RN, and $85/hour - Supervisor. </Text>
                </View>

                <Text style={[styles.text, { marginBottom: 0 }]}>
                  <Text style={{fontWeight: 'bold'}}>Hours Bonus. </Text>
                  A 50% Hourly Bill Rate adjustment shall be applied for all hours worked by I/Cs in excess of 40 hours in any given week. </Text>
                <Text style={[styles.text, { marginBottom: 0 }]}>
                  <Text style={{fontWeight: 'bold'}}>Holiday Bonus. </Text>
                  A 50% Hourly Bill Rate adjustment shall be applied for any I/C hours worked on: New Years Day, Easter Sunday, Memorial Day, Independence Day, Labor Day, Thanksgiving, and Christmas Day.  </Text>
                <Text style={[styles.text, { marginBottom: 0 }]}>
                  <Text style={{fontWeight: 'bold'}}>Bonus Exclusivity. </Text>
                  Under no circumstances shall the Hours Bonus or Holiday Bonus be cumulative for the same hours worked. In instances where hours may qualify for both, only one bonus shall be applied. </Text>
                
                <Text style={[styles.text]}>
                  <Text style={{fontWeight: 'bold'}}>(b) Taxes. </Text>
                    Users are solely responsible for all tax returns and payments required to be filed with 
                    or made to any federal, state, or local tax authority in connection with the performance of 
                    Services. Users of BookSmart™ are exclusively liable for complying with all applicable federal, 
                    state, and local laws, including laws governing self-employed individuals, if applicable. 
                    Furthermore, users are exclusively liable for complying with all laws related to payment of taxes, 
                    social security, disability, and other contributions based on fees paid to I/C by BookSmart™ in 
                    connection with a Completed Service or otherwise received by I/C through the Service. 
                    BookSmart™ will not withhold or make payments for taxes, social security, unemployment 
                    insurance or disability insurance contributions. BookSmart™ will not obtain workers’ 
                    compensation insurance (except as described below) on I/Cs behalf. Users hereby agree to 
                    indemnify and defend BookSmart™ against any and all such taxes or contributions, including 
                    penalties, interest, attorneys’ fees and expenses. BookSmart™ does not offer tax advice to 
                    Users. 
                
                </Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(c) Insurance. </Text>
                   I/Cs using BOOKSMART™ are required to carry Workplace Safety Insurance and Liability Insurance coverage in order to perform Services for any Client. BOOKSMART™ has Workplace Safety Insurance in place through accredited insurance carriers as well as Independent Contractor Liability Insurance (Collectively “Insurance”) for You to enroll in and take advantage of. Applicants enroll themselves with this Insurance coverage from the applicable BOOKSMART™ insurance carrier(s) prior to commencing any shifts. I/Cs using BookSmart™carry Workplace Safety Insurance and Liability Insurance coverage in order to perform Services for any Client. BookSmart™ has Workplace Safety Insurance in place through accredited insurance carriers as well as Independent Contractor Liability Insurance (Collectively “Insurance”). Further information about these insurances and carriers may be available on<Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
                  {' '}www.WhyBookDumb.com </Text>or on this app from time to time. By accessing/using BookSmart™ you consent and agree to these Terms.</Text>
                
                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>4. Cancellation Terms. </Text>
                    In the event You should cancel any shift within two hours of the
                    scheduled start time of such shift, You will be billed two hours at the appropriate bill rate for the
                    I/C affected by such cancellation.
                </Text>  

                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>5. HIPAA. </Text>
                  You expressly understand and acknowledge that, as a result of the provision of I/C 
                  Services using BookSmart™, You may be considered a covered entity under the Health Insurance 
                  Portability and Accountability Act (“HIPAA”). You expressly agree to observe the Privacy, 
                  Security, and Breach Notification Rules set forth under HIPAA. You understand that failure to 
                  adhere to these three HIPAA Rules may result in the imposition of civil, or some cases, criminal 
                  sanctions.
                </Text>
                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>6. Third-Party Beneficiaries. </Text>
                  You agree that the Terms of this Agreement shall apply only to You 
                  and are not for the benefit of any third-party beneficiaries. 
                  </Text>
                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>7. Attorney’s Fees. </Text>
                    In the event a court of competent jurisdiction determines that You have 
                    breached the Terms of this Agreement, BookSmart™ shall be entitled to an award of all costs, 
                    including all attorney’s fees, incurred by BookSmart™ as a result of such breach.
                </Text>
                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>8. Governing Law. </Text>
                    The Terms under this Agreement will be construed in accordance with and 
                    governed by the laws of the State of New York without regard to conflicts of laws principles. You 
                    agree that the exclusive venue for resolving any dispute arising under Terms shall be in the state 
                    and federal courts located in the County of Erie, State of New York, and you consent to the 
                    jurisdiction of such courts. You hereby waive any objection to Erie County, New York as venue 
                    for the hearing of any dispute between You and BookSmart™ including but not limited to any 
                    objection based on convenience. 
                </Text>
                <Text style={[styles.text, {marginVertical: 0, padding: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>9. Indemnification. </Text>
                    BookSmart™ will have no liability and You agree to indemnify, defend and 
                    hold BookSmart™ harmless against any claim, loss, damage, cost, liability, and/or expenses 
                    (including all court costs and reasonable attorney’s fees incurred) arising from any action or 
                    claim resulting from: (i) Your content; (ii) Your violation of the Terms under this Agreement, any 
                    law or regulation, or any rights (including Intellectual Property) of another party; (iii) Your use of 
                    BookSmart™; and/or (iv) the employment classification of any I/C by You or BookSmart™.
                </Text>
              </View>

              <View style={styles.titleBar}>
                <Text style={[styles.subTitle, {marginTop: 25}]}>10. Disclaimer of Warranties.</Text>
                <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>(a) Service Provided As-Is. </Text>
                  YOUR USE OF BookSmart™ IS AT YOUR SOLE RISK. ALL PRODUCTS 
                  AND SERVICES PROVIDED UNDER THIS AGREEMENT ARE PROVIDED “AS IS,” “AS AVAILABLE” 
                  AND “WITH ALL FAULTS.” BookSmart™, TO THE MAXIMUM EXTENT PERMITTED BY LAW,
                  EXPRESSLY DISCLAIMS ALL WARRANTIES AND REPRESENTATIONS, EXPRESS OR IMPLIED, 
                  INCLUDING: (i) THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A 
                  PARTICULAR PURPOSE; AND (ii) ANY WARRANTY WITH RESPECT TO THE QUALITY, ACCURACY, 
                  CURRENCY OR COMPLETENESS OF THE PRODUCTS AND SERVICES PROVIDED UNDER THIS 
                  AGREEMENT, OR THAT USE OF SUCH PRODUCTS AND SERVICES WILL BE ERROR-FREE, 
                  UNINTERRUPTED, FREE FROM OTHER FAILURES OR WILL MEET YOUR REQUIREMENTS.
                </Text>
                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>(b) Interactions with Other Users. </Text>
                    YOU ARE SOLELY RESPONSIBLE FOR YOUR INTERACTIONS 
                    AND TRANSACTIONS WITH OTHER USERS. YOU AGREE TO LOOK SOLELY TO SUCH OTHER USERS 
                    FOR ANY CLAIM, DAMAGE OR LIABILITY ASSOCIATED WITH ANY COMMUNICATION OR 
                    TRANSACTION VIA BOOKSMART™. YOU EXPRESSLY WAIVE AND RELEASE BOOKSMART™ FROM 
                    ANY AND ALL LEGAL RESPONSIBILITIES, CLAIMS, RIGHTS OF ACTION, CAUSES OF ACTION, SUITS, 
                    DEBTS, JUDGMENTS, DEMANDS, DAMAGES AND LIABILITIES ARISING OUT OF ANY ACT OR 
                    OMISSION OF ANY OTHER USER OR THIRD PARTY, INCLUDING DAMAGES RELATING TO 
                    MONETARY CLAIMS, PERSONAL INJURY OR DESTRUCTION OF PROPERTY, MENTAL ANGUISH, 
                    INTEREST, COSTS, ATTORNEY’S FEES, AND EXPENSES. YOUR SOLE REMEDIES WITH RESPECT 
                    THERETO SHALL BE BETWEEN YOU AND THE APPLICABLE USER OR OTHER THIRD-PARTY. 
                    BOOKSMART™ RESERVES THE RIGHT, BUT HAS NO OBLIGATION, TO MONITOR DISPUTES 
                    BETWEEN USERS. BOOKSMART™ IS A MARKETPLACE SERVICE FOR USERS TO CONNECT ONLINE. 
                    EACH USER IS SOLELY RESPONSIBLE FOR INTERACTING WITH AND SELECTING ANOTHER USER, 
                    CONDUCTING ALL NECESSARY DUE DILIGENCE, AND COMPLYING WITH ALL APPLICABLE LAWS. 
                  </Text>
              </View>

              <View style={styles.titleBar}>
                <Text style={styles.subTitle}>11. Limitation of Liability.</Text>
                <Text style={styles.text}>
                  <Text style={{fontWeight: 'bold'}}>(a) General. </Text>
                  IN NO EVENT WILL BOOKSMART™ BE LIABLE TO YOU FOR ANY INCIDENTAL, 
                  INDIRECT, SPECIAL, PUNITIVE OR CONSEQUENTIAL DAMAGES, OR LOST PROFITS OR COSTS OF 
                  COVER, INCLUDING DAMAGES ARISING FROM ANY TYPE OR MANNER OF COMMERCIAL, 
                  BUSINESS OR FINANCIAL LOSS OCCASIONED BY OR RESULTING FROM ANY USE OF OR INABILITY 
                  TO USE BOOKSMART™, SUCH AS ANY MALFUNCTION, DEFECT OR FAILURE OF THE 
                  BOOKSMART™ PLATFORM VIA THE INTERNET, OR ANY INACCURACY, INCOMPLETENESS OR 
                  OTHER DEFECT IN ANY CONTENT ACCESSIBLE THROUGH BOOKSMART™, EVEN IF BOOKSMART™ 
                  HAD ACTUAL OR CONSTRUCTIVE KNOWLEDGE OF THE POSSIBILITY OF SUCH DAMAGES AND 
                  REGARDLESS OF WHETHER SUCH DAMAGES WERE FORESEEABLE. OTHER THAN WITH RESPECT 
                  TO GROSS NEGLIGENCE OR WILLFUL MISCONDUCT.
                </Text>
                <Text style={[styles.text, {marginTop: 0}]}>
                  <Text style={{fontWeight: 'bold'}}>(b) Quality of I/C Services. </Text>
                    THE QUALITY OF I/C SERVICES REQUESTED THROUGH THE USE OF 
                    BOOKSMART™ IS ENTIRELY THE RESPONSIBILITY OF THE I/Cs WHO PROVIDE SUCH SERVICES. 
                    YOU UNDERSTAND AND EXPRESSLY AGREE THAT BY USING BOOKSMART™, YOU MAY BE 
                    EXPOSED TO SERVICES THAT ARE POTENTIALLY HARMFUL, UNSAFE, OR OTHERWISE 
                    OBJECTIONABLE, AND THAT USE OF THE BOOKSMART™ SERVICES IS AT YOUR OWN RISK.
                  </Text>
              </View>

              <View style={styles.titleBar}>
                <Text style={[styles.text, {fontWeight: 'bold', marginTop: 0}]}>
                  IMPORTANT! BE SURE YOU HAVE SCROLLED THROUGH AND CAREFULLY READ ALL of the 
                  above Terms and Conditions of this Agreement before electronically signing and/or clicking an 
                  “Agree” or similar button and/or using BookSmart™ (“acceptance”). This Agreement is legally 
                  binding between you and BookSmart™. By electronically signing and/or clicking an “Agree” or 
                  similar button and/or using the site, you affirm that you are of legal age and have the legal 
                  capacity to enter into this Agreement, and you agree to abide by ALL of the Terms and 
                  Conditions stated or referenced herein. If you do not agree to abide by these Terms and 
                  Conditions, do NOT electronically sign and/or click an “Agree” or similar button and do not 
                  use BookSmart™. You must accept and abide by these Terms and Conditions in the Agreement 
                  as presented to you. 
                </Text>
              </View>
            {/* Dropdown */}
            <View style={styles.titleBar}>
              <Text style={[styles.text, { fontWeight: 'bold', marginTop: 0 }]}>Facility Acknowledge Terms? Yes/No</Text>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                iconStyle={styles.iconStyle}
                data={items}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={''}
                value={value ?? items[1].value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setValue(item.value);
                  setIsFocus(false);
                  setCredentials({
                    ...credentials,
                    facilityAcknowledgeTerm: item.value === 1,
                    selectedoption: checked
                  });
                }}
              />
            </View>

            {/* Signature Section */}
            {value === 1 && (
              <View style={styles.titleBar}>
                <Text style={[styles.text, { fontSize: RFValue(12), fontWeight: 'bold', marginTop: 0 }]}>
                  Facility Acknowledge Terms Signature <Text style={{ color: '#f00' }}>*</Text>
                </Text>

                {isSigned && credentials.signature ? (
                  <>
                    <Image
                      source={{ uri: `data:image/png;base64,${credentials.signature}` }}
                      style={styles.signaturePreview}
                    />
                    <View style={styles.buttonContainer}>
                      <Button title="Reset" onPress={handleReset} />
                    </View>
                  </>
                ) : (
                  <>
                    <SignatureCapture
                      style={styles.signature}
                      ref={signatureRef}
                      onSaveEvent={onSaveEvent}
                      saveImageFileInExtStorage={false}
                      showNativeButtons={false}
                      showTitleLabel={false}
                      viewMode="portrait"
                    />
                    <View style={styles.buttonContainer}>
                      <Button
                        title={isSaving ? 'Saving...' : 'Save'}
                        onPress={() => {
                          if (!isSigned && signatureRef.current) {
                            setIsSaving(true);
                            signatureRef.current.saveImage();
                          } else {
                            Alert.alert("Already signed", "Reset to re-sign.");
                          }
                        }}
                        disabled={isSaving || isSigned}
                      />
                      <Button title="Reset" onPress={handleReset} />
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Submit Button */}
            <View style={[styles.btn, { marginTop: 20, width: '90%' }]}>
              <HButton style={styles.subBtn} onPress={handlePreSubmit}>Submit</HButton>
            </View>

            <Image source={images.homepage} resizeMode="cover" style={styles.homepage} />
          </View>
        </Hyperlink>
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
    position: 'relative'
  },
  permission: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 10
  },
  titleBar: {
    width: '90%'
  },
  dropdown: {
    height: 30,
    width: '25%',
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10
  },
  placeholderStyle: {
    color: 'black',
    fontSize: RFValue(16),
  },
  selectedTextStyle: {
    color: 'black',
    fontSize: RFValue(16),
  },
  itemTextStyle: {
    color: 'black',
    fontSize: RFValue(16),
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  text: {
    fontSize: RFValue(14),
    color: 'black',
    fontWeight: 'normal',
    marginVertical: RFValue(20),
  },
  signature: {
    flex: 1,
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  signaturePreview: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  homepage: {
    width: 250,
    height: 200,
    marginTop: 30,
    marginBottom: 100
  },
  btn: {
    flexDirection: 'column',
    gap: 20,
    marginBottom: 30,
  },
  subBtn: {
    marginTop: 0,
    padding: 10,
    backgroundColor: '#A020F0',
    color: 'white',
    fontSize: RFValue(17),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  title: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#2a53c1',
    textDecorationLine: 'underline'
  },
  subTitle: {
    fontSize: RFValue(15),
    fontWeight: 'bold',
    color: 'black'
  },
  text: {
    fontSize: RFValue(14),
    color: 'black',
    fontWeight: 'normal',
    marginVertical: RFValue(20),
  },
});
