import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";

const ForecastComp = ({ forecastData, onForecastPress }) => {
  const formattedTime = new Date(forecastData.dateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <TouchableOpacity onPress={() => onForecastPress(forecastData)}>
      <View
        style={{
          backgroundColor: "#56ACC8",
          padding: 13,
          borderRadius: 5,
          margin: 5,
          alignItems: "center",
          justifyContent: "center",
          width: 84,
        }}
      >
        {forecastData ? (
          <>
            <Text style={{ color: "white", fontSize: 16 }}>
              {formattedTime}
            </Text>
            <Image
              source={{ uri: "https:" + forecastData.iconUrl }}
              style={{ width: 40, height: 40 }}
            />
            <Text style={{ color: "white", fontSize: 18 }}>
              {forecastData.temperature}°C
            </Text>
          </>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default function MenuScreen({ navigation }) {
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
}
