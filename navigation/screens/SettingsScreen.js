import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const SettingsScreen = ({ navigation }) => {
  const fetchData = async () => {
    const dataApiUrl =
      "https://pdv-zp-backend.azurewebsites.net/Clothes/GetClothes";
    const dataRequest = {
      data1: currentForecast.temperature,
    };
  };
  return (
    <View>
      <Text>Holla</Text>
    </View>
  );
};

export default SettingsScreen;
