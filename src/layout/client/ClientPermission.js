import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Dimensions, Image, Alert, Button } from 'react-native';
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
    const [isSigned, setIsSigned] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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
        setIsSigned(true);
        setIsSaving(false);
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
                    navigation.navigate("MyHome")
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
            <MHeader navigation={navigation} back={true} />
            <SubNavbar navigation={navigation} name={"FacilityLogin"} />
            <ScrollView style={{width: '100%', marginTop: height * 0.22}} showsVerticalScrollIndicator={false} >
                <Hyperlink linkDefault={true}>
                    <View style={styles.permission}>
                        <View style={styles.titleBar}>
                            <Text style={styles.title}>BOOKSMART™ TERMS OF USE</Text>
                            <Text style={styles.text}>
                                The Terms of Use (“Terms” or “Agreement”) established by BookSmart Technologies 
                                LLC, a New York Limited Liability Company (“BookSmart™”) are set forth below and 
                                agreed to by You, assigns, and third party beneficiaries (collectively “You”), and govern 
                                Your access to use of BookSmart’s provisions of services (described below), effective 
                                and agreed to by You as of the date You click “Accept,” first access or use 
                                BookSmart™, or otherwise indicate Your assent to the Terms (“Effective Date”). By 
                                clicking “Accept” or otherwise using BookSmart™, You agree to be bound to the Terms 
                                set forth below. 
                            </Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={styles.subTitle}>1. Definitions.</Text>
                            <Text style={styles.text}>
                                <Text style={{fontWeight: 'bold'}}>(a) Independent Contractor (I/C) Services. </Text>
                                For purposes of this Agreement, I/Cs are 
                                independent third-party providers who are willing to provide services on a short-term 
                                basis with Clients who are independent third-party businesses that seek to engage I/Cs 
                                to provide services. After Client posts a Service Request, I/C may view the posting and 
                                choose to indicate their availability to provide the services requested by the Client for 
                                the Service Request. The Client may then review responses from I/Cs indicating 
                                availability and determine which I/C it wishes to engage based on information supplied 
                                by the I/Cs to Clients through BookSmart™.
                                </Text>
                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(b) You, Your, or Users. </Text>
                                    As used herein, “You,” “Your,” or “Users” alternatively refers to
                                    Independent Contractors (I/Cs) using BookSmart™.
                                </Text>
                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(c) Service Requests. </Text>
                                Clients may post requests for services (“Service Requests”) for 
                                one or more I/Cs. Such Service Request will contain the nature and type of I/C Services 
                                required, including a description of the services requested and where and when the 
                                services may be performed. 
                                </Text>
                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(d) Completed Service. </Text>
                                Clients, through BookSmart™, can review the responses to 
                                Service Requests (“Service Applications”) for posted Service Requests. You may 
                                decide, at Your sole discretion, which Service Applications, if any, You wish to accept for 
                                any Service Request. Each Service Application that You accept and for which You fully 
                                perform to the satisfaction of the Client is hereinafter referred to as a “Completed 
                                Service.” 
                                </Text>
                        </View>

                        <View style={styles.titleBar}>
                            <Text style={styles.subTitle}>2. No Control.</Text>
                            <Text style={styles.text}>
                                <Text style={{fontWeight: 'bold'}}>(a) Use of This Service. </Text>
                                You retain total and absolute discretion as to Your use of 
                                BookSmart™. You choose when to submit Service Applications, or otherwise respond to 
                                Service Requests. There are no set times or days during which You are required to use 
                                BookSmart™ or provide services of any kind to any entity. All Service Requests by 
                                Clients are posted through BookSmart™ by the Clients, not BookSmart™.
                            </Text>

                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(b) Providing Services. </Text>
                                BookSmart™ will never: direct or control Your interaction(s) 
                                with any Clients; take any active role in Your provision of Service Requests to any 
                                Clients; direct Your acts or omissions in connection with any Clients; direct You to wear 
                                BookSmart™ branded clothing or identification badges in connection with performing 
                                Service Requests; or direct You to report to a Client at any given time, for any given 
                                shift, or for any set period of time. BookSmart™ simply makes Service Requests visible 
                                to You, and You retain total and complete control as to when, if ever, You accept a shift 
                                or otherwise use BookSmart™. You and BookSmart™ acknowledge and agree that You 
                                retain total and complete autonomy to provide other services or otherwise engage in 
                                any other business activities, including using software similar to the goods or services 
                                provided by competitors of BookSmart™. You and BookSmart™ further acknowledge 
                                and agree that You may provide services to Users without use of BookSmart™ and 
                                therefore agree that such services are outside the scope of this Agreement. 
                            </Text>

                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(c) Service Requests Not Guaranteed. </Text>
                                BookSmart™ does not guarantee that any 
                                Clients will post Service Requests or that any Client will engage I/Cs to perform any 
                                work for any Facility. BookSmart™ does not guarantee that a Service Request will not 
                                be canceled by the Client. 
                            </Text>

                            <Text style={[styles.text, {marginTop: 0, marginBottom: 20}]}>
                                <Text style={{fontWeight: 'bold'}}>(d) Cancellation Policy. </Text>
                                If You cancel a shift, You will not be able to apply for any shift 
                                that overlaps with the shift You canceled.
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 10 }} />
                                <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black' }}>
                                    If You cancel a shift within 48 hours prior to the start of such shift, You may be 
                                    bumped to next week’s pay, but You will be expected to work Your shifts that are 
                                    already confirmed. If You cancel a shift within 12 hours prior to the start of such 
                                    shift, Your rights to use BookSmart™ may be suspended for a week; however, 
                                    You will be expected to work Your shifts that are already confirmed. 
                                </Text>
                            </View>
                      
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 20 }} />
                                <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop: 10 }}>
                                    If You No Call/No Show a shift, we will confirm with the community that You did 
                                    not show up to Your will be suspended for one week, but expected to work shifts 
                                    that are already confirmed. You will also lose next day pay for this that week. 
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 20 }} />
                                <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop: 10  }}>
                                    If You No Call/No Show a second time, You will be automatically removed from 
                                    the BookSmart™ app. 
                                </Text>
                            </View>
                            <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop: 20 }}>
                                *Note: BookSmart™ is committed to helping You work through any challenges that You 
                                may face regarding scheduling and any potential need to cancel a shift. If You feel that 
                                Your situation is or was unavoidable, and You can provide written documentation such 
                                as a legible doctor’s note or police report to support this cancellation, we will consider 
                                lifting Your suspension on a case-by-case basis. 
                            </Text>
                            
                            <Text style={[styles.text]}>
                                <Text style={{fontWeight: 'bold'}}>(e) No Authorization. </Text>
                                    Users of BookSmart™ acknowledge and agree that they are not 
                                    the agent or representative of BookSmart™ and are not authorized to make any 
                                    representation, contract or commitment on behalf of BookSmart™. 
                                </Text>
                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(f) Qualifications. </Text>
                                    You represent that You are duly licensed (as applicable) and have
                                    the experience, qualifications, and ability to perform each Service Request You accept.
                                </Text>
                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(g) No Employment Relationship. </Text>
                                    In addition to the Terms set forth above, You 
                                    expressly acknowledge and agree that there is no employment, part-time employment, 
                                    consulting, partnership, or joint venture relationship between You and BookSmart™. 
                                    You further agree and acknowledge that BookSmart™ is not an employment service or 
                                    agency and does not secure employment for anyone. You acknowledge and agree that 
                                    You are not entitled to any of the benefits that BookSmart™ makes available to its 
                                    employees and/or officers and/or directors and/or agents, and You hereby waive and 
                                    disclaim any rights to receive any such benefits. You further acknowledge and agree 
                                    that BookSmart™ does not pay any unemployment compensation taxes with respect to 
                                    any provision of any work for any Client. Moreover, You acknowledge and agree that 
                                    You are not entitled to any unemployment compensation benefits chargeable to or 
                                    claimed from BookSmart™ during any period of time that You are partially or fully 
                                    unemployed. You further acknowledge and agree You are not entitled to receive Paid 
                                    Time Off (PTO), Overtime Compensation, Group Health, Short-term Disability 
                                    Insurance, Workers Compensation Benefits, or Retirement Benefits through 
                                    BookSmart™. 
                                </Text>
                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(h) Consent to Text Messages, Notifications, Phone Calls, and Emails. </Text>
                                    You consent 
                                    to text messages, notifications, phone calls, and emails from BookSmart™, or the 
                                    Clients, at the phone number using the contact information provided by You to 
                                    BookSmart™. You are solely responsible for any costs You incur when receiving text 
                                    messages, including any carrier charges that apply for receiving such text messages. 
                                </Text>
                        </View>

                        <View style={styles.titleBar}>
                            <Text style={styles.subTitle}>3. Registration Information.</Text>
                            <Text style={[styles.text, { marginBottom: 0 }]}>
                                <Text style={{fontWeight: 'bold'}}>(a) Maintaining Accuracy. </Text>
                                    You represent and warrant that: If applicable, any license 
                                    numbers (“Licenses”) You provide BookSmart™ is Your Registration Information or 
                                    otherwise are valid; such License(s) will remain in full force for the duration of time in 
                                    which You submit Service Applications for Service Requests requiring any such 
                                    License(s); and You will notify BookSmart™ and all Clients that You have agreed to 
                                    perform future Services for if You: (i) become suspended or barred from practicing in 
                                    any jurisdiction, (ii) lose any of Your License(s), (iii) are facing disciplinary actions, 
                                    including suspension, or (iv) make any changes to Your Registration Information. 
                                </Text>
                            <Text style={[styles.text, {marginTop: 20}]}>
                                <Text style={{fontWeight: 'bold'}}>(b) Verification. </Text>
                                    BookSmart™ will make reasonable efforts to independently verify Your 
                                    Registration Information and any other statements You submit to BookSmart™ for the 
                                    purpose of verifying Your statements are accurate and complete (“Verification 
                                    Purposes”). You hereby authorize BookSmart™, either directly, or indirectly through 
                                    third-party vendors or service providers, to attempt to verify such information, via means 
                                    that may include, without limitation, conducting checks related to Your registration 
                                    and/or license, checks related to Your background, and/or checks with available public 
                                    records for verification purposes. You hereby consent to any collection or use, including 
                                    disclosure in order to complete such verification and agree to provide any 
                                    documentation or information at the request of BookSmart™ to facilitate these 
                                    processes. More about the use of Your personal information can be found at the 
                                    BookSmart™ Privacy Policy available at:
                                <Text style = {{color: '#1a73e8', textDecorationLine: 'underline' }}>{' '}https://www.whybookdumb.com</Text></Text>
                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(c) Background Information. </Text>
                                    Your ability to provide Service Requests is subject to 
                                    successfully passing a background check, drug screen (if required by the Client), which 
                                    will be conducted by a third party and will include identity verification, a global watch list 
                                    registry check, sex offender registry checks, both national and county criminal record 
                                    checks, as permissible under applicable law. BookSmart™ or its third-party contractor 
                                    will provide You with appropriate notice and authorization forms regarding such 
                                    background checks. Additional background checks may be required periodically to 
                                    maintain eligibility to provide Services Requested by the Client. 
                                </Text>
                        </View>

                        <View style={styles.titleBar}>
                            <Text style={styles.subTitle}>4. Payment and Insurance Terms.</Text>
                            <Text style={styles.text}>
                                <Text style={{fontWeight: 'bold'}}>(a) Payment of Fees. </Text>
                                    For each Completed Shift that You perform, You will receive
                                    payment from BookSmart™ no later than the following Friday. In order to facilitate
                                    prompt and accurate payment, You, not BookSmart™, are responsible to input and
                                    update Your current bank account information, including Your bank account number and
                                    bank routing information. You agree that third-party payment processors and
                                    BookSmart™ may transfer to such bank account the Fees owed, with respect to each
                                    Completed Service that You perform. BookSmart™ hereby disclaims all liability related
                                    to errors in fund deposits due to inaccurate or incomplete bank account information.
                                </Text>
                            <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(b) Taxes. </Text>You are solely responsible for all tax returns and payments required to be filed with or made to any federal, state, or local tax authority in connection to performance of Services. Users of BOOKSMART™ are exclusively liable for complying with all applicable federal, state, and local laws, including social security laws governing self-employed individuals. Furthermore, users are exclusively liable for complying with all laws related to payment of taxes, social security, disability, and other contributions based on fees paid to You by BOOKSMART™ in connection with a Completed Service or otherwise received by You through the Service. BOOKSMART™ will not withhold or make payments for taxes, social security, unemployment insurance or disability insurance contributions. BOOKSMART™ will not obtain workers’ compensation insurance (except as described below) on Caregiver’s behalf. Users hereby agree to indemnify and defend BOOKSMART™ against any and all such taxes or contributions, including penalties, interest, attorneys’ fees and expenses. BOOKSMART™ does not offer tax advice to Users.</Text>
                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(c) Fee Bonus. </Text>
                                    Whenever applicable, at Client’s sole discretion, I/Cs will receive a 50%
                                    Fee Bonus for all hours worked in excess of 40 hours at one facility in any given
                                    week. The time cannot be split across multiple facilities. I/Cs shall also receive,
                                    whenever applicable, at Client’s sole discretion, a 50% Fee Bonus for each hour worked
                                    on: New Years Day, Easter Sunday, Memorial Day, Independence Day, Labor Day, 
                                    Thanksgiving Day, and Christmas. The 50% Bonus does not compound so if the holiday
                                    falls on a weekend it will not be counted twice. This is on a per Client basis, as most but
                                    not all Client’s all for Fee Bonuses. Under no circumstances shall a bonus related to
                                    hours over 40 or a bonus associated with working on a holiday be cumulative for the
                                    same hours worked. In instances where hours may qualify for both, only one bonus
                                    shall be applied.
                            </Text>
                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(d) Insurance. </Text>
                                    I/Cs using BookSmart™ are required to carry Workplace Safety
                                    Insurance and Liability Insurance coverage in order to perform Services for any Client.
                                    BookSmart™ has Workplace Safety Insurance in place through accredited insurance
                                    carriers as well as Independent Contractor Liability Insurance (Collectively “Insurance”)
                                    for You to enroll in and take advantage of. Applicants will need to list themselves with
                                    this Insurance coverage from BookSmart™'s insurance carrier(s).
                            </Text>
                            <Text style={[styles.text, {marginTop: 0}]}>
                                <Text style={{fontWeight: 'bold'}}>(e) Service Fee. </Text>
                                    A fee of $2/hour will be deducted for use of BookSmart™ and
                                    processing of payments and insurances (“Service Fee”). Further information about
                                    these insurances and carriers may be available at 
                                    <Text style = {{color : "blue", textDecorationLine: 'underline' }}>{' '}WhyBookDumb.com/Insurance</Text>. By
                                    accessing/using BookSmart™ You consent and agree to these terms.
                            </Text>
                        </View>

                        <View style={styles.titleBar}>
                            <Text style={styles.subTitle}>5. Safety & Work-Related Injury Policy. <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black' }}>Safety is a top priority. Each I/C is expected to obey general safety rules and exercise caution and common sense in all work activities.</Text></Text>
                            <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop : 10 }}>
                                All Independent Contractors must agree to comply with the following safe working
                                practices:
                            </Text>
                            <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop : 10 }}>
                                Agree to follow established departmental safety procedures;
                            </Text>
                            <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop : 10 }}>
                                Agree to know and adhere to all work site specific safety rules and policies;
                            </Text>
                            <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop : 10 }}>
                                Agree to use all site-specific safety equipment provided by facility;
                            </Text>
                            <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop : 10 }}>
                                Agree to report to their facility supervisor any work-related accident or injury to
                                themselves or others as soon as it occurs;
                            </Text>
                            <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop : 10 }}>
                                Agree that if You need medical treatment, You will immediately notify the facility and
                                BookSmart™ and obtain “back to work” paperwork from physician prior to returning to
                                picking up shifts.
                            </Text>
                            <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop : 10 }}>
                                Agree to drug testing as part of any work-related accident and/or injury
                            </Text>
                            <Text style={{ textAlign: 'left', fontSize: RFValue(14), fontWeight: 'normal', color: 'black', marginTop : 10 }}>
                                Failure to follow the above procedures could result in expulsion from usage of
                                BookSmart™ and potential loss of insurance claims.
                            </Text>
                        </View>

                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { }]}>
                                <Text style={{fontWeight: 'bold'}}>6. HIPAA. </Text>
                                Users expressly understand and acknowledge that as a result of the 
                                provision of Caregiver Services using BookSmart™ You may be considered a
                                covered entity under the Health Insurance Portability and Accountability Act 
                                (“HIPAA”). You expressly agree to observe the Privacy, Security, and Breach 
                                Notification Rules set forth under HIPAA. You understand that failure to adhere to 
                                these three HIPAA Rules may result in the imposition of civil, or some cases, 
                                criminal sanctions. 
                            </Text>
                        </View>
                        
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { marginTop: 0 }]}>
                                <Text style={{fontWeight: 'bold'}}>7. Third-Party Beneficiaries. </Text>
                                Users agree that the Terms of this Agreement shall apply 
                                only to You and are not for the benefit of any third-party beneficiaries.
                            </Text>
                        </View>
                        
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { marginTop: 0 }]}>
                                <Text style={{fontWeight: 'bold'}}>8. Attorney’s Fees. </Text>
                                In the event a court of competent jurisdiction determines that any 
                                User has materially breached the Terms under this Agreement, BookSmart™ shall be 
                                entitled to an award of any costs and reasonable attorney’s fees incurred by 
                                BookSmart™ because of such breach.
                            </Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { marginTop: 0 }]}>
                                <Text style={{fontWeight: 'bold'}}>9. Governing Law. </Text>
                                The Terms under this Agreement be construed in accordance with 
                                and governed by the laws of the State of New York, without regard to conflicts of laws 
                                principles. You agree that the exclusive venue for resolving any dispute arising under 
                                this Agreement shall be in the state and federal courts located in the County Erie, State 
                                of New York, and You consent to the jurisdiction of the federal and state courts located 
                                in Erie County, New York. You hereby waive any objection to Erie County, New York as 
                                venue for the hearing of any dispute between You and BookSmart™ that is not 
                                compelled to arbitration for any reason, including but not limited to any objection based 
                                on convenience.
                            </Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { marginTop: 0 }]}>
                                <Text style={{fontWeight: 'bold'}}>10. Indemnification. </Text>
                                BookSmart™ will have no liability and You will indemnify, defend 
                                and hold BookSmart™ harmless against any loss, damage, costs and dibsursements 
                                (including reasonable attorneys’ fees and expenses) arising from any action or claim 
                                resulting from: (i) Your Content; (ii) Your violation of the TERMS under this Agreement, 
                                any law or regulation, or any rights (including Intellectual Property) of another party; (iii) 
                                Your access to or use of BookSmart™; and/or (iv) the classification of an independent 
                                contractor by BookSmart™ or by any Client.
                            </Text>
                        </View>
                        <View style={styles.titleBar}>
                            <Text style={[styles.text, { marginTop: 0 }]}>
                                <Text style={{fontWeight: 'bold'}}>11. Disclaimer of Warranties. </Text>
                            </Text>
                            <Text style={[styles.text, { marginTop: 0 }]}>
                                <Text style={{fontWeight: 'bold'}}>(a) Interactions with Other Users. </Text>
                                    You are solely responsible for Your interactions and
                                    transactions with other Users. You agree to look solely to such other Users for any
                                    claim, damage or liability associated with any communication or transaction via
                                    BookSmart™. You expressly waive and release Booksmart™ from any and all legal
                                    responsibilities, claims, rights of action, causes of action, suits, debts, judgments,
                                    demands, damages and liabilities arising out of any act or omission of any other user or
                                    third party, including damages relating to monetary claims, personal injury or destruction
                                    of property, mental anguish, interest, costs, attorneys’ fees, and expenses. Your sole
                                    remedies with respect thereto shall be between you and the applicable user or other 
                                    third-party. Booksmart™ reserves the right, but has no obligation, to monitor disputes
                                    between users. Booksmart™ is a marketplace service for users to connect online. each
                                    user is solely responsible for interacting with and selecting another user, conducting all
                                    necessary due diligence, and complying with all applicable laws.
                            </Text>
                        </View>

                        <View style={styles.titleBar}>
                            <Text style={[styles.text, {fontWeight: 'bold', marginTop: 0}]}>
                                IMPORTANT! BE SURE YOU HAVE SCROLLED THROUGH AND CAREFULLY 
                                READ ALL of the above Terms and conditions of this Agreement before 
                                electronically signing and/or clicking an “Agree” or similar button and/or USING 
                                THE SITE (“acceptance”). This Agreement is legally binding between You and 
                                Booksmart™. By electronically signing and/or clicking an “Agree” or similar 
                                button and/or using the SITE, You AFFIRM THAT YOU ARE OF THE LEGAL AGE 
                                OF 18 AND HAVE THE LEGAL CAPACITY TO ENTER INTO THE AGREEMENT, AND 
                                YOU agree to abide by all of the Terms stated or referenced herein. If You do not 
                                agree to abide by these Terms, do not electronically sign and/or click an “agree” 
                                or similar button and do not use the SITE. You must accept and abide by these 
                                Terms in the Service Terms as presented to You.
                            </Text>
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
                            {/* <SignatureCapture
                                style={styles.signature}
                                ref={signatureRef}
                                onSaveEvent={onSaveEvent}
                                saveImageFileInExtStorage={false}
                                showNativeButtons={true}
                            /> */}
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
    fontSize: RFValue(14),
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
    color: 'black',
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
    marginVertical: 20,
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
  btn: {flexDirection: 'column',
    gap: 20,
    marginBottom: 30,
  },
  subBtn: {
    marginTop: 0,
    padding: 10,
    backgroundColor: '#A020F0',
    color: 'white',
    fontSize: RFValue(16),
  },
});
  