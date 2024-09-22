import React from 'react';
import { View, ActivityIndicator,Text } from 'react-native';

const Loader = () => (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)',  }}>
        <View style={{alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={{fontSize: 24, color: 'white'}}>Processing</Text>
            <ActivityIndicator size="large" color={"#A020F0"} />
        </View>
    </View>
);

export default Loader;