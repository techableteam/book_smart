import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Dimensions, Image, Alert } from 'react-native';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import Hyperlink from 'react-native-hyperlink';
import { Dropdown } from 'react-native-element-dropdown';
import SignatureCapture from 'react-native-signature-capture';
import images from '../../assets/images';
import HButton from '../../components/Hbutton';
import { Update } from '../../utils/useApi';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function ClientPermission ({ navigation }) {
    const items = [
        {label: 'Yes', value: 1},
        {label: 'No', value: 2},
    ];
    const [value, setValue] = useState(2);
    const [isFocus, setIsFocus] = useState(false);
    const [credentials, setCredentials] = useState({
        signature: '',
        clinicalAcknowledgeTerm: false
    });
    let signatureRef = useRef(null);

    const onSaveEvent = (result) => {
        setCredentials(prevCredentials => ({
          ...prevCredentials, 
          signature: result.encoded
        }));
    };

    const handleUploadSubmit = async () => {
        if (value == 2) {
            return; // If No, Can't call sumnit function
        }

        if (credentials.signature === '') {
            Alert.alert(
              'Warning!',
              "signature required",
              [
                {
                  text: 'OK',
                  onPress: () => {
                    console.log('OK pressed');
                  },
                },
              ],
              { cancelable: false }
            );
        } else {
            try {
                const response = await Update(credentials, 'clinical');
                if (!response?.error) {
                    Alert.alert(
                        'Success!',
                        "You're in.",
                        [
                            {
                            text: 'OK',
                            onPress: () => {
                                console.log('OK pressed')
                            },
                            },
                        ],
                        { cancelable: false }
                    );
                    navigation.navigate("ClientPhone")
                } else {
                    Alert.alert(
                        'Failed!',
                        "Sorry, Please retry again later",
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    console.log('OK pressed')
                                }
                            },
                        ],
                        { cancelable: false }
                    );
                }
            } catch (error) {
                Alert.alert(
                    'Failed!',
                    "Network Error",
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                console.log('OK pressed')
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }
        }
        
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent"/>
            <MHeader navigation={navigation} />
            <SubNavbar navigation={navigation} name={"FacilityLogin"} />
            <ScrollView style={{width: '100%', marginTop: height * 0.25}} showsVerticalScrollIndicator={false} >
                <Hyperlink linkDefault={true}>
                    <View style={styles.permission}>
                        <View style={styles.titleBar}>
                            <Text style={styles.title}>BOOKSMART™ TERMS OF USE</Text>
                            <Text style={styles.text}>These Terms of Use (“Terms” or “Agreement”) established by BookSmart Technologies LLC, a New York Limited Liability Company, d/b/a BOOKSMART (“BOOKSMART”) are set forth below and agreed to by You, assigns, and third party beneficiaries (collectively “You”), and govern your access to use of BOOKSMART’s provisions of services (described below), effective and agreed to by You as of the date You click “Accept,” first access or use BOOKSMART™, or otherwise indicate your assent to the Terms (“Effective Date”). By clicking “Accept” or otherwise using BOOKSMART™, You agree to bound to the Terms set forth below.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={styles.subTitle}>1. Definitions</Text>
                            <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>(a) Independent Contractor (I/C) Services.</Text>For purposes of this Agreement, I/Cs are independent third-party providers who are willing to provide services on a short-term basis with Clients who are independent third-party businesses that seek to engage I/Cs to provide Services. After Client posts a Service Request, I/C may view the posting and choose to indicate their availability to provide the services requested by the Client for the Service Request. The Client may then review responses from I/Cs indicating availability and determine which I/C it wishes to engage based on information supplied by the I/Cs to Clients through the Service.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(b) You, Your, or Users.</Text>As used herein, “You,” “Your,” or “Users” alternatively refers to Independent Contractors (I/Cs) using BOOKSMART™.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(c) Service Requests.</Text>Clients may post requests for services (“Service Requests” or “Request for Services”) for one or more I/Cs. The Service Request will contain the nature and type of I/C Services required, including a description of the services requested and where and when the Services may be performed.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(d) Completed Service.</Text>Clients, through BOOKSMART™, can review the responses to Service Requests (“Service Applications”) for posted Service Requests. I/Cs may decide, at their sole discretion, which Service Applications, if any, they wish to accept for any Service Request. Each Service Application that an I/C has accepted and for which the I/C or I/Cs have fully performed the applicable Services to the satisfaction of the Client is hereinafter referred to as a “Completed Service or Shift.”</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={styles.subTitle}>2. No Control</Text>
                            <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>(a) Use of This Service. </Text>I/Cs retain total and absolute discretion as to when they choose to use BOOKSMART™, submit Service Applications, or otherwise respond to Service Requests. There are no set times or days during which I/Cs are required to use BOOKSMART™ or provide services of any kind to any entity. All Service Requests by Clients are posted through BOOKSMART™ by the Clients, not BOOKSMART™.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(b) Providing Services. </Text>Regarding I/C, BOOKSMART™ will never direct or control your interaction(s) with any Clients or Facilities; take any active role in your provision of Requested Services to any Clients or Facilities; direct your acts or omissions in connection with any Clients or Facilities; direct you to wear BOOKSMART™ branded clothing or identification badges in connection with performing Requested Services; direct you to report to a Client or Facility at a given time, for a given shift, or for a set period of time. BOOKSMART™ simply makes Service Requests visible to you, and you retain total and complete control as to when, if ever, to accept a shift or otherwise use BOOKSMART™. You and BOOKSMART™ acknowledge and agree that you retain total and complete autonomy to provide other services or otherwise engage in any other business activities, including using software similar to the goods or services provided by BOOKSMART™’s competitors. You and BOOKSMART™ further acknowledge and agree you may provide services to Users without use of BOOKSMART™ and therefore agree that such services are outside the scope of this Agreement.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(c) Service Requests Not Guaranteed. </Text>BOOKSMART™ does not guarantee that any Clients will post Service Requests or that any Client will engage I/Cs to perform any work for any Facility. BOOKSMART™ does not guarantee that a Service Request will not be canceled by the Client.</Text>
                            <Text style={[styles.text, {marginTop: 0, marginBottom: 0}]}><Text style={{fontWeight: 'bold'}}>(d) Cancellation Policy. </Text>If you cancel a shift, you will not be able to apply to any shift that overlaps with the shift you canceled.</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 10 }} />
                                <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>If you cancel a shift within 48 hours, you will be bumped to next week’s pay, but expected to work your shifts that are already confirmed. If you cancel a shift with a start time that is less than 12 hours away, you will be suspended for a week, but expected to work your shifts that are already confirmed.</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 10 }} />
                                <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>If you No Call/No Show a shift, we will confirm with the community that you did not show up to your will be suspended for one week, but expected to work shifts that are already confirmed. You will also lose next day pay for this that week.</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 10 }} />
                                <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>If you No Call/No Show a second time, you will be automatically removed from the BookSmart™ app.</Text>
                            </View>
                            <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black', marginTop: 20 }}>*Note: BookSmart™ is committed to helping our I/Cs work through any challenges they may face with regards to canceling a shift. If you feel your situation was unavoidable and you can provide written documentation such as a legible doctor’s note or police report to support this cancellation, we will consider lifting your suspension on a case-by-case basis.</Text>
                            <Text style={[styles.text]}><Text style={{fontWeight: 'bold'}}>(e) No Authorization. </Text>Users of BOOKSMART™ Services acknowledge and agree that they are not the agent or representative of BOOKSMART™ and are not authorized to make any representation, contract or commitment on behalf of BOOKSMART™.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(f) No Qualifications. </Text>I/Cs represent that they are duly licensed (as applicable) and have the experience, qualifications, and ability to perform each Request each I/C accepts.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(g) No Employment Relationship. </Text>In addition to the Terms set forth above, You expressly acknowledge and agree that there is no employment, part-time employment, consulting, contractor, partnership, or joint venture relationship between You and BOOKSMART™. You further agree and acknowledge that BOOKSMART™ is not an employment service or agency and does not secure employment for anyone. You acknowledge and agree that You are not entitled to any of the benefits that BOOKSMART™ makes available to its employees and/or officers and/or directors and/or agents, and users hereby waive and disclaim any rights to receive any such benefits. Users also acknowledge and agree that BOOKSMART™ does not pay any unemployment compensation taxes with respect to any provision of any work for any Client. Moreover, You acknowledge and agree that You are not entitled to any unemployment compensation benefits chargeable to or claimed from BOOKSMART™ during any period of time that You are partially or fully unemployed. You further acknowledge and agree You will not receive Paid Time Off (PTO), Overtime Compensation, Group Health, Short-term Disability Insurance, or Retirement Benefits.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(h) Consent to Text Messages and Phone Calls. </Text>You consent to receiving text messages and phone calls from BOOKSMART™, or the Clients, at the phone number provided in your registration information for the purpose of communicating information regarding Service Requests. You are solely responsible for any costs you incur when receiving text messages, including any carrier charges that apply for receiving such text messages.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={styles.subTitle}>3. Registration Information.</Text>
                            <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>(a) Maintaining Accuracy. </Text>You represent and warrant that: any license numbers (“Licenses”) you provide BOOKSMART™ is your Registration Information or otherwise are valid; such License(s) will remain in full force for the duration of time in which you submit Service Applications for Service Requests requiring any such License(s); and you will notify BOOKSMART™ and all Clients that you have agreed to perform future Services for if you: (i) become suspended or barred from practicing in any jurisdiction, (ii) lose any of your License(s), (iii) are facing disciplinary actions, including suspension, or (iv) make any changes to your Registration Information.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(b) Verification. </Text>BOOKSMART™ will make reasonable efforts to independently verify your Registration Information and any other statements you submit to BOOKSMART™ for the purpose of verifying your statements are accurate and complete (“Verification Purposes”). You hereby authorize BOOKSMART™, either directly or indirectly through third-party vendors or service providers, to attempt to verify such information, via means that may include, conducting checks related to your registration and/or license, checks related to your background, and checks with available public records for verification purposes. You hereby consent to any collection, use, including disclosure in order to complete such verification and agree to provide any documentation or information at BOOKSMART™’s request to facilitate these processes. For information about BOOKSMART™’s use of your personal information, please see BOOKSMART™’s Privacy Policy available at: https://www.whybookdumb.com</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(c) Background Information. </Text>Your ability to provide Requested Services is subject to successfully passing a background check, drug screen (if required by client/facility), which will be conducted by a third party to provide background checks/drug screens and will include identity verification, a global watch list registry check, sex offender registry checks, both national and county criminal records checks, as permissible under applicable law. BOOKSMART™ or its third-party contractor will provide you with appropriate notice and authorization forms regarding any background checks. Additional background checks may be required periodically to maintain eligibility to provide Services Requested by a Client or Facility.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={styles.subTitle}>4. Payment and Insurance Terms.</Text>
                            <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>(a) Payment of Fees. </Text>For each Completed Shift that You perform, You will receive from BOOKSMART™ payment the following Friday. You will enter current bank account information, and You agree that BOOKSMART’s third-party payment processors and BOOKSMART™ may transfer to such bank account the Fees owed, with respect to each Completed Service that You perform. You, not BOOKSMART™, are solely responsible for the accuracy of all bank account information, including the bank account number and bank routing information. BOOKSMART™ hereby disclaims all liability related to errors in fund deposits due to inaccurate or incomplete bank account information.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(b) Taxes. </Text>You are solely responsible for all tax returns and payments required to be filed with or made to any federal, state, or local tax authority in connection to performance of Services. Users of BOOKSMART™ are exclusively liable for complying with all applicable federal, state, and local laws, including social security laws governing self-employed individuals. Furthermore, users are exclusively liable for complying with all laws related to payment of taxes, social security, disability, and other contributions based on fees paid to You by BOOKSMART™ in connection with a Completed Service or otherwise received by You through the Service. BOOKSMART™ will not withhold or make payments for taxes, social security, unemployment insurance or disability insurance contributions. BOOKSMART™ will not obtain workers’ compensation insurance (except as described below) on Caregiver’s behalf. Users hereby agree to indemnify and defend BOOKSMART™ against any and all such taxes or contributions, including penalties, interest, attorneys’ fees and expenses. BOOKSMART™ does not offer tax advice to Users.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(c) Fee Bonus. </Text>I/Cs will receive a 50% Fee Bonus for all hours worked in excess of 40 hours at one facility in any given week. The time cannot be split across multiple facilities. I/Cs shall also receive a 50% Fee Bonus for each hour worked on: New Years Day, Easter Sunday, Memorial Day, Independence Day, Labor Day, Thanksgiving Day, and Christmas. The 50% Bonus does not compound so if the holiday falls on a weekend it will not be counted twice.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(d) Insurance. </Text>I/Cs using BOOKSMART™ are required to carry Workplace Safety Insurance and Liability Insurance coverage in order to perform Services for any Client. BOOKSMART™ has Workplace Safety Insurance in place through accredited insurance carriers as well as Independent Contractor Liability Insurance (Collectively “Insurance”) for you to enroll in and take advantage of. Applicants will need to list themselves with this Insurance coverage from BOOKSMART™'s insurance carrier(s).</Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(e) Service Fee. </Text>A fee of $2/hour will be deducted for use of BOOKSMART™ and processing of payments and insurances (“Service Fee”). Further information about these insurances and carriers may be available at WhyBookDumb.com/Insurance or on this app from time to time. By accessing/using BOOKSMART™ you consent and agree to these terms.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={styles.subTitle}><Text style={{fontWeight: 'bold'}}>5. Safety & Work-Related Injury Policy. </Text>Safety is a top priority. Each Independent Contractor is expected to obey general safety rules and exercise caution and common sense in all work activities.</Text>
                            <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>All Independent Contractors must agree to comply with the following safe working practices:</Text>
                            <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>Agree to follow established departmental safety procedures;</Text>
                            <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>Agree to know and adhere to all work site specific safety rules and policies;</Text>
                            <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>Agree to use all site-specific safety equipment provided by facility;</Text>
                            <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>Agree to report to their facility supervisor any work-related accident or injury to themselves or others as soon as it occurs;</Text>
                            <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>Agree that if you need medical treatment, you will immediately notify the facility and BOOKSMART™ and obtain “back to work” paperwork from physician prior to returning to picking up shifts.</Text>
                            <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>Agree to drug testing as part of any work-related accident and/or injury.</Text>
                            <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>Failure to follow the above procedures could result in expulsion from usage of BOOKSMART™ and potential loss of insurance claims.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>6. HIPAA. </Text>Users expressly understand and acknowledge that as a result of the provision of Caregiver Services using BOOKSMART™ you may be considered a covered entity under the Health Insurance Portability and Accountability Act (“HIPAA”). You expressly agree to observe the Privacy, Security, and Breach Notification Rules set forth under HIPAA. You understand that failure to adhere to these three HIPAA Rules may result in the imposition of civil, or some cases, criminal sanctions.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { marginTop: 0 }]}><Text style={{fontWeight: 'bold'}}>7. Third-Party Beneficiaries. </Text>Users agree that the Terms of this Agreement shall apply only to you and are not for the benefit of any third-party beneficiaries.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { marginTop: 0 }]}><Text style={{fontWeight: 'bold'}}>8. Attorney’s Fees. </Text>In the event a court of competent jurisdiction determines that any User has materially breached the Terms under this Agreement, BOOKSMART™ shall be entitled to an award of any costs and reasonable attorney’s fees incurred by BOOKSMART™ because of such breach.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { marginTop: 0 }]}><Text style={{fontWeight: 'bold'}}>9. Governing Law. </Text>The Terms under this Agreement be construed in accordance with and governed by the laws of the State of New York, without regard to conflicts of laws principles. You agree that the exclusive venue for resolving any dispute arising under this Agreement shall be in the state and federal courts located in the County Erie, State of New York, and you consent to the jurisdiction of the federal and state courts located in Erie County, New York. You hereby waive any objection to Erie County, New York as venue for the hearing of any dispute between you and BOOKSMART™ that is not compelled to arbitration for any reason, including but not limited to any objection based on convenience.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { marginTop: 0 }]}><Text style={{fontWeight: 'bold'}}>10. Indemnification. </Text>BOOKSMART™ will have no liability and you will indemnify, defend and hold BOOKSMART™ harmless against any loss, damage, cost, liability and expense (including reasonable attorneys’ fees and expenses) arising from any action or claim resulting from: (i) Your Content; (ii) your violation of the TERMS under this Agreement, any law or regulation, or any rights (including Intellectual Property) of another party; (iii) your access to or use of BOOKSMART™; and/or (iv) the classification of an independent contractor by BOOKSMART™ or by any Client.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { marginTop: 0 }]}><Text style={{fontWeight: 'bold'}}>11. Disclaimer of Warranties. </Text>You are solely responsible for your interactions and transactions with other Users. You agree to look solely to such other Users for any claim, damage or liability associated with any communication or transaction via BOOKSMART™. YOU EXPRESSLY WAIVE AND RELEASE BOOKSMART™ FROM ANY AND ALL legal responsibilities, CLAIMS, rights of action, causes of action, suits, debts, judgments, demands, DAMAGES AND LIABILITIES ARISING OUT OF ANY ACT OR OMISSION OF ANY OTHER USER OR THIRD PARTY, INCLUDING DAMAGES RELATING TO MONETARY CLAIMS, PERSONAL INJURY OR DESTRUCTION OF PROPERTY, mental anguish, interest, costs, attorneys’ fees, and expenses. YOUR SOLE REMEDIES WITH RESPECT THERETO SHALL BE BETWEEN YOU AND THE APPLICABLE USER OR OTHER THIRD-PARTY. BOOKSMART™ RESERVES THE RIGHT, BUT HAS NO OBLIGATION, TO MONITOR DISPUTES BETWEEN USERS. BOOKSMART™ IS A MARKETPLACE SERVICE FOR USERS TO CONNECT ONLINE. EACH USER IS SOLELY RESPONSIBLE FOR INTERACTING WITH AND SELECTING ANOTHER USER, CONDUCTING ALL NECESSARY DUE DILIGENCE, AND COMPLYING WITH ALL APPLICABLE LAWS.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, {fontWeight: 'bold', marginTop: 0}]}>IMPORTANT! BE SURE YOU HAVE SCROLLED THROUGH AND CAREFULLY READ ALL of the above Terms and conditions of this Agreement before electronically signing and/or clicking an “Agree” or similar button and/or USING THE SITE (“acceptance”). This Agreement is legally binding between you and BOOKSMART. By electronically signing and/or clicking an “Agree” or similar button and/or using the SITE, you AFFIRM THAT YOU ARE OF THE LEGAL AGE OF 18 AND NOT OVER 70 YEARS OLD AND HAVE THE LEGAL CAPACITY TO ENTER INTO THE AGREEMENT, AND YOU agree to abide by all of the Terms and conditions stated or referenced herein. If you do not agree to abide by these Terms and conditions, do not electronically sign and/or click an “agree” or similar button and do not use the SITE. You must accept and abide by these Terms and conditions in the Service Terms as presented to you.</Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, {fontWeight: 'bold', marginBottom: 5}]}>Acknowledge Terms? Yes/No</Text>
                            <Dropdown
                                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.itemTextStyle}
                                data={items}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={'100 per page'}
                                value={value ? value : items[1].value}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={item => {
                                    setValue(item.value);
                                    setIsFocus(false);
                                    if (item.value == 1) {
                                        setCredentials(prevCredentials => ({
                                            ...prevCredentials, 
                                            clinicalAcknowledgeTerm: true
                                        }));
                                    } else  {
                                        setCredentials(prevCredentials => ({
                                            ...prevCredentials, 
                                            clinicalAcknowledgeTerm: false
                                        }));
                                    }
                                }}
                            />
                        </View>
                        {value == 1 && <View style={styles.titleBar}>
                            <Text style={[styles.text, {fontWeight: 'bold', marginBottom: 5}]}>Signature <Text style={{color: '#f00'}}>*</Text></Text>
                            <SignatureCapture
                                style={styles.signature}
                                ref={signatureRef}
                                onSaveEvent={onSaveEvent}
                                saveImageFileInExtStorage={false}
                                showNativeButtons={true}
                            />
                        </View>}
                        <View style={[styles.btn, {marginTop: 20, width: '90%'}]}>
                            <HButton style={styles.subBtn} onPress={ handleUploadSubmit }>
                                Submit
                            </HButton>
                        </View>
                        <Image
                            source={images.homepage}
                            resizeMode="cover"
                            style={styles.homepage}
                        />
                    </View>
                </Hyperlink>
            </ScrollView>
        <MFooter />
      </View>
    )
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
    color: 'black',
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
    color: 'black'
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
  placeholderStyle: {
    color: 'black',
    fontSize: RFValue(12),
  },
  selectedTextStyle: {
    color: 'black',
    fontSize: RFValue(12),
  },
  itemTextStyle: {
    color: 'black',
    fontSize: RFValue(12),
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: RFValue(12),
  },
  title: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#2a53c1',
    textDecorationLine: 'underline'
  },
  subTitle: {
    fontSize:RFValue(15),
    fontWeight: 'bold',
    color: 'black'
  },
  text: {
    fontSize: RFValue(14),
    color: 'black',
    fontWeight: 'normal',
    marginVertical: 20,
  },
  signature: {
    flex: 1,
    width: '100%',
    height: 200,
  },
  homepage: {
    width: 250,
    height: 200,
    marginTop: 30,
    marginBottom: 100
  },
  btn: {flexDirection: 'column',
    gap: 20,
    marginBottom: 30,
  },
  subBtn: {
    marginTop: 0,
    padding: 10,
    backgroundColor: '#A020F0',
    color: 'white',
    fontSize: 16,
  },
});
  