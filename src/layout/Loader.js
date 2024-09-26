import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const Loader = ({ visible }) => {
    {
        if (visible) {
            return (
                <View style={styles.loaderContainer}>
                    <View style={styles.loaderContent}>
                    <Text style={styles.loaderText}>Processing</Text>
                    <ActivityIndicator size="large" color={"#A020F0"} />
                    </View>
                </View>
            );
        } else {
            return (<></>);
        }
    }
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 9999, // Ensure this is higher than any modal or other component
  },
  loaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    fontSize: 24,
    color: 'white',
    marginRight: 10,
  },
});

export default Loader;
