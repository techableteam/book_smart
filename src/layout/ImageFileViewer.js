import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Text, Image } from 'react-native';
import Pdf from 'react-native-pdf';

export default function ImageFileViewer({ navigation, route }) {
    const { url, type, name } = route.params;


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { fontWeight: 'normal' }]} onPress={() => navigation.goBack()}>{"Back"}</Text>
                <Text style={[styles.headerTitle, { width: '70%' }]}>{name}</Text>
                <Text></Text>
            </View>
            {type === 'pdf' ? (
                <Pdf
                    source={{ uri: url }}
                    style={styles.pdf}
                    trustAllCerts={false}
                />
            ) : (
                <Image
                    source={{ uri: url }}
                    style={styles.webView}
                    resizeMode="contain"
                />
            )}
            {/* <Loader visible={loading} /> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        paddingTop: 100
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black'
    }
});
