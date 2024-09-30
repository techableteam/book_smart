import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import Pdf from 'react-native-pdf';
import { useFocusEffect } from '@react-navigation/native';
import { getUserImage } from '../utils/useApi';
import Loader from './Loader';

export default function UserFileViewer({ navigation, route }) {
    const { userId, filename } = route.params;
    const [htmlContent, setHtmlContent] = useState('');
    const [fileInfo, setFileInfo] = useState({ content: '', type: '', name: '' });
    const [loading, setLoading] = useState(false);

    const getData = async () => {
        setLoading(true);
        console.log(userId);
        let result = await getUserImage({ userId, filename }, 'clinical');
        console.log(result);
        if (!result?.error) {
            const fetchedFileInfo = result;
            let content = '';

            if (fetchedFileInfo.type === 'pdf') {
                setFileInfo(fetchedFileInfo);
            } else if (fetchedFileInfo.type === 'image') {
                content = `
                    <html>
                    <body style="margin: 0; padding: 0;">
                        <img src="data:image/jpeg;base64,${fetchedFileInfo.content}" style="display: block; margin-left: auto; margin-right: auto; width: 80%;"/>
                    </body>
                    </html>
                `;
                setHtmlContent(content);
                setFileInfo(fetchedFileInfo);
            } else {
                content = `
                    <html>
                        <body style="margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100%;">
                            <p>No valid file type found.</p>
                        </body>
                    </html>
                `;
                setHtmlContent(content);
            }
        } else {
            setHtmlContent(`
                <html>
                    <body>
                        <p>Error fetching the file.</p>
                    </body>
                </html>
            `);
        }
        setLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            getData();
        }, [])
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { fontWeight: 'normal' }]} onPress={() => navigation.goBack()}>{"Back"}</Text>
                <Text style={[styles.headerTitle, { width: '70%' }]}>{fileInfo.name}</Text>
                <Text></Text>
            </View>
            {fileInfo.type === 'pdf' ? (
                <Pdf
                    source={{ uri: `data:application/pdf;base64,${fileInfo.content}` }}
                    style={styles.pdf}
                />
            ) : (
                <WebView
                    originWhitelist={['*']}
                    source={{ html: htmlContent }}
                    style={styles.webView}
                />
            )}
            <Loader visible={loading} />
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
