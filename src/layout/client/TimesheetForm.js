import React from 'react';
import { View, StyleSheet, StatusBar, Dimensions, Text } from 'react-native';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import { WebView } from 'react-native-webview';

export default function TimesheetForm ({ navigation }) {
    const handleBack = () => {
        navigation.navigate('MyHome');
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            <MHeader navigation={navigation} />
            <WebView
                originWhitelist={['*']}
                source={{ uri: 'https://form.jotform.com/242875749430163' }}
                style={styles.webView}
            />
            <Text style={{textDecorationLine: 'underline', color: '#2a53c1', marginBottom: 100, textAlign: 'left', width: '90%'}}
              onPress={handleBack}
            >
              Back to 🏚️ Caregiver Home
            </Text>
            <MFooter />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%'
    },
    webView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Dimensions.get('window').height * 0.15,
        marginBottom: 20,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});
  