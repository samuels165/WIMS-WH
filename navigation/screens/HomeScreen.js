import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from "react-native";
import {
  Button,
  TextInput,
  Provider as PaperProvider,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera/legacy";

// Modal for editing product
const EditProductModal = ({ visible, scannedProduct, onClose, onSave }) => {
  const [productDescription, setProductDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (scannedProduct) {
      setProductDescription(scannedProduct.productDescription || "");
      setPrice(scannedProduct.price ? scannedProduct.price.toString() : "");
      setQuantity(
        scannedProduct.quantity ? scannedProduct.quantity.toString() : ""
      );
    }
  }, [scannedProduct]);

  const handleSave = () => {
    onSave({
      productDescription,
      price: price ? parseFloat(price) : undefined,
      quantity: quantity ? parseInt(quantity, 10) : undefined,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            width: "80%",
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            Edit Product Fields
          </Text>
          <TextInput
            label="Product Description"
            value={productDescription}
            onChangeText={setProductDescription}
            mode="outlined"
          />
          <TextInput
            label="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            mode="outlined"
          />
          <Button
            mode="contained"
            onPress={handleSave}
            style={{ marginTop: 10 }}
          >
            Save Changes
          </Button>
          <Button mode="outlined" onPress={onClose} style={{ marginTop: 10 }}>
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const HomeScreen = () => {
  const [globalVariable, setGlobalVariable] = useState(null);
  const [warehouseName, setWarehouseName] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [warehouseData, setWarehouseData] = useState(null);
  const [isFileInWarehouse, setIsFileInWarehouse] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        setJwtToken(token);

        const savedGlobalVariable = await AsyncStorage.getItem(
          "selectedWarehouse"
        );
        if (savedGlobalVariable !== null) {
          setGlobalVariable(savedGlobalVariable);
          updateWarehouseName(savedGlobalVariable);
        } else {
          console.log("Global variable is not set.");
        }

        const response = await fetch(
          "http://wims-gateway.azure-api.net/im/Warehouse/getAllWarehouses",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setWarehouses(data);
        // console.log("WAREHOUSES", data);
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initialize();
  }, [jwtToken]);

  const fetchWithToken = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${jwtToken}`,
    };
    return fetch(url, { ...options, headers });
  };

  const updateWarehouseName = (warehouseId) => {
    const foundWarehouse = warehouses.find(
      (wh) => wh.warehouseId === warehouseId
    );
    setWarehouseName(
      foundWarehouse ? foundWarehouse.warehouseName : "Unknown Warehouse"
    );
  };

  useEffect(() => {
    if (globalVariable) {
      updateWarehouseName(globalVariable);
    }
  }, [globalVariable, warehouses]);

  const fetchWarehouseData = async (warehouseId) => {
    try {
        const token = await AsyncStorage.getItem("jwtToken");

        const response = await fetch(
          "http://wims-gateway.azure-api.net/im/Warehouse/getAllWarehouses",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data = await response.json();
      setWarehouseData(data);
      // console.log("Warehouse Data:", JSON.stringify(warehouseData, null, 2));
    } catch (error) {
      console.error("Error fetching warehouse data:", error);
    }
  };

  const checkIfProductInWarehouse = () => {
    if (!scannedData || !warehouseData) return;

    let scannedProduct;
    try {
      scannedProduct = JSON.parse(scannedData);
    } catch (error) {
      console.error("Error parsing scanned data:", error);
      return;
    }

    const productName = scannedProduct.productName.trim().toLowerCase();
    const warehouses = warehouseData
      .map((warehouse) => warehouse.warehouseProducts)
      .flat();
    const productFound = warehouses.find(
      (product) => product.productName.trim().toLowerCase() === productName
    );

    setScannedProduct(productFound);
    // console.log("PRODUCT FOUND : ", productFound);
    setIsFileInWarehouse(!!productFound);
  };

  useEffect(() => {
    checkIfProductInWarehouse();
  }, [scannedData, warehouseData]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const handleCancelScan = () => {
    setScanning(false);
    setScannedData(null);
  };

  const handleAddProduct = async () => {
    if (isFileInWarehouse || !scannedData) {
      Alert.alert(
        "Operation Denied",
        "Scan product before and make sure it's not in the warehouse before hitting Add button!"
      );
      return;
    }

    const quantity = await new Promise((resolve) => {
      Alert.prompt("Enter Quantity", "Enter the quantity:", (input) => {
        resolve(parseInt(input, 10));
      });
    });

    const price = await new Promise((resolve) => {
      Alert.prompt("Enter Price", "Enter the price:", (input) => {
        resolve(parseFloat(input));
      });
    });

    let data = JSON.parse(scannedData);
    const products = [
      {
        productName: data.productName,
        productDescription: data.productDescription,
        price,
        quantity,
        categoryId: data.categoryId,
      },
    ];

    const body = {
      warehouseId: globalVariable,
      products,
    };

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await fetch(
        "http://wims-gateway.azure-api.net/im/Warehouse/addProducts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        setIsFileInWarehouse(true);
        Alert.alert("Success", "Product added successfully");
      } else {
        Alert.alert("Error", "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", "Failed to add product");
    }
  };

  const handleEditProduct = async (updatedFields) => {
    if (!isFileInWarehouse) {
      return;
    }

    let data = JSON.parse(scannedData);
    const product = {
      id: scannedProduct.id,
      productName: data.productName,
      ...updatedFields,
      categoryId: data.categoryId,
    };
    console.log("product edit : ", product);
    console.log("GV = ", globalVariable);
    const body = {
      warehouseId: globalVariable,
      product,
    };
    console.log("body edit : ", body);

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      console.log("token : ", token);
      const response = await fetch(
        "http://wims-gateway.azure-api.net/im/Warehouse/updateProductInfo",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        Alert.alert("Product edited successfully!");
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
    setScannedData(null);
    setIsFileInWarehouse(false);
    setScannedProduct(false);
  };

  const handleDeleteProduct = async () => {
    if (!isFileInWarehouse) {
      Alert.alert(
        "Operation Denied",
        "Product must be in the warehouse for deletion."
      );
      return;
    }

    const body = {
      warehouseId: globalVariable,
      products: [{ id: scannedProduct.id }],
    };

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await fetch(
        "http://wims-gateway.azure-api.net/im/Warehouse/deleteProductFromWarehouse",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Product deleted successfully");
        setIsFileInWarehouse(false);
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      Alert.alert("Error", "Failed to delete product");
    }
    setScannedData(null);
    setIsFileInWarehouse(false);
    setScannedProduct(false);
  };

  return (
    <PaperProvider>
      <View style={{ flex: 1, backgroundColor: "#cedde4" }}>
        {scanning ? (
          <View style={{ flex: 1 }}>
            <Camera
              onBarCodeScanned={({ data }) => {
                setScannedData(data);
                fetchWarehouseData(globalVariable);
                setScanning(false);
              }}
              barcodeScannerSettings={{
                barCodeTypes: ["qr"],
              }}
              style={{ flex: 1 }}
            />
            <Button
              mode="contained"
              onPress={handleCancelScan}
              style={{ backgroundColor: "#818e97" }}
            >
              Back
            </Button>
          </View>
        ) : (
          <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
            <View
              style={{
                backgroundColor: "#F0F0F0",
                padding: 15,
                borderRadius: 8,
                marginTop: 10,
                elevation: 2,
                marginTop: 30,
                marginBottom: 30,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                {warehouseName}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setScanning(true)}>
              <Image
                source={require("../../obrazky/qr_1.png")}
                style={{ width: 360, height: 350, marginLeft: -10 }}
              />
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: "#F0F0F0",
                padding: 15,
                borderRadius: 8,
                marginTop: 10,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: isFileInWarehouse ? "#4CAF50" : "#F44336",
                }}
              >
                {scannedData
                  ? isFileInWarehouse
                    ? "Product is in warehouse"
                    : "Product is not in warehouse"
                  : "Scan label first"}
              </Text>
              <Text style={{ fontSize: 16, color: "#333", marginTop: 5 }}>
                {scannedProduct
                  ? "Product name: " + scannedProduct.productName
                  : ""}
              </Text>
              <Text style={{ fontSize: 16, color: "#333", marginTop: 5 }}>
                {scannedProduct ? "Quantity: " + scannedProduct.quantity : ""}
              </Text>
              <Text style={{ fontSize: 16, color: "#333", marginTop: 5 }}>
                {scannedProduct ? "Price: $" + scannedProduct.price : ""}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <Button
                mode="contained"
                onPress={handleAddProduct}
                style={{ flex: 1, marginRight: 2, backgroundColor: "#818e97" }}
              >
                Add Product
              </Button>
              <Button
                mode="contained"
                onPress={() =>
                  isFileInWarehouse
                    ? setIsEditModalVisible(true)
                    : Alert.alert(
                        "Operation Denied",
                        "Scan product before and make sure it's in the warehouse before hitting edit button!"
                      )
                }
                style={{ flex: 1, marginLeft: 2, backgroundColor: "#818e97" }}
              >
                Edit Product
              </Button>
            </View>
            <Button
              mode="contained"
              onPress={handleDeleteProduct}
              style={{
                marginTop: 20,
                width: "100%",
                backgroundColor: "#818e97",
              }}
            >
              Delete Product
            </Button>
          </View>
        )}
        <EditProductModal
          visible={isEditModalVisible}
          scannedProduct={scannedProduct}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleEditProduct}
        />
      </View>
    </PaperProvider>
  );
};

export default HomeScreen;
