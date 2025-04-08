import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Image, Alert, Dimensions, TouchableOpacity, Button } from 'react-native';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import SubNavbar from '../../components/SubNavbar';
import { RadioButton } from 'react-native-paper';
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

export default function FacilityPermission ({ navigation }) {
  const [facilityAcknowledgement, setFacilityAcknowledgement] = useAtom(facilityAcknowledgementAtom);
  const items = [
    {label: 'Yes', value: 1},
    {label: 'No', value: 2},
  ];
  const [checked, setChecked] = React.useState('first');
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [credentials, setCredentials] = useState({
    signature: '',
    facilityAcknowledgeTerm: facilityAcknowledgement,
    selectedoption: 'first'
  });
  let signatureRef = useRef(null);

  const onSaveEvent = (result) => {
    console.log('Saved Signature:', result.encoded);
    setCredentials(prevCredentials => ({
      ...prevCredentials, 
      signature: result.encoded
    }));
    setIsSigned(true);
  }

  const handlePreSubmit = () => {
    if (value != 1) {
      return;
    }
    if (!isSigned) {
      Alert.alert('Please sign and click Save button');
      return;
    }
    handleUploadSubmit();
  };

  const handleReset = () => {
    signatureRef.current.resetImage();
    setIsSigned(false);
  }

  const handleUploadSubmit = async () => {
    if (value != 1) {
      return;
    }
    if (!isSigned) {
      Alert.alert('Please sign and click save button');
      return;
    }
    try {
      const response = await Update(credentials, 'facilities');
      if (!response?.error) {
        Alert.alert(
          'Success!',
          "You're in",
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
        setFacilityAcknowledgement(response.user.facilityAcknowledgeTerm)
        navigation.navigate("FacilityProfile")
      } else {
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

  return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <MHeader navigation={navigation} back={true} />
        <SubNavbar navigation={navigation} name={"FacilityLogin"} />
        <ScrollView style={{width: '100%', marginTop: height * 0.22}} showsVerticalScrollIndicator={false}>
          <Hyperlink linkDefault={true}>
            <View style={styles.permission}>
              <View style={styles.titleBar}>
                <Text style={styles.title}>BOOKSMART™ TERMS OF USE</Text>
                <Text style={styles.text}>The Terms of Use (“TERMS” or “Agreement”) established by BookSmart Technologies LLC, a New York Limited Liability Company, (hereinafter BOOKSMART™) and set forth below are agreed to by Client, such entity, including any successors, assigns, and third party beneficiaries) (collectively “You”), and govern your access to and use of the BookSmart™  provisions of services (described below), effective and agreed to by You as of the earlier of the date You click “Accept,” first access or use BOOKSMART™ or otherwise indicate your assent to the Agreement (“Effective Date”). By clicking “Accept” or otherwise using BOOKSMART™ You agree to bound to the TERMS set forth below.</Text>
              </View>
              <View style={styles.titleBar}>
                <Text style={styles.subTitle}>1. Definitions.</Text>
                <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>(a) Independent Contractors, Customers and Facilities. </Text>For purposes of this Agreement, Independent Contractors (I/Cs) are independent third-party providers of services and are willing to provide such services on a short-term basis, with Customers who are independent third-party businesses that seek to engage I/Cs to provide Services. After a Customer posts a Service Request, any I/C may view the posting and choose to indicate his or her availability to provide the services requested by the Customer for the Service Request. You may then review responses from I/Cs indicating availability and determine which I/Cs You wish to engage based on information supplied by the I/C to Customers through the Service.</Text>
                <Text style={[styles.text, {fontWeight: 'bold', marginTop: 0}]}>(b) You, Your, or Users. As used herein, “You,” “Your,” or “Users” alternatively refers to Customers and/or Facilities using BOOKSMART™.</Text>
                <Text style={[styles.text, {fontWeight: 'bold', marginTop: 0}]}>(c) Service Requests. You may post requests for the services (“Service Requests” or “Request for Services”) of one or more I/C’s. The Service Request will contain the nature and type of Services required of the I/C, including a description of the services requested and where and when the services may be performed.</Text>
                <Text style={[styles.text, {fontWeight: 'bold', marginTop: 0}]}>(d) Completed Service. Customers, through BOOKSMART™, can review the responses to Service Requests (“Service Applications”) for posted Service Requests. Customers may decide, at their sole discretion, which Service Applications, if any, they wish to accept for any Service Request. Each Service Application that a Customer has accepted and for which the I/C has fully performed the applicable I/C Services to the satisfaction of the Customer is hereinafter referred to as a “Completed Service.”</Text>
              </View>
              <View style={styles.titleBar}>
                <Text style={styles.subTitle}>2. No Control.</Text>
                <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>(a) Use of This Service. </Text>You retain total and absolute discretion as to when You choose to use BOOKSMART™, submit Service Applications, or otherwise respond to Service Requests. There are no set times or days during which I/Cs are required to use BOOKSMART™ or provide services of any kind to any entity. All Service Requests by Customers are posted through BOOKSMART™ by the Customers, not BOOKSMART™.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(b) Providing Services. </Text>BOOKSMART™ will never: direct or control your interaction(s) with any Service Requests; take any active role in your provision of Requested Services; direct your acts or omissions in connection with any I/Cs; direct I/Cs facility at a given time, for a given shift, or for a set period of time. BOOKSMART™ simply makes Service Requests visible to you, and you retain total and complete control as to when, if ever, to post a shift or otherwise use BOOKSMART™. You and BOOKSMART™ acknowledge and agree that you retain total and complete autonomy to provide other services or otherwise engage in any other business activities, including using software similar to the goods or services provided by competitors of BookSmart™. You and BOOKSMART™ further acknowledge and agree you may provide services to Users without use of BOOKSMART™ and therefore agree that such services are outside the scope of this Agreement.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(c) No Authorization. </Text>Users of BookSmart’s Services acknowledge and agree that they are not the agent or representative of BOOKSMART™ and are not authorized to make any representation, contract or commitment on behalf of BOOKSMART™.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(d) Qualifications. </Text>I/Cs represent that they are duly licensed (as applicable) and have the experience, qualifications, and ability to perform each Request the I/C accepts.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(e) No Reimbursement. </Text>BOOKSMART™ does not reimburse any user for any expenses incurred because of the performance of Services for Customers or Facilities.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(f) No Employment Relationship. </Text>In addition to the Terms set forth above, Facilities expressly acknowledge and agree that there is no employment, part-time employment, consulting, contractor, partnership, or joint venture relationship between I/C and BOOKSMART™. Customers agree that they are not joint employers with BOOKSMART™. Users further agree and acknowledge that BOOKSMART™ is not an employment service or agency and does not secure employment for anyone. Users acknowledge and agree that they are not entitled to any of the benefits that BOOKSMART™ makes available to its employees and/or officers and/or directors and/or agents, and users hereby waive and disclaim any rights to receive any such benefits. Users also acknowledge and agree that BOOKSMART™ does not pay any unemployment compensation taxes with respect to any provision of any work for any Customer or Facility. Users acknowledge and agree that they are not entitled to any unemployment compensation benefits chargeable to or claimed from BOOKSMART™ during any period of time.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(g) Consent to Phone Calls. </Text>Users consent to receiving phone calls from BOOKSMART™, or the Customers or Facilities, at the phone number provided in your registration information for the purpose of communicating information regarding Service Requests. Users are solely responsible for any costs you incur when receiving calls, including any carrier charges that apply for receiving such calls.</Text>
              </View>
              <View style={styles.titleBar}>
                <Text style={styles.subTitle}>3. Payment and Insurance Terms.</Text>
                <Text style={[styles.text, { marginBottom: 20 }]}><Text style={{fontWeight: 'bold'}}>(a) Payment Terms. </Text>For each Completed Requested Service that an I/C performs, BOOKSMART™ will receive from the Customer the I/C's hourly Fees plus applicable Rates and/or Fees as such:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 10 }} />
                  <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>If Customer is a Staffing Agency or Managed Services Provider, that Fee is $5/hour per I/C designated access to and overall use of BookSmart™ for processing of payments and insurances (“Service Fee”).</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ backgroundColor: 'black', width: 4, height: 4, borderRadius: 2, marginHorizontal: 10, marginTop: 10 }} />
                  <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>Customers who are with a direct Facility or Community must choose between the options of:</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start'}}>
                  {/* <View style = {styles.checkboxWrapper}>
                    <RadioButton
                      value="first"
                      status={ checked === 'first' ? 'checked' : 'unchecked' }
                      onPress={() => setChecked('first')}
                    />
                  </View> */}
                  <TouchableOpacity onPress={() => setChecked('first')}>
                    {checked=='first'?(<Image source={images.checkedbtn} style = {{width : 13, height : 13, marginTop: 7, marginRight: 7}}/>):(<Image  source={images.uncheckedbtn} style = {{width : 13, height : 13,  marginTop: 7, marginRight: 7}} />)}
                  </TouchableOpacity>
                  <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>1. Paying Net 7 with a Fee of $7/hour for CNAs, $10/hour for LPNs or $15/hour for RNs for designated access to and use of BOOKSMART™ and processing of payments and insurances (“Service Fee”).
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start'}}>
                  {/* <View style = {styles.checkboxWrapper}> 
                    <RadioButton
                      value="second"
                      status={ checked === 'second' ? 'checked' : 'unchecked' }
                      onPress={() => setChecked('second')}
                    /> 
                  </View> */}
                  <TouchableOpacity onPress={() => setChecked('second')}>
                    {checked=='second'?(<Image source={images.checkedbtn} style = {{width : 13, height : 13,  marginTop: 7, marginRight: 7}}/>):(<Image  source={images.uncheckedbtn} style = {{width : 13, height : 13,  marginTop: 7, marginRight: 7}}/>)}
                  </TouchableOpacity> 
                  <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>2. Paying Net 30 Bill rates set as: $35/hour for CNAs, $55/hour for LPNs, and $75/hour for RNs.</Text>
                </View>
                <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black', marginTop: 20 }}>A 50% Fee increase shall be applied for all hours worked by I/Cs in excess of 40 hours in any given week. Further, a 50% Fee increase shall be applied for any I/C hours worked on: New Years Day, Easter Sunday, Thanksgiving, Memorial Day, Independence Day, Labor Day, and Christmas Day. The Fee increases are non-compoundable so in the case a holiday falls on a weekend you will only be billed the 50% increase for hours over 40.</Text>
                <Text style={{ textAlign: 'left', fontSize: 14, fontWeight: 'normal', color: 'black' }}>BOOKSMART™ shall remit to I/C within a reasonable time of a Service Request for which I/C provided to the Customer being marked as a Completed Service on the Service.</Text>
                <Text style={[styles.text]}><Text style={{fontWeight: 'bold'}}>(b) Taxes. </Text>Users are solely responsible for all tax returns and payments required to be filed with or made to any federal, state, or local tax authority in connection with the performance of Services. Users of BOOKSMART™ are exclusively liable for complying with all applicable federal, state, and local laws, including laws governing self-employed individuals, if applicable. BOOKSMART™ will not withhold or make payments for taxes, social security, unemployment insurance or disability insurance contributions. BOOKSMART™ will not obtain workers’ compensation insurance (except as described below) on I/Cs behalf. Users hereby agree to indemnify and defend BOOKSMART™ against any and all such taxes or contributions, including penalties, interest, attorneys’ fees and expenses. BOOKSMART™ does not offer tax advice to Users.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(c) Insurance. </Text>I/Cs using BOOKSMART™ are required to carry Workplace Safety Insurance and Liability Insurance coverage in order to perform Services for any Customer. BOOKSMART™ has Workplace Safety Insurance in place through accredited insurance carriers as well as Independent Contractor Liability Insurance (Collectively “Insurance”) for you to enroll in and take advantage of. I/Cs will need to obtain this Insurance coverage through insurance carrier(s) of BOOKSMART™. Further information about these insurances and carriers may be available on the www.WhyBookDumb.com. By accessing/using BOOKSMART™ you consent and agree to these Terms.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>4. HIPAA. </Text>Users expressly understand and acknowledge that, as a result of the provision of I/C Services using BOOKSMART™, you may be considered a covered entity under the Health Insurance Portability and Accountability Act (“HIPAA”). You expressly agree to observe the Privacy, Security, and Breach Notification Rules set forth under HIPAA. You understand that failure to adhere to any HIPAA Rules may result in the imposition of civil, or in some cases, criminal sanctions.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>5. Third-Party Beneficiaries. </Text>Users agree that the Terms of this Agreement shall apply only to you and are not for the benefit of any third-party beneficiaries.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>6. Attorney’s Fees. </Text>In the event a court of competent jurisdiction determines that any User has materially breached the Terms under this Agreement, BOOKSMART™ shall be entitled to an award of any costs and reasonable attorney’s fees incurred by BOOKSMART™ as a result of such breach.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>7. Governing Law. </Text>The Terms under this Agreement will be construed in accordance with and governed by the laws of the State of New York, without regard to conflicts of laws principles. You agree that the exclusive venue for resolving any dispute arising under Terms shall be in the state and federal courts located in the County Erie, State of New York, and you consent to the jurisdiction of the federal and state courts located in Erie County, New York. You hereby waive any objection to Erie County, New York as venue for the hearing of any dispute between you and BOOKSMART™ that is not compelled to arbitration for any reason, including but not limited to any objection based on convenience.</Text>
                <Text style={[styles.text, {marginVertical: 0, padding: 0}]}><Text style={{fontWeight: 'bold'}}>8. Indemnification. </Text>BOOKSMART™ will have no liability and you will indemnify, defend and hold BOOKSMART™ harmless against any loss, damage, cost, liability and expense (including reasonable attorneys’ fees and expenses) arising from any action or claim resulting from: (i) Your Content/Data; (ii) Your violation of the Terms under this Agreement, any law or regulation, or any rights (including Intellectual Property) of another party; (iii) Your access to or use of BOOKSMART™; and/or (iv) the classification of You as a Customer or Facility.</Text>
              </View>
              <View style={styles.titleBar}>
                <Text style={styles.subTitle}>9. Disclaimer of Warranties.</Text>
                <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>(a) Service Provided As-Is. </Text>YOUR USE OF BOOKSMART™ IS AT YOUR SOLE RISK. ALL PRODUCTS AND SERVICES PROVIDED UNDER THIS AGREEMENT ARE PROVIDED “AS IS,” “AS AVAILABLE” AND “WITH ALL FAULTS.”  BOOKSMART™, TO THE MAXIMUM EXTENT PERMITTED BY LAW, EXPRESSLY DISCLAIMS ALL WARRANTIES AND REPRESENTATIONS, EXPRESS OR IMPLIED, INCLUDING: (i) THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE; AND (ii) ANY WARRANTY WITH RESPECT TO THE QUALITY, ACCURACY, CURRENCY OR COMPLETENESS OF THE PRODUCTS AND SERVICES PROVIDED UNDER THIS AGREEMENT, OR THAT USE OF SUCH PRODUCTS AND SERVICES WILL BE ERROR-FREE, UNINTERRUPTED, FREE FROM OTHER FAILURES OR WILL MEET YOUR REQUIREMENTS.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(b) Interactions with Other Users. </Text>You are solely responsible for your interactions and transactions with other Users. You agree to look solely to such other Users for any claim, damage or liability associated with any communication or transaction via BOOKSMART™. YOU EXPRESSLY WAIVE AND RELEASE BOOKSMART™ FROM ANY AND ALL legal responsibilities, claims, rights of action, causes of action, suits, debts, judgments, demands, DAMAGES AND LIABILITIES ARISING OUT OF ANY ACT OR OMISSION OF ANY OTHER USER OR THIRD PARTY, INCLUDING DAMAGES RELATING TO MONETARY CLAIMS, PERSONAL INJURY OR DESTRUCTION OF PROPERTY, mental anguish, interest, costs, attorneys’ fees, and expenses. YOUR SOLE REMEDIES WITH RESPECT THERETO SHALL BE BETWEEN YOU AND THE APPLICABLE USER OR OTHER THIRD-PARTY. BOOKSMART™ RESERVES THE RIGHT, BUT HAS NO OBLIGATION, TO MONITOR DISPUTES BETWEEN USERS. BOOKSMART™ IS A MARKETPLACE SERVICE FOR USERS TO CONNECT ONLINE. EACH USER IS SOLELY RESPONSIBLE FOR INTERACTING WITH AND SELECTING ANOTHER USER, CONDUCTING ALL NECESSARY DUE DILIGENCE AND COMPLYING WITH ALL APPLICABLE LAWS.</Text>
              </View>
              <View style={styles.titleBar}>
                <Text style={styles.subTitle}>10. Limitation of Liability.</Text>
                <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>(a) General. </Text>IN NO EVENT WILL BOOKSMART™ BE LIABLE TO YOU FOR ANY INCIDENTAL, INDIRECT, SPECIAL, PUNITIVE OR CONSEQUENTIAL DAMAGES, OR LOST PROFITS OR COSTS OF COVER, INCLUDING DAMAGES ARISING FROM ANY TYPE OR MANNER OF COMMERCIAL, BUSINESS OR FINANCIAL LOSS OCCASIONED BY OR RESULTING FROM ANY USE OF OR INABILITY TO USE BOOKSMART™, SUCH AS ANY MALFUNCTION, DEFECT OR FAILURE OF THE BOOKSMART™ PLATFORM VIA THE INTERNET, OR ANY INACCURACY, INCOMPLETENESS OR OTHER DEFECT IN ANY CONTENT ACCESSIBLE THROUGH BOOKSMART™.</Text>
                <Text style={[styles.text, {marginTop: 0}]}><Text style={{fontWeight: 'bold'}}>(b) Quality of I/C Services. </Text>THE QUALITY OF I/C SERVICES REQUESTED THROUGH THE USE OF BOOKSMART™ IS ENTIRELY THE RESPONSIBILITY OF THE I/Cs WHO PROVIDE SUCH SERVICES. YOU UNDERSTAND AND EXPRESSLY AGREE THAT BY USING BOOKSMART™, YOU MAY BE EXPOSED TO SERVICES THAT ARE POTENTIALLY HARMFUL, UNSAFE, OR OTHERWISE OBJECTIONABLE, AND THAT USE OF THE BOOKSMART™ SERVICES, AND SUCH I/C IS AT CUSTOMERS’ OWN RISK.</Text>
              </View>
              <View style={styles.titleBar}>
                <Text style={[styles.text, {fontWeight: 'bold', marginTop: 0}]}>IMPORTANT! BE SURE YOU HAVE SCROLLED THROUGH AND CAREFULLY READ ALL of the above Terms and Conditions of the Agreement before electronically signing and/or clicking “Agree” or similar button and/or USING THE SITE (“acceptance”). This Agreement is legally binding between you and BOOKSMART™. By electronically signing and/or clicking “Agree” or similar button and/or using the SITE, you AFFIRM THAT YOU ARE OF LEGAL AGE AND HAVE THE LEGAL CAPACITY TO ENTER INTO THE SERVICE AGREEMENT, AND YOU agree to abide by ALL of the Terms and Conditions stated or referenced herein. If you do not agree to abide by these Terms and Conditions, do NOT electronically sign and/or click an “Agree” or similar button and do not use the SITE. You must accept and abide by these Terms and Conditions in the Agreement as presented to you.</Text>
              </View>
              <View style={styles.titleBar}>
                <Text style={[styles.text, {fontWeight: 'bold', marginTop: 0}]}>Facility Acknowledge Terms? Yes/No</Text>
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
                  value={value ? value : items[1].value}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                    if (item.value == 1) {
                      setCredentials({...credentials, ["facilityAcknowledgeTerm"] : true, ["selectedoption"]: checked})
                    } else 
                      setCredentials({...credentials, ["facilityAcknowledgeTerm"] : false, ["selectedoption"]: checked})
                  }}
                  renderLeftIcon={() => (
                    <View
                      style={styles.icon}
                      color={isFocus ? 'blue' : 'black'}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
              </View>
              <View style={styles.titleBar}>
                <Text style={[styles.text, {fontSize: RFValue(12), fontWeight: 'bold', marginTop: 0}]}>Facility Acknowledge Terms Signature <Text style={{color: '#f00'}}>*</Text></Text>
              
                {value == 1 && <View style={styles.titleBar}>
                  <Text style={[styles.text, {fontWeight: 'bold', marginBottom: 5}]}>Signature <Text style={{color: '#f00'}}>*</Text></Text>
                  <SignatureCapture
                      style={styles.signature}
                      ref={signatureRef}
                      onSaveEvent={(result) => onSaveEvent(result)}
                      saveImageFileInExtStorage={false}
                      showNativeButtons={false}
                  />
                    <View style={styles.buttonContainer}>
                      <Button title="Save" onPress={() => signatureRef.current.saveImage()} />
                      <Button title="Reset" onPress={handleReset} />
                    </View>
                  </View>}
              </View>
              <View style={[styles.btn, {marginTop: 20, width: '90%'}]}>
                <HButton style={styles.subBtn} onPress={ handlePreSubmit }>
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
  signature: {
    flex: 1,
    width: '100%',
    height: 150,
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
    fontSize: RFValue(17),
  },
  checkboxWrapper: {
    transform: [{ scale: 0.8}],
    marginTop: -5
  },
  buttonContainer: {
    flexDirection: 'row', // Buttons side by side
    justifyContent: 'space-around', // Add spacing between buttons
    alignItems: 'center', // Align buttons vertically
    marginVertical: 10,
  },
});
  