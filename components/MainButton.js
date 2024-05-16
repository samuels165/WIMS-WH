import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const MainButton = ({ title, onPress, backgroundColor, textColor }) => {
    return (
        <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onPress}>
            <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        width: 350,
    },
    buttonText: {
        fontSize: 18,
        textAlign: 'center',
    },
});

export default MainButton;
