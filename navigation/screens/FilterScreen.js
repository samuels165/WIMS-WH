import * as React from 'react';
import { View, Text } from 'react-native';

export default function FilterScreen({ navigation }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text
                onPress={() => alert('This is the "Filter" screen.')}
                style={{ fontSize: 26, fontWeight: 'bold' }}>Filter Screen</Text>
        </View>
    );
}