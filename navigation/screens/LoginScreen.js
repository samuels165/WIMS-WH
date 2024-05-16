import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  Button,
} from "react-native";
import MainButton from "../../components/MainButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [warehousesData, setWarehouses] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [JWT, setJWT] = useState(null);

  const navigateToHomeScreen = () => {
    navigation.navigate("HomeScreen");
  };

  const fetchWarehouses = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken");

      const response = await fetch(
        "http://wims-gateway.azure-api.net/im/Warehouse/getAllWarehouses",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const data = await response.json();
      console.log("Fetched Warehouse data: ", data);

      // Extract warehouse names and IDs
      const options = data.map((warehouse) => ({
        label: warehouse.warehouseName,
        value: warehouse.warehouseId,
      }));
      setWarehouseOptions(options);
      setWarehouses(data);
    } catch (error) {
      console.error("Failed to fetch warehouses", error);
    }
  };

  const handleLogin = async () => {
    try {
      const requestBody = {
        username: username,
        password: password,
      };

      const response = await fetch(
        "http://wims-gateway.azure-api.net/um/User/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("token = ", data.jwtToken);
      let jwtToken = data.jwtToken;

      // Save JWT token to async storage
      setJWT(jwtToken);
      await AsyncStorage.setItem("jwtToken", jwtToken);

      // Fetch warehouses after successful login
      await fetchWarehouses();

      // Show warehouse picker modal
      setIsModalVisible(true);
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert(
        "Login failed",
        "Please check your credentials and try again."
      );
    }
  };

  const handleWarehouseSelection = (itemValue) => {
    setSelectedWarehouse(itemValue);
    AsyncStorage.setItem("selectedWarehouse", itemValue)
      .then(() => {
        console.log("Global variable saved successfully", itemValue);
        setIsModalVisible(false);
        navigateToHomeScreen();
      })
      .catch((error) => {
        console.error("Error saving global variable:", error);
      });
  };

  useEffect(() => {
    console.log("Updated warehouses data: ", warehousesData);
  }, [warehousesData]);

  useEffect(() => {
    console.log("Updated warehouse options: ", warehouseOptions);
  }, [warehouseOptions]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../obrazky/login_warehouse.png")}
        style={styles.image}
      />
      <Text style={styles.header}>
        Pridajte sa k nám a majte prístup k rôznym produktom!
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <MainButton
        title="Prihlásiť sa"
        onPress={handleLogin}
        backgroundColor="#818e97"
        textColor="white"
      />

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Vyberte sklad:</Text>
            {warehouseOptions.length === 0 ? (
              <Text>Loading warehouses...</Text>
            ) : (
              <Picker
                selectedValue={selectedWarehouse}
                onValueChange={(itemValue) => setSelectedWarehouse(itemValue)}
                style={{ height: 50, width: 250, marginBottom: 20 }}
              >
                {warehouseOptions.map((option) => (
                  <Picker.Item
                    label={option.label}
                    value={option.value}
                    key={option.value}
                  />
                ))}
              </Picker>
            )}
            <View style={styles.buttonContainer}>
              <Button
                title="Confirm"
                onPress={() => handleWarehouseSelection(selectedWarehouse)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "40%",
    resizeMode: "cover",
  },
  header: {
    fontSize: 16,
    padding: 5,
    textAlign: "left",
    fontWeight: "bold",
    fontFamily: "Helvetica",
    marginVertical: 7,
    marginHorizontal: 1.5,
  },
  input: {
    width: "80%",
    height: 40,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    height: "50%", // Set the height to 40%
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20,
  },
});

export default LoginScreen;
