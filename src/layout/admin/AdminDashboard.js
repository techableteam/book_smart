import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import MFooter from '../../components/Mfooter';
import AHeader from '../../components/Aheader';
import SubNavbar from '../../components/SubNavbar';
import { Table, Row, Rows } from 'react-native-table-component';
import { GetDashboardData } from '../../utils/useApi';
import { useFocusEffect } from '@react-navigation/native';
import AnimatedHeader from '../AnimatedHeader';
import Loader from '../Loader';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

export default function AdminDashboard ({ navigation }) {
  const [jobInfo, setJobInfo] = useState([
    {title: 'TOT. - JOBS / SHIFTS', content: 0},
    {title: 'TOT. - AVAILABLE', content: 0},
    {title: 'TOT. - AWARDED', content: 0},
    {title: 'TOT. - COMPLETED', content: 0},
    {title: 'TOT. - CANCELED', content: 0},
  ]);

  const [tableData1, setTableData1] = useState([]);
  const [tableData2, setTableData2] = useState([]);
  const [tableData3, setTableData3] = useState([]);
  const [sum1,setSum1] = useState(0);
  const [sum2, setSum2] = useState(0);
  const [sum3,setSum3] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const getData = async () => {
    setLoading(true);
    let data = await GetDashboardData('jobs', 'Admin');
    if(data) {
      const newTableData1 = data.job.map(item => [item._id, item.count]);
      setTableData1(newTableData1); // Update state
      const newTableData2 = data.nurse.map(item => [item._id, item.count]);
      setTableData2(newTableData2); // Update state
      const newTableData3 = data.cal.map(item => [item._id, item.count]);
      setTableData3(newTableData3); // Update state

      let s1=0;
      let s2=0;
      let s3=0;

      data.job.map((item, index) => {
        s1 += item.count;
      });

      data.nurse.map((item, index) => {
        s2 += item.count;
      });

      data.cal.map((item, index) => {
        s3 += item.count;
      });

      let totalAvailableJobCnt = 0;
      let totalAwardedJobCnt = 0;
      let totalCompletedJobCnt = 0;
      let totalCancelledJobCnt = 0;

      if (newTableData1.length > 0) {
        newTableData1.forEach((item) => {
          if (item[0] == 'Available') {
            totalAvailableJobCnt = item[1];
          } else if (item[0] == 'Awarded') {
            totalAwardedJobCnt = item[1]
          } else if (item[0] == 'Paid') {
            totalCompletedJobCnt = item[1];
          } else if (item[0] == 'Cancelled') {
            totalCancelledJobCnt = item[1];
          }
        });
      }

      setJobInfo([
        {title: 'TOT. - JOBS / SHIFTS', content: s1},
        {title: 'TOT. - AVAILABLE', content: totalAvailableJobCnt},
        {title: 'TOT. - AWARDED', content: totalAwardedJobCnt},
        {title: 'TOT. - COMPLETED', content: totalCompletedJobCnt},
        {title: 'TOT. - CANCELED', content: totalCancelledJobCnt},
      ]);

      setSum1(s1)
      setSum2(s2)
      setSum3(s3)
    }
    setLoading(false);
  }
  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  const tableDatas = [
    {
      title: 'JOBS / SHIFTS BY STATUS',
      header: [
        'Job Status',
        'Count',
      ],
      data: tableData1,
      final: ['Sum',sum1],
    },
    {
      title: 'JOBS / SHIFTS BY NURSE',
      header: [
        'Nurse',
        'Count',
      ],
      data: tableData2,
      final: ['Sum',sum2],
    },
    {
      title: 'JOBS / SHIFTS BY MONTH',
      header: [
        'Month',
        'Count',
      ],
      data: tableData3,
      final: ['Sum',sum3],
    }
  ]

  return (
      <View style={styles.container}>
        <StatusBar 
            translucent backgroundColor="transparent"
        />
        <AHeader navigation={navigation} currentPage={0} />
        <SubNavbar navigation={navigation} name={"AdminLogin"}/>
        <ScrollView style={{width: '100%', marginTop: height * 0.25}}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topView}>
            <AnimatedHeader title="ADMIN DASHBOARD" />
            <View style={styles.bottomBar}/>
          </View>
          <View style={{paddingVertical: 40, backgroundColor: '#c6c5c5', marginTop: 20, width: '80%', marginLeft: '10%', borderRadius: 10}}>
            {
              jobInfo.map((item, index) => 
                <View key={index} style={{flexDirection: 'column', alignItems: 'center'}}>
                  <Text style={styles.titles}>{item.title}</Text>
                  <Text style={styles.content}>
                    {item.content}
                  </Text>
                </View>
              )
            }
          </View>
          {tableDatas.map((item, index)=> 
            <View key={index} style={{paddingVertical: 40, backgroundColor: '#c6c5c5', marginTop: 20, width: '80%', marginLeft: '10%', borderRadius: 10, display: 'flex', alignItems:'center'}}>
              <View style={styles.profileTitleBg}>
                <Text style={styles.profileTitle}>{item.title}</Text>
              </View>
              <Text style={styles.Italic}>"Click On Any Value To View Details"</Text>
              <View>
                <Table borderStyle={{ borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.08)', width: 300, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Row
                    data={item.header}
                    style={styles.head}
                    widthArr={[200,80]}
                    textStyle={styles.tableText}
                  />
                  <Rows
                    data={item.data}
                    widthArr={[200,80]}
                    style = {{backgroundColor: '#E2E2E2', color: 'black'}}
                    textStyle = {styles.tableText}
                  />
                  <Row
                    data={item.final}
                    style={styles.head}
                    widthArr={[200,80]}
                    textStyle={styles.tableText}
                  />
                </Table>
              </View>
            </View>
          )}
          <View style = {{height: 100}}/>
        </ScrollView>
        <Loader visible={loading} />
        <MFooter />
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    width: '100%'
  },
  topView: {
    marginTop: 30,
    marginLeft: '10%',
    width: '80%',
    flexDirection: 'column',
    justifyContent:'center',
    alignItems: 'center'
  },
  backTitle: {
    backgroundColor: 'black',
    width: '90%',
    height: '55',
    marginLeft: '5%',
    marginTop: 10,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
    color: 'black',
    top: 10
  },
  title: {
    fontSize: RFValue(18),
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
    backgroundColor: 'transparent',
    paddingVertical: 10
  },
  bottomBar: {
    marginTop: 30,
    height: 5,
    backgroundColor: '#4f70ee1c',
    width: '100%'
  },
  titles: {
    fontWeight: 'bold',
    fontSize: RFValue(14),
    lineHeight: 30,
    textAlign: 'center',
    color: 'white',
    padding: 5,
    width: '70%',
    backgroundColor: "#2243f3", 
    borderRadius: 10
  },
  content: {
    fontSize: RFValue(16),
    lineHeight: 40,
  },
  profileTitleBg: {
    backgroundColor: '#BC222F',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    // marginLeft: '10%',
    marginBottom: 20
  },
  profileTitle: {
    fontSize: RFValue(12),
    fontWeight: 'bold',
    color: 'white',
  },
  Italic: {
    fontStyle: 'italic',
    color: '#0000ff',
    fontSize: RFValue(12),
    marginBottom: 20, 
  },
  head: {
    backgroundColor: '#7be6ff4f',
    // width: 2000,
    height: 40,
  },
  tableText: {
    paddingHorizontal: 10,
    fontWeight: 'bold',
    width: '100%',
    color: 'black',
    textAlign: 'center'
  }
});
  