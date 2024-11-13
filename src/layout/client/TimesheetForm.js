import React from 'react';
import { View, StyleSheet, StatusBar, Dimensions } from 'react-native';
import MFooter from '../../components/Mfooter';
import MHeader from '../../components/Mheader';
import { WebView } from 'react-native-webview';

export default function TimesheetForm ({ navigation }) {

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            <MHeader navigation={navigation} />
            <WebView
                originWhitelist={['*']}
                source={{ uri: 'https://form.jotform.com/242875749430163' }}
                style={styles.webView}
            />
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
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});
  