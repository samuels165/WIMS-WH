import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Header } from 'react-native-elements';
import MainButton from '../../components/MainButton';

const IntroScreen = ({ navigation }) => {
    const navigateToLoginScreen = () => {
        navigation.navigate('LoginScreen');
    };

    return (
      <View style={styles.container}>
        <Image
          source={require("../../obrazky/intro_warehouse.png")}
          style={styles.image}
        />
        <Text style={styles.header}>
          Pomáhame veľkoobchodom jednoduchšie spravovať sklad!
        </Text>
        <Text style={styles.article}>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type.
        </Text>
        <MainButton
          title="Ďalej"
          onPress={navigateToLoginScreen}
          backgroundColor="#818e97"
          textColor="white"
        />
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '60%',
        resizeMode: 'cover',
    },
    article: {
        fontSize: 16,
        padding: 10,
        textAlign: 'left',
        marginBottom: 7,
    },
    header: {
        fontSize: 24,
        padding: 5,
        textAlign: 'left',
        fontWeight: 'bold',
        fontFamily: 'Helvetica',
        marginVertical: 7,
        marginHorizontal: 1.5,
    },
    button: {
        backgroundColor: '#006FFD',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default IntroScreen;
